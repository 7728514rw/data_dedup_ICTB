import { useState, useEffect, useRef } from "react";
import { Lock, User, Eye, EyeOff, Database, Settings, Scale, ShieldCheck, Info, FileText } from "lucide-react";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const DATASET_CLASSES = {
  MNIST: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  "CIFAR-10": ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"],
  "CIFAR-100": [],
  "NSL-KDD sample": ["benign", "attack"],
  "NSL-KDD": ["benign", "DoS", "Probe", "R2L", "U2R"],
  "Phishing-URLs": ["legit", "phishing"],
  "Windows-EventLog": ["auth", "process", "network", "registry", "file"],
  "Firewall-Alerts": ["low", "medium", "high", "critical"],
  "AWS-CloudTrail": ["CreateUser", "DeleteAccessKey", "StopInstances", "CreateBucket"],
  "Darkweb-Credentials": ["stolen", "verified"],
};

const PRESETS = [
  { label: "Light", duplicateRatio: 5, clientsAffected: 25, strategy: "random" },
  { label: "Clustered", duplicateRatio: 10, clientsAffected: 30, strategy: "by_client" },
  { label: "Targeted", duplicateRatio: 8, clientsAffected: 15, strategy: "by_class" },
  { label: "Flood", duplicateRatio: 20, clientsAffected: 80, strategy: "burst" },
];

const Hint = ({ text }) => (
  <span className="ml-1 text-slate-400" title={text}>
    <Info size={14} className="inline align-[-2px]" />
  </span>
);

const SliderNumber = ({ value, min, max, step = 1, onChange }) => (
  <div className="flex items-center gap-3">
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-purple-500"
    />
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-20 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-right"
    />
    <span className="text-slate-400 text-sm">%</span>
  </div>
);

