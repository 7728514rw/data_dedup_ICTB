import { useState, useEffect, useRef } from "react";
import { Lock, User, Eye, EyeOff, Database, Settings, Scale, ShieldCheck } from "lucide-react";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const App = () => {
  // --- Auth & basic UI ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // --- Config state ---
  const [dataset, setDataset] = useState("CIFAR-10");
  const [attack, setAttack] = useState({
    type: "duplication",
    duplicateRatio: 10,
    strategy: "random",
    targetClass: "auto",
    clientsAffected: 50,
  });
  const [gdpr, setGdpr] = useState({
    subjectId: "",
    unlearningMode: "certified",
    dpEnabled: false,
    epsilon: 8,
    retentionDays: 30,
    auditLog: true,
  });

  // --- Dashboard state ---
  const [metrics, setMetrics] = useState({
    totalNodes: 0,
    activeNodes: 0,
    totalDataPoints: 0,
    unlearningRequests: 0,
    modelAccuracy: 0,
    privacyScore: 0,
  });
  const [health, setHealth] = useState({ latencyMs: 42, syncPct: 92, privacyPct: 98 });
  const [nodes, setNodes] = useState([]);

  // --- Run state ---
  const [isUnlearning, setIsUnlearning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [resultSummary, setResultSummary] = useState(null);
  const [resultPairs, setResultPairs] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");

  // --- History (for demo/report) ---
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dedup_history") || "[]"); }
    catch { return []; }
  });

  // --- Streaming helpers ---
  const sseRef = useRef(null);
  const pollRef = useRef(null);

  // ========== Helpers ==========
  function cancelStreams() {
    try { sseRef.current?.close?.(); } catch {}
    sseRef.current = null;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function persistHistory(next) {
    setHistory(next);
    try { localStorage.setItem("dedup_history", JSON.stringify(next.slice(-10))); } catch {}
  }

  function parseJobId(resp, data) {
    // tolerant: body, alt keys, or header
    const bodyId =
      data?.job_id || data?.jobId || data?.id || data?.job || data?.["job-id"];
    const headerId = resp.headers.get("x-job-id");
    return bodyId || headerId || null;
  }

  // ========== API ==========
  async function reloadKPIs() {
    try {
      const r = await fetch(`${API_URL}/api/kpis`);
      if (!r.ok) throw new Error(`kpis ${r.status}`);
      const d = await r.json();
      setMetrics((prev) => ({
        totalNodes: d.total_nodes ?? prev.totalNodes,
        activeNodes: d.active_nodes ?? prev.activeNodes ?? d.total_nodes ?? 0,
        totalDataPoints: d.total_data_points ?? prev.totalDataPoints,
        unlearningRequests: d.unlearning_requests ?? prev.unlearningRequests,
        modelAccuracy: d.model_accuracy ?? prev.modelAccuracy,
        privacyScore: d.privacy_score ?? prev.privacyScore,
      }));
    } catch (e) {
      console.warn("reloadKPIs", e);
    }
  }

  async function reloadNodes() {
    try {
      const r = await fetch(`${API_URL}/api/nodes`);
      const list = await r.json();
      setNodes(Array.isArray(list) ? list : []);
    } catch (e) {
      console.warn("reloadNodes", e);
    }
  }

  async function reloadHealth() {
    try {
      const r = await fetch(`${API_URL}/api/health`);
      const d = await r.json();
      setHealth({
        latencyMs: d.latency_ms ?? 42,
        syncPct: d.sync_pct ?? 92,
        privacyPct: d.privacy_pct ?? 98,
      });
    } catch (e) {
      console.warn("reloadHealth", e);
    }
  }

  async function handleDatasetChange(value) {
    setDataset(value);
    try {
      await fetch(`${API_URL}/api/datasets/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
    } catch {}
    await Promise.all([reloadKPIs(), reloadNodes(), reloadHealth()]);
  }

  async function uploadCsv(file) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API_URL}/api/upload`, { method: "POST", body: fd });
      if (!r.ok) throw new Error(`upload ${r.status}`);
      await Promise.all([reloadKPIs(), reloadNodes(), reloadHealth()]);
      setError("");
    } catch (e) {
      console.warn(e);
      setError("Upload failed. CSV must include a data_subject_id column.");
    }
  }

  async function runExperiment() {
    try {
      cancelStreams();
      // reset UI
      setResultSummary(null);
      setResultPairs([]);
      setProgress(0);
      setShowResults(true);
      setIsUnlearning(true);
      setError("");

      const payload = { dataset, attack, gdpr };
      const resp = await fetch(`${API_URL}/api/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(`run ${resp.status}`);

      let data = null;
      try { data = await resp.json(); } catch { data = {}; }
      const id = parseJobId(resp, data);
      if (!id) {
        console.error("/api/run returned no job id", data);
        setError("Backend didn't return a job id. Check server logs.");
        setIsUnlearning(false);
        return;
      }
      setJobId(id);

      // Prefer SSE
      const progressUrl = new URL(`${API_URL}/api/progress`);
      progressUrl.searchParams.set("job_id", id);

      try {
        const es = new EventSource(progressUrl.toString());
        sseRef.current = es;

        es.addEventListener("progress", (e) => {
          const pct = Math.max(0, Math.min(100, Number(e.data) || 0));
          setProgress(pct);
        });

        es.addEventListener("complete", async () => {
          es.close();
          sseRef.current = null;
          await fetchAndFinish(id);
        });

        es.onerror = async (evt) => {
          console.warn("SSE error, switching to polling", evt);
          es.close();
          sseRef.current = null;
          // Fallback polling
          startPolling(id);
        };
      } catch (e) {
        console.warn("SSE init failed, fallback to polling", e);
        startPolling(id);
      }
    } catch (e) {
      console.warn(e);
      setIsUnlearning(false);
      setError("Run failed. See console/server logs for details.");
    }
  }

  function startPolling(id) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const pr = await fetch(`${API_URL}/api/progress?job_id=${encodeURIComponent(id)}`);
        if (!pr.ok) return;
        const txt = await pr.text();
        // Expect plain percent or small JSON; be tolerant
        const m = String(txt).match(/(\d+(\.\d+)?)/);
        if (m) setProgress(Math.max(0, Math.min(100, Number(m[1]))));
        if (/complete/i.test(txt)) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          await fetchAndFinish(id);
        }
      } catch (e) {
        console.warn("poll error", e);
      }
    }, 600);
  }

  async function fetchAndFinish(id) {
    try {
      const rr = await fetch(`${API_URL}/api/results?job_id=${encodeURIComponent(id)}`);
      if (!rr.ok) throw new Error(`results ${rr.status}`);
      const results = await rr.json();

      setResultSummary(results.summary || null);
      setResultPairs(Array.isArray(results.sample_pairs) ? results.sample_pairs : []);
      setDownloadUrl(results.download ? `${API_URL}${results.download}` : "");

      // push into history
      const histItem = {
        ts: new Date().toISOString(),
        jobId: id,
        dataset: results.dataset_name || dataset,
        before: results.summary?.before_records ?? null,
        after: results.summary?.after_records ?? null,
        removed: results.summary?.removed ?? null,
        reduction: results.summary?.reduction_pct ?? null,
        downloadUrl: results.download ? `${API_URL}${results.download}` : "",
      };
      persistHistory([...history, histItem]);

      setIsUnlearning(false);
      await Promise.all([reloadKPIs(), reloadNodes(), reloadHealth()]);
    } catch (err) {
      console.warn("results fetch failed", err);
      setError("Couldn't fetch results from backend.");
      setIsUnlearning(false);
    }
  }

  // --- Auth ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "securepass2025") {
      setIsAuthenticated(true);
      setError("");
      setTimeout(() => {
        reloadKPIs();
        reloadNodes();
        reloadHealth();
      }, 50);
    } else setError("Invalid username or password");
  };
  useEffect(() => setError(""), [username, password]);

  // Cleanup on unmount
  useEffect(() => () => cancelStreams(), []);

  const applyAndStart = async () => {
    setIsUnlearning(true);
    await runExperiment();
  };

  // ========== UI ==========
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6 text-purple-300">Federated Unlearning Login</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Username</label>
              <div className="relative">
                <input
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 pr-10 text-white"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-medium">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-3xl font-bold">Federated Unlearning Dashboard</h1>
          <div className="text-sm text-slate-300 ml-4">Backend: {API_URL}</div>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setUsername("");
              setPassword("");
            }}
            className="ml-auto bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {/* Config cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Dataset */}
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Database className="text-blue-400" />
              <h3 className="font-semibold">Dataset</h3>
            </div>
            <label className="block text-sm text-slate-300 mb-2">Select dataset</label>
            <select
              value={dataset}
              onChange={(e) => handleDatasetChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
            >
              <option>MNIST</option>
              <option>CIFAR-10</option>
              <option>CIFAR-100</option>
              <option>Phishing-URLs</option>
              <option>Windows-EventLog</option>
              <option>NSL-KDD sample</option>
            </select>
            <div className="mt-4">
              <label className="block text-sm text-slate-300 mb-2">Or upload CSV</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && uploadCsv(e.target.files[0])}
                className="w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              <p className="text-xs text-slate-400 mt-1">
                CSV must include <code>data_subject_id</code>.
              </p>
            </div>
          </div>

          {/* Attack */}
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="text-amber-400" />
              <h3 className="font-semibold">Attack Parameters</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm text-slate-300 mb-2">Attack type</label>
                <select
                  value={attack.type}
                  onChange={(e) => setAttack({ ...attack, type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                >
                  <option value="duplication">Duplication</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Duplicate ratio (%)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  step="1"
                  value={attack.duplicateRatio}
                  onChange={(e) =>
                    setAttack({ ...attack, duplicateRatio: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Clients affected (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={attack.clientsAffected}
                  onChange={(e) =>
                    setAttack({ ...attack, clientsAffected: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-300 mb-2">Target class</label>
                <select
                  value={attack.targetClass}
                  onChange={(e) => setAttack({ ...attack, targetClass: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                >
                  <option value="auto">Auto</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                </select>
              </div>
            </div>
          </div>

          {/* GDPR */}
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="text-emerald-400" />
              <h3 className="font-semibold">GDPR Parameters</h3>
            </div>
            <label className="block text-sm text-slate-300 mb-2">Data subject ID (optional)</label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm mb-3"
              placeholder="e.g., subj-000123"
              value={gdpr.subjectId}
              onChange={(e) => setGdpr({ ...gdpr, subjectId: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Unlearning mode</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                  value={gdpr.unlearningMode}
                  onChange={(e) => setGdpr({ ...gdpr, unlearningMode: e.target.value })}
                >
                  <option value="certified">Certified</option>
                  <option value="hard_delete">Hard delete</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Retention (days)</label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                  value={gdpr.retentionDays}
                  onChange={(e) =>
                    setGdpr({ ...gdpr, retentionDays: Number(e.target.value) })
                  }
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  id="auditLog"
                  type="checkbox"
                  checked={gdpr.auditLog}
                  onChange={(e) => setGdpr({ ...gdpr, auditLog: e.target.checked })}
                />
                <label htmlFor="auditLog" className="text-sm text-slate-300">
                  Keep audit log
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Run */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={applyAndStart}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 py-3 px-5 rounded-lg font-medium"
            disabled={isUnlearning}
          >
            <ShieldCheck size={18} /> {isUnlearning ? "Running…" : "Apply & Start Run"}
          </button>
          {isUnlearning && (
            <>
              <span className="text-sm text-slate-300">Progress: {progress}%</span>
              {jobId && <span className="text-xs text-slate-400">Job: {jobId}</span>}
            </>
          )}
          {!isUnlearning && jobId && (
            <span className="text-xs text-slate-400">Last job: {jobId}</span>
          )}
        </div>

        {/* KPI / Nodes / Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
            <h3 className="font-semibold mb-2">KPIs</h3>
            <div className="text-sm space-y-1">
              <div>Total nodes: {metrics.totalNodes ?? 0}</div>
              <div>Active nodes: {metrics.activeNodes ?? 0}</div>
              <div>Total data points: {metrics.totalDataPoints ?? 0}</div>
              <div>Model accuracy: {metrics.modelAccuracy?.toFixed?.(2) ?? metrics.modelAccuracy}%</div>
              <div>Privacy score: {metrics.privacyScore}%</div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
            <h3 className="font-semibold mb-2">Health</h3>
            <div className="text-sm space-y-1">
              <div>Latency: {health.latencyMs} ms</div>
              <div>Sync: {health.syncPct}%</div>
              <div>Privacy: {health.privacyPct}%</div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
            <h3 className="font-semibold mb-2">Nodes</h3>
            <div className="text-sm space-y-2 max-h-48 overflow-auto">
              {nodes.map((n) => (
                <div key={n.id} className="flex justify-between border-b border-slate-700 pb-1">
                  <span>{n.name}</span>
                  <span>
                    {n.data_points} pts • dup~{(n.duplicate_ratio * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
              {!nodes.length && <div className="text-slate-400">No nodes</div>}
            </div>
          </div>
        </div>

        {/* Run History */}
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-5">
          <h3 className="font-semibold mb-3">Run History (last 10)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-300">
                <tr>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Job</th>
                  <th className="text-left py-2">Dataset</th>
                  <th className="text-right py-2">Before</th>
                  <th className="text-right py-2">Removed</th>
                  <th className="text-right py-2">After</th>
                  <th className="text-right py-2">Reduction</th>
                  <th className="text-left py-2">Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {history.length === 0 && (
                  <tr>
                    <td className="py-2 text-slate-400" colSpan={8}>
                      No runs yet.
                    </td>
                  </tr>
                )}
                {history
                  .slice()
                  .reverse()
                  .map((h, idx) => (
                    <tr key={`${h.jobId}-${idx}`}>
                      <td className="py-2">{new Date(h.ts).toLocaleString()}</td>
                      <td className="py-2 font-mono">{h.jobId?.slice(0, 8)}…</td>
                      <td className="py-2">{h.dataset || dataset}</td>
                      <td className="py-2 text-right">{h.before ?? "-"}</td>
                      <td className="py-2 text-right">{h.removed ?? "-"}</td>
                      <td className="py-2 text-right">{h.after ?? "-"}</td>
                      <td className="py-2 text-right">
                        {h.reduction != null ? `${h.reduction}%` : "-"}
                      </td>
                      <td className="py-2">
                        {h.downloadUrl ? (
                          <a href={h.downloadUrl} className="text-teal-300 underline">
                            CSV
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Drawer */}
        <ResultsPanel
          open={showResults}
          onClose={() => setShowResults(false)}
          summary={resultSummary}
          pairs={resultPairs}
          downloadUrl={downloadUrl}
          progress={progress}
          jobId={jobId}
          dataset={dataset}
        />

        {/* Error banner */}
        {error && (
          <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 max-w-xl bg-red-900/70 border border-red-700 text-red-100 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Results Drawer ---
const ResultsPanel = ({ open, onClose, summary, pairs, downloadUrl, progress, jobId, dataset }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-[900px] max-h-[85vh] overflow-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Deduplication Results</h2>
            <div className="text-xs text-slate-400">
              {dataset ? `Dataset: ${dataset}` : ""} {jobId ? `• Job: ${jobId}` : ""}
            </div>
          </div>
          <button onClick={onClose} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600">
            Close
          </button>
        </div>

        {!summary && (
          <div className="mb-6">
            <div className="text-sm text-slate-300 mb-2">Running… {progress}%</div>
            <div className="w-full h-2 bg-slate-800 rounded">
              <div
                className="h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {summary && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Stat label="Before" value={summary.before_records} />
              <Stat label="After" value={summary.after_records} />
              <Stat label="Removed" value={`${summary.removed} (${summary.reduction_pct}%)`} />
              <Stat label="Method" value={`exact:${summary.removed_exact} • fuzzy:${summary.removed_fuzzy}`} />
            </div>

            {downloadUrl && (
              <div className="mb-4">
                <a href={downloadUrl} className="text-teal-300 underline">
                  Download deduped CSV
                </a>
              </div>
            )}

            <h3 className="text-lg font-medium mb-2">Top duplicate pairs</h3>
            <div className="rounded-lg border border-slate-700 divide-y divide-slate-800">
              {(pairs || []).map((p, i) => (
                <div key={i} className="p-3 text-sm flex gap-3">
                  <span className="text-slate-400">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="font-mono">{p.i_text}</div>
                    <div className="font-mono text-slate-400">{p.j_text}</div>
                  </div>
                  <div className="text-right text-teal-300">{p.similarity}%</div>
                </div>
              ))}
              {(!pairs || pairs.length === 0) && (
                <div className="p-3 text-slate-400">No fuzzy duplicates detected.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="rounded-lg bg-slate-800/60 p-3">
    <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);

export default App;
