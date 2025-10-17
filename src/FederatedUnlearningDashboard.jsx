import React, { useState, useEffect } from "react";
import {
  Activity,
  Database,
  Trash2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Server,
  Settings,
  ShieldCheck,
  Scale,
} from "lucide-react";

/**
 * If you later have a backend, set VITE_API_URL in .env and post the config below
 * to `${import.meta.env.VITE_API_URL}/run` or similar.
 */
export default function FederatedUnlearningDashboard() {
  // ---------- NEW: Experiment configuration state ----------
  const [dataset, setDataset] = useState("CIFAR-10");
  const [attack, setAttack] = useState({
    type: "duplication",           // duplication | label_poison | backdoor (example future types)
    duplicateRatio: 10,            // % of duplicates to inject
    strategy: "random",            // random | class_skewed | client_skewed
    targetClass: "auto",           // auto | airplane | car | bird | ...
    clientsAffected: 50            // % of clients to affect
  });
  const [gdpr, setGdpr] = useState({
    subjectId: "",
    unlearningMode: "certified",   // certified | hard_delete
    dpEnabled: false,
    epsilon: 8,                    // DP epsilon if dpEnabled
    retentionDays: 30,             // auto-delete after N days
    auditLog: true                 // keep an audit trail of requests
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [unlearningProgress, setUnlearningProgress] = useState(0);
  const [isUnlearning, setIsUnlearning] = useState(false);

  // Simulated node data
  const [nodes] = useState([
    { id: 1, name: "Node Alpha", status: "active", dataPoints: 15420, unlearned: 0, region: "US-East", duplicateRatio: 0.08 },
    { id: 2, name: "Node Beta", status: "active", dataPoints: 12850, unlearned: 0, region: "EU-West",  duplicateRatio: 0.12 },
    { id: 3, name: "Node Gamma", status: "syncing", dataPoints: 18200, unlearned: 0, region: "Asia-Pacific", duplicateRatio: 0.05 },
    { id: 4, name: "Node Delta", status: "active", dataPoints: 9750,  unlearned: 0, region: "US-West", duplicateRatio: 0.10 },
    { id: 5, name: "Node Epsilon", status: "active", dataPoints: 13600, unlearned: 0, region: "EU-North", duplicateRatio: 0.07 },
  ]);

  const [metrics, setMetrics] = useState({
    totalNodes: 5,
    activeNodes: 4,
    totalDataPoints: 69820,
    unlearningRequests: 23,
    modelAccuracy: 94.2,
    privacyScore: 98.5,
  });

  // Progress simulation
  useEffect(() => {
    if (isUnlearning && unlearningProgress < 100) {
      const t = setTimeout(() => setUnlearningProgress((p) => Math.min(p + 2, 100)), 100);
      return () => clearTimeout(t);
    } else if (unlearningProgress >= 100) {
      const t = setTimeout(() => {
        setIsUnlearning(false);
        setUnlearningProgress(0);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [isUnlearning, unlearningProgress]);

  const startUnlearning = () => {
    setIsUnlearning(true);
    setUnlearningProgress(0);
  };

  // ---------- NEW: Apply configuration (ready for backend wiring) ----------
  const applyAndStart = async () => {
    // Example payload you can send to your backend
    const payload = { dataset, attack, gdpr, timestamp: new Date().toISOString() };
    console.log("APPLY CONFIG:", payload);

    // Uncomment when backend is ready:
    // try {
    //   const api = import.meta.env.VITE_API_URL;
    //   const res = await fetch(`${api}/run`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });
    //   const next = await res.json();
    //   setMetrics((m) => ({ ...m, ...next.metrics }));
    // } catch (e) {
    //   console.error(e);
    // }

    // Start simulated unlearning
    startUnlearning();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Federated Unlearning Dashboard
          </h1>
          <p className="text-slate-300">
            Configure dataset, attack parameters, and GDPR controls. Run experiments and visualise live metrics.
          </p>
        </div>

        {/* ---------- NEW: Control Panel Row ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Dataset */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Database className="text-blue-400" />
              <h3 className="font-semibold">Dataset</h3>
            </div>
            <label className="block text-sm text-slate-300 mb-2">Select dataset</label>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
            >
              <option>MNIST</option>
              <option>CIFAR-10</option>
              <option>CIFAR-100</option>
            </select>
            <p className="text-xs text-slate-400 mt-2">
              Changing the dataset will reconfigure class lists and sample sizes for the run.
            </p>
          </div>

          {/* Attack Parameters */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
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
                  <option value="label_poison">Label Poison (future)</option>
                  <option value="backdoor">Backdoor (future)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Duplicate ratio (%)</label>
                <input
                  type="number" min="0" max="90" step="1"
                  value={attack.duplicateRatio}
                  onChange={(e) => setAttack({ ...attack, duplicateRatio: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Clients affected (%)</label>
                <input
                  type="number" min="1" max="100" step="1"
                  value={attack.clientsAffected}
                  onChange={(e) => setAttack({ ...attack, clientsAffected: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Strategy</label>
                <select
                  value={attack.strategy}
                  onChange={(e) => setAttack({ ...attack, strategy: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                >
                  <option value="random">Random</option>
                  <option value="class_skewed">Class-skewed</option>
                  <option value="client_skewed">Client-skewed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Target class</label>
                <select
                  value={attack.targetClass}
                  onChange={(e) => setAttack({ ...attack, targetClass: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                >
                  <option value="auto">Auto</option>
                  <option value="airplane">airplane</option>
                  <option value="car">car</option>
                  <option value="bird">bird</option>
                  <option value="cat">cat</option>
                  <option value="deer">deer</option>
                  <option value="dog">dog</option>
                  <option value="frog">frog</option>
                  <option value="horse">horse</option>
                  <option value="ship">ship</option>
                  <option value="truck">truck</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">For MNIST, classes map to digits 0–9; for CIFAR-100, this list would be extended.</p>
              </div>
            </div>
          </div>

          {/* GDPR Parameters */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="text-emerald-400" />
              <h3 className="font-semibold">GDPR Parameters</h3>
            </div>

            <label className="block text-sm text-slate-300 mb-2">Data subject ID (optional)</label>
            <input
              type="text"
              placeholder="e.g., req-2025-10-07-001"
              value={gdpr.subjectId}
              onChange={(e) => setGdpr({ ...gdpr, subjectId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm mb-3"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Unlearning mode</label>
                <select
                  value={gdpr.unlearningMode}
                  onChange={(e) => setGdpr({ ...gdpr, unlearningMode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                >
                  <option value="certified">Certified</option>
                  <option value="hard_delete">Hard delete</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Retention (days)</label>
                <input
                  type="number" min="0" max="365" step="1"
                  value={gdpr.retentionDays}
                  onChange={(e) => setGdpr({ ...gdpr, retentionDays: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2 mt-1">
                <input
                  id="dpEnabled"
                  type="checkbox"
                  checked={gdpr.dpEnabled}
                  onChange={(e) => setGdpr({ ...gdpr, dpEnabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="dpEnabled" className="text-sm text-slate-300">Enable Differential Privacy</label>
              </div>

              <div className={`${gdpr.dpEnabled ? "" : "opacity-50"} transition`}>
                <label className="block text-sm text-slate-300 mb-2">DP epsilon</label>
                <input
                  type="number" min="0.1" step="0.1"
                  disabled={!gdpr.dpEnabled}
                  value={gdpr.epsilon}
                  onChange={(e) => setGdpr({ ...gdpr, epsilon: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm disabled:cursor-not-allowed"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <input
                  id="auditLog"
                  type="checkbox"
                  checked={gdpr.auditLog}
                  onChange={(e) => setGdpr({ ...gdpr, auditLog: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="auditLog" className="text-sm text-slate-300">Keep audit log for this request</label>
              </div>
            </div>
          </div>
        </div>

        {/* Apply & Start */}
        <div className="mb-8">
          <button
            onClick={applyAndStart}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 px-5 rounded-lg font-medium"
          >
            <ShieldCheck size={18} />
            Apply & Start Run
          </button>
          <p className="text-xs text-slate-400 mt-2">This posts your configuration to the backend (console logged in demo mode).</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Server className="text-purple-400" size={24} />
              <span className="text-2xl font-bold">{metrics.totalNodes}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Nodes</p>
            <p className="text-green-400 text-xs mt-1">{metrics.activeNodes} active</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Database className="text-blue-400" size={24} />
              <span className="text-2xl font-bold">{metrics.totalDataPoints.toLocaleString()}</span>
            </div>
            <p className="text-slate-400 text-sm">Data Points</p>
            <p className="text-blue-400 text-xs mt-1">Distributed</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-green-400" size={24} />
              <span className="text-2xl font-bold">{metrics.modelAccuracy}%</span>
            </div>
            <p className="text-slate-400 text-sm">Model Accuracy</p>
            <p className="text-green-400 text-xs mt-1">+2.3% from baseline</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-pink-400" size={24} />
              <span className="text-2xl font-bold">{metrics.privacyScore}%</span>
            </div>
            <p className="text-slate-400 text-sm">Privacy Score</p>
            <p className="text-pink-400 text-xs mt-1">GDPR Config Aware</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-slate-700">
          {["overview", "nodes", "unlearning"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-all ${activeTab === tab ? "text-purple-400 border-b-2 border-purple-400" : "text-slate-400 hover:text-white"}`}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">System Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400">Active Nodes</h3>
                  {nodes.map((node) => (
                    <div key={node.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{node.name}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${node.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                        >
                          {node.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        <p>{node.dataPoints.toLocaleString()} data points</p>
                        <p className="text-xs mt-1">{node.region}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">System Health</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Network Latency</span>
                        <span className="text-green-400">42ms</span>
                      </div>
                      <div className="bg-slate-900 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Synchronization</span>
                        <span className="text-blue-400">92%</span>
                      </div>
                      <div className="bg-slate-900 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "92%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Privacy Compliance</span>
                        <span className="text-purple-400">98%</span>
                      </div>
                      <div className="bg-slate-900 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "98%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "nodes" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Node Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4">Node</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Data Points</th>
                      <th className="text-left py-3 px-4">Duplication</th>
                      <th className="text-left py-3 px-4">Region</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((node) => (
                      <tr key={node.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-4 px-4 font-medium">{node.name}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${node.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                            {node.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">{node.dataPoints.toLocaleString()}</td>
                        <td className="py-4 px-4">{Math.round(node.duplicateRatio * 100)}%</td>
                        <td className="py-4 px-4">{node.region}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "unlearning" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Unlearning Operations</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Initiate Unlearning</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Remove specific data points from the federated model while preserving overall model performance.
                    </p>
                    <button
                      onClick={startUnlearning}
                      disabled={isUnlearning}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                    >
                      <Trash2 size={18} />
                      <span>{isUnlearning ? "Unlearning in Progress..." : "Start Unlearning Process"}</span>
                    </button>
                  </div>

                  {isUnlearning && (
                    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                      <h3 className="text-lg font-semibold mb-4">Progress</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Unlearning Progress</span>
                          <span className="text-purple-400">{unlearningProgress}%</span>
                        </div>
                        <div className="bg-slate-900 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${unlearningProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Recent Requests</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Request #1847</span>
                        <CheckCircle size={18} className="text-green-400" />
                      </div>
                      <p className="text-sm text-slate-400">2,340 data points removed</p>
                      <p className="text-xs text-slate-500 mt-1">Completed 2 hours ago</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Request #1846</span>
                        <CheckCircle size={18} className="text-green-400" />
                      </div>
                      <p className="text-sm text-slate-400">1,120 data points removed</p>
                      <p className="text-xs text-slate-500 mt-1">Completed 5 hours ago</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Request #1845</span>
                        <AlertTriangle size={18} className="text-yellow-400" />
                      </div>
                      <p className="text-sm text-slate-400">Processing verification</p>
                      <p className="text-xs text-slate-500 mt-1">Started 8 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Activity size={14} />
            <span>Demo mode: config is printed to console. Point to your API with VITE_API_URL.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