function estimateImpact(totalPoints, duplicatePct, clientsPct, totalNodes = 8) {
  totalPoints = Number(totalPoints) || 0;
  const dup = Math.round(totalPoints * (duplicatePct / 100));
  const clients = Math.max(1, Math.round((totalNodes || 1) * (clientsPct / 100)));
  return {
    injected: dup,
    clients,
    totalAfterInjection: totalPoints + dup,
  };
}

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
  const [uploadedCsvName, setUploadedCsvName] = useState("");
  const [uploadedCsvFile, setUploadedCsvFile] = useState(null);
  const [useUploadedCsv, setUseUploadedCsv] = useState(false);

  // --- History (for demo/report) ---
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dedup_history") || "[]"); }
    catch { return []; }
  });

  // --- Streaming helpers ---
  const sseRef = useRef(null);
  const pollRef = useRef(null);
  const uploadInputRef = useRef(null);

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
    if (useUploadedCsv) setUseUploadedCsv(false);
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
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API_URL}/api/upload`, { method: "POST", body: fd });
      if (!r.ok) throw new Error(`upload ${r.status}`);
      await Promise.all([reloadKPIs(), reloadNodes(), reloadHealth()]);
      setError("");
      setUploadedCsvName(file.name);
      setUploadedCsvFile(file);
      setUseUploadedCsv(true);
    } catch (e) {
      console.warn(e);
      setError("Upload failed. CSV must include a data_subject_id column.");
    }
  }

  async function handleUploadedToggle(next) {
    if (!uploadedCsvFile) return;
    if (!next) {
      setUseUploadedCsv(false);
      await handleDatasetChange(dataset);
      return;
    }
    if (!useUploadedCsv && next) {
      await uploadCsv(uploadedCsvFile);
    }
  }

  async function clearUploadedCsv() {
    if (useUploadedCsv) {
      setUseUploadedCsv(false);
      await handleDatasetChange(dataset);
    }
    setUploadedCsvFile(null);
    setUploadedCsvName("");
    if (uploadInputRef.current) uploadInputRef.current.value = "";
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

  const totalNodes = metrics.totalNodes ?? 0;
  const activeNodes = metrics.activeNodes ?? 0;
  const activePct = totalNodes ? Math.round((activeNodes / totalNodes) * 100) : 0;
  const totalDataPoints = metrics.totalDataPoints ?? 0;
  const modelAccuracy = metrics.modelAccuracy ?? 0;
  const privacyScore = metrics.privacyScore ?? 0;

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
              disabled={useUploadedCsv}
              onChange={(e) => handleDatasetChange(e.target.value)}
              className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm ${
                useUploadedCsv ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <option>MNIST</option>
              <option>CIFAR-10</option>
              <option>CIFAR-100</option>
              <option>Phishing-URLs</option>
              <option>Windows-EventLog</option>
              <option>NSL-KDD sample</option>
              <option>Firewall-Alerts</option>
              <option>AWS-CloudTrail</option>
              <option>Darkweb-Credentials</option>
            </select>
            {useUploadedCsv && (
              <p className="text-xs text-purple-300 mt-1">
                Using uploaded CSV. Uncheck below to switch datasets.
              </p>
            )}
            <div className="mt-4">
              <label className="block text-sm text-slate-300 mb-2">Or upload CSV</label>
              <input
                type="file"
                accept=".csv"
                ref={uploadInputRef}
                onChange={(e) => e.target.files?.[0] && uploadCsv(e.target.files[0])}
                className="w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                  checked={useUploadedCsv}
                  disabled={!uploadedCsvFile}
                  onChange={(e) => handleUploadedToggle(e.target.checked)}
                />
                <span>Use uploaded CSV (overrides dropdown)</span>
              </div>
              {uploadedCsvName && (
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-2 text-slate-200">
                    <FileText size={18} className="text-slate-400" />
                    {uploadedCsvName}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-red-300 hover:text-red-200 underline"
                    onClick={clearUploadedCsv}
                  >
                    Remove
                  </button>
                </div>
              )}
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

            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setAttack({ ...attack, ...p })}
                  className="px-3 py-1 rounded-lg border border-slate-600 text-sm hover:bg-slate-700"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="col-span-2">
                <label className="block text-sm text-slate-300 mb-2">
                  Attack type
                  <Hint text="Simulate duplication attacks by injecting repeated rows across clients/classes." />
                </label>
                <select
                  value={attack.type}
                  onChange={(e) => setAttack({ ...attack, type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                >
                  <option value="duplication">Duplication</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Strategy
                  <Hint text="Random spreads evenly, by-client clusters nodes, by-class targets a label, burst floods many clients." />
                </label>
                <select
                  value={attack.strategy}
                  onChange={(e) => setAttack({ ...attack, strategy: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                >
                  <option value="random">Random</option>
                  <option value="by_client">By client</option>
                  <option value="by_class">By class</option>
                  <option value="burst">Burst</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Clients affected (%) <Hint text="Percent of nodes compromised." />
                </label>
                <SliderNumber
                  value={attack.clientsAffected}
                  min={1}
                  max={100}
                  onChange={(v) => setAttack({ ...attack, clientsAffected: v })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Duplicate ratio (%) <Hint text="How much of the dataset gets duplicated before deduping." />
                </label>
                <SliderNumber
                  value={attack.duplicateRatio}
                  min={0}
                  max={90}
                  onChange={(v) => setAttack({ ...attack, duplicateRatio: v })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Target class
                  <Hint
                    text={
                      attack.strategy === "by_class"
                        ? "Choose which label to duplicate heavily."
                        : "Only active when Strategy = By class."
                    }
                  />
                </label>
                {(() => {
                  const names = DATASET_CLASSES[dataset] || [];
                  const disabled = attack.strategy !== "by_class";
                  const options =
                    names.length > 0
                      ? names
                      : Array.from({ length: 10 }, (_, i) => String(i));
                  return (
                    <select
                      disabled={disabled}
                      value={attack.targetClass}
                      onChange={(e) => setAttack({ ...attack, targetClass: e.target.value })}
                      className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm ${
                        disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="auto">Auto</option>
                      {options.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>
            </div>

            <AttackEstimate
              total={metrics.totalDataPoints}
              nodes={metrics.totalNodes}
              duplicateRatio={attack.duplicateRatio}
              clientsAffected={attack.clientsAffected}
            />
          </div>

          {/* GDPR */}
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="text-emerald-400" />
              <h3 className="font-semibold">GDPR Parameters</h3>
            </div>
            <label className="block text-sm text-slate-300 mb-2">
              Data subject ID (optional)
              <Hint text="Use a subject identifier to simulate DSAR processing. Required for hard delete." />
            </label>
            <input
              className={`w-full bg-slate-900 border rounded-lg p-2 text-sm mb-2 ${
                gdpr.unlearningMode === "hard_delete" && !gdpr.subjectId ? "border-red-600" : "border-slate-700"
              }`}
              placeholder="e.g., subj-000123"
              value={gdpr.subjectId}
              onChange={(e) => setGdpr({ ...gdpr, subjectId: e.target.value })}
              pattern="^([A-Za-z0-9_-]{3,64}|subj-\\d{3,})$"
              title="3–64 chars, letters/digits/_-/ or subj-######"
            />
            {gdpr.unlearningMode === "hard_delete" && !gdpr.subjectId && (
              <div className="text-xs text-red-400 mb-2">Subject ID is required for hard delete.</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Unlearning mode
                  <Hint text="Certified removes influence with proofs; Hard delete purges rows immediately." />
                </label>
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
                <label className="block text-sm text-slate-300 mb-2">
                  Retention (days)
                  <Hint text="How long checkpoints/logs remain before purging. Set 0 to purge immediately." />
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                    value={gdpr.retentionDays}
                    onChange={(e) => setGdpr({ ...gdpr, retentionDays: Number(e.target.value) })}
                  />
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[0, 7, 30, 90, 365].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setGdpr({ ...gdpr, retentionDays: d })}
                        className={`px-2 py-1 rounded border ${
                          gdpr.retentionDays === d ? "border-emerald-400 text-emerald-300" : "border-slate-600"
                        } hover:bg-slate-700`}
                      >
                        {d === 0 ? "0 (purge now)" : d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Differential privacy
                    <Hint text="Adds noise to metrics to prevent re-identification." />
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="dpEnabled"
                      type="checkbox"
                      checked={gdpr.dpEnabled}
                      onChange={(e) => setGdpr({ ...gdpr, dpEnabled: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="dpEnabled" className="text-sm text-slate-300">
                      Enable DP
                    </label>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm mb-2 ${gdpr.dpEnabled ? "text-slate-300" : "text-slate-500"}`}>
                    ε (epsilon)
                  </label>
                  <div className={gdpr.dpEnabled ? "" : "opacity-50"}>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={gdpr.epsilon}
                      disabled={!gdpr.dpEnabled}
                      onChange={(e) => setGdpr({ ...gdpr, epsilon: Number(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                    <div className="text-right text-xs text-slate-400 mt-1">ε = {gdpr.epsilon}</div>
                  </div>
                </div>
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
                {gdpr.auditLog && <span className="text-xs text-slate-400">IDs are hashed in logs.</span>}
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-400 space-y-1">
              <div>
                {gdpr.unlearningMode === "hard_delete" ? (
                  <>
                    Hard delete{" "}
                    {gdpr.subjectId ? (
                      <>
                        for <span className="text-slate-200">{gdpr.subjectId}</span>
                      </>
                    ) : (
                      <>requires a subject ID</>
                    )}
                    .
                  </>
                ) : (
                  <>
                    Certified unlearning
                    {gdpr.subjectId && (
                      <>
                        {" "}
                        for <span className="text-slate-200">{gdpr.subjectId}</span>
                      </>
                    )}
                    .
                  </>
                )}
              </div>
              <div>
                Retention: <span className="text-slate-200">{gdpr.retentionDays} days</span>. DP:{" "}
                <span className="text-slate-200">{gdpr.dpEnabled ? `on (ε=${gdpr.epsilon})` : "off"}</span>. Audit log:{" "}
                <span className="text-slate-200">{gdpr.auditLog ? "enabled (hashed IDs)" : "disabled"}</span>.
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
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              KPIs
              <span className="text-xs text-slate-400">Live federation metrics</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-900/60 rounded-lg p-3">
                <div className="text-xs uppercase tracking-wide text-slate-400">Nodes</div>
                <div className="text-2xl font-semibold">{totalNodes}</div>
                <div className="mt-2 text-slate-400 text-xs">Active {activeNodes}</div>
                <div className="mt-1 h-1.5 bg-slate-800 rounded-full">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                    style={{ width: `${Math.min(100, activePct)}%` }}
                  />
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-3">
                <div className="text-xs uppercase tracking-wide text-slate-400">Data points</div>
                <div className="text-2xl font-semibold">{totalDataPoints.toLocaleString()}</div>
                <div className="mt-2 text-slate-400 text-xs">Across federation</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-3">
                <div className="text-xs uppercase tracking-wide text-slate-400">Model accuracy</div>
                <div className="text-2xl font-semibold">{modelAccuracy.toFixed(2)}%</div>
                <div className="mt-2 text-emerald-300 text-xs">Post-dedupe estimate</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-3">
                <div className="text-xs uppercase tracking-wide text-slate-400">Privacy score</div>
                <div className="text-2xl font-semibold">{privacyScore}%</div>
                <span className="inline-flex mt-2 text-xs px-2 py-1 rounded-full bg-purple-600/20 text-purple-200">
                  GDPR ready
                </span>
              </div>
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

const AttackEstimate = ({ total, nodes, duplicateRatio, clientsAffected }) => {
  const est = estimateImpact(total, duplicateRatio, clientsAffected, nodes);
  return (
    <div className="mt-3 text-xs text-slate-400">
      Estimated impact (pre-dedup): inject ≈{" "}
      <span className="text-slate-200">{est.injected.toLocaleString()}</span> duplicate rows across ≈{" "}
      <span className="text-slate-200">{est.clients}</span> clients → temporary size ≈{" "}
      <span className="text-slate-200">{est.totalAfterInjection.toLocaleString()}</span>.
    </div>
  );
};

const ResultBreakdown = ({ before, after, removed }) => {
  const total = Math.max(1, Number(before) || 1);
  const removedPct = Math.min(100, Math.max(0, (Number(removed) || 0) / total * 100));
  const remainingPct = 100 - removedPct;
  return (
    <div className="mb-6">
      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Visual breakdown</div>
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
        <div
          className="bg-gradient-to-r from-red-500 to-orange-400"
          style={{ width: `${removedPct}%` }}
          title={`Removed ${removedPct.toFixed(1)}%`}
        />
        <div
          className="bg-emerald-500/60 flex-1"
          style={{ width: `${remainingPct}%` }}
          title={`Remaining ${remainingPct.toFixed(1)}%`}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{removed?.toLocaleString?.() || removed} removed</span>
        <span>{after?.toLocaleString?.() || after} remaining</span>
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
            <div className="grid grid-cols-4 gap-4 mb-4">
              <Stat label="Before" value={summary.before_records} />
              <Stat label="After" value={summary.after_records} />
              <Stat label="Removed" value={`${summary.removed} (${summary.reduction_pct}%)`} />
              <Stat label="Method" value={`exact:${summary.removed_exact} • fuzzy:${summary.removed_fuzzy}`} />
            </div>
            <ResultBreakdown
              before={summary.before_records}
              after={summary.after_records}
              removed={summary.removed}
            />

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
