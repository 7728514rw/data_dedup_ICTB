import { useState, useEffect } from "react";
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

export default function FederatedUnlearningDashboard() {
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

  const [activeTab, setActiveTab] = useState("overview");
  const [unlearningProgress, setUnlearningProgress] = useState(0);
  const [isUnlearning, setIsUnlearning] = useState(false);
  const [showGdprPolicy, setShowGdprPolicy] = useState(false);
  const [showAttackExplanation, setShowAttackExplanation] = useState(false);

  const [nodes] = useState([
    { id: 1, name: "VIC", status: "active", dataPoints: 15420, unlearned: 0, region: "Melbourne", duplicateRatio: 0.08 },
    { id: 2, name: "NSW", status: "active", dataPoints: 12850, unlearned: 0, region: "Sydney", duplicateRatio: 0.12 },
    { id: 3, name: "QLD", status: "syncing", dataPoints: 18200, unlearned: 0, region: "Gold Coast", duplicateRatio: 0.05 },
    { id: 4, name: "NT", status: "active", dataPoints: 9750, unlearned: 0, region: "Darwin", duplicateRatio: 0.10 },
    { id: 5, name: "WA", status: "active", dataPoints: 13600, unlearned: 0, region: "Perth", duplicateRatio: 0.07 },
  ]);

  const [metrics, setMetrics] = useState({
    totalNodes: 5,
    activeNodes: 4,
    totalDataPoints: 69820,
    unlearningRequests: 23,
    modelAccuracy: 94.2,
    privacyScore: 98.5,
  });

  // Simulated unlearning history
  const [unlearningHistory, setUnlearningHistory] = useState([
    { id: "req-2025-10-01-001", status: "completed", timestamp: "2025-10-01 14:23", nodesAffected: 3, dataPointsRemoved: 450 },
    { id: "req-2025-09-28-002", status: "completed", timestamp: "2025-09-28 09:15", nodesAffected: 5, dataPointsRemoved: 720 },
    { id: "req-2025-09-25-003", status: "failed", timestamp: "2025-09-25 17:40", nodesAffected: 2, dataPointsRemoved: 0 },
  ]);

  useEffect(() => {
    if (isUnlearning && unlearningProgress < 100) {
      const t = setTimeout(() => setUnlearningProgress((p) => Math.min(p + 2, 100)), 100);
      return () => clearTimeout(t);
    } else if (unlearningProgress >= 100) {
      const t = setTimeout(() => {
        setIsUnlearning(false);
        setUnlearningProgress(0);
        setUnlearningHistory((prev) => [
          {
            id: `req-${new Date().toISOString().slice(0, 10)}-${(prev.length + 1).toString().padStart(3, "0")}`,
            status: "completed",
            timestamp: new Date().toISOString(),
            nodesAffected: nodes.length,
            dataPointsRemoved: Math.floor(Math.random() * 1000) + 100,
          },
          ...prev,
        ]);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [isUnlearning, unlearningProgress, nodes.length]);

  const startUnlearning = () => {
    setIsUnlearning(true);
    setUnlearningProgress(0);
  };

  const applyAndStart = async () => {
    const payload = { dataset, attack, gdpr, timestamp: new Date().toISOString() };
    console.log("APPLY CONFIG:", payload);
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

        {/* Control Panel Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
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
            <button
              onClick={() => setShowAttackExplanation(true)}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-400 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              Explain Attack Parameters
            </button>
          </div>

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
            <button
              onClick={() => setShowGdprPolicy(!showGdprPolicy)}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-400 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <Scale size={16} />
              View GDPR Policy
            </button>
          </div>
        </div>

        {/* Apply & Start */}
        <div className="mb-8">
          <button
            onClick={applyAndStart}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 px-5 rounded-lg font-medium"
            disabled={isUnlearning}
          >
            <ShieldCheck size={18} />
            Apply & Start Run
          </button>
          <p className="text-xs text-slate-400 mt-2">
            {isUnlearning ? "Unlearning in progress..." : "Click to apply configuration and start the unlearning process."}
          </p>
        </div>

        {/* GDPR Policy Modal */}
        {showGdprPolicy && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Scale className="text-emerald-400" size={24} />
                  <h2 className="text-2xl font-bold">GDPR Privacy Policy</h2>
                </div>
                <button
                  onClick={() => setShowGdprPolicy(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">Data Protection Rights</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    Under GDPR (General Data Protection Regulation), data subjects have the following rights regarding their personal data:
                  </p>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Right to Access:</strong> Request access to personal data we process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Right to Rectification:</strong> Request correction of inaccurate data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Right to Erasure:</strong> Request deletion of personal data (right to be forgotten)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Right to Restriction:</strong> Request limitation of data processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Right to Data Portability:</strong> Receive personal data in a structured format</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Right to Object:</strong> Object to data processing under certain circumstances</span>
                    </li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">Federated Unlearning Process</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Our federated unlearning system ensures that when data is requested to be deleted, it is removed from all participating nodes in the federated learning network. The process includes:
                  </p>
                  <div className="mt-3 space-y-2 text-slate-300 text-sm">
                    <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                      <strong className="text-purple-400">Certified Unlearning:</strong> Mathematically verifies data removal with cryptographic proofs
                    </div>
                    <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                      <strong className="text-purple-400">Hard Delete:</strong> Complete physical removal from all storage systems
                    </div>
                    <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                      <strong className="text-purple-400">Audit Trail:</strong> Maintains compliance logs without storing deleted data
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">Differential Privacy</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    When enabled, differential privacy adds mathematical noise to protect individual data points while maintaining overall model utility. The epsilon (ε) parameter controls the privacy-utility tradeoff:
                  </p>
                  <ul className="mt-3 space-y-2 text-slate-300 text-sm">
                    <li><strong>Lower ε (1-3):</strong> Stronger privacy, more noise</li>
                    <li><strong>Medium ε (4-8):</strong> Balanced privacy and utility</li>
                    <li><strong>Higher ε (9+):</strong> Less privacy, better model accuracy</li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">Data Retention</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Data retention periods determine how long data is kept before automatic deletion. Setting appropriate retention periods ensures compliance with GDPR's data minimization principle. After the retention period expires, data is automatically flagged for unlearning across all nodes.
                  </p>
                </section>
                <section className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-amber-400 mb-2">Important Notice</h4>
                      <p className="text-slate-300 text-sm">
                        Unlearning operations are irreversible. Once data is unlearned from the federated model, it cannot be recovered. Please ensure you have proper authorization before initiating unlearning requests.
                      </p>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">Contact & Compliance</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    For GDPR-related inquiries or to exercise your data protection rights, contact our Data Protection Officer at dpo@federatedunlearning.example. We respond to all requests within 30 days as required by GDPR Article 12.
                  </p>
                </section>
              </div>
              <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6">
                <button
                  onClick={() => setShowGdprPolicy(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attack Parameters Explanation Modal */}
        {showAttackExplanation && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="text-amber-400" size={24} />
                  <h2 className="text-2xl font-bold">Attack Parameters Explained</h2>
                </div>
                <button
                  onClick={() => setShowAttackExplanation(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-amber-400 mb-3">Attack Type</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Defines the type of attack to simulate on the federated model. Options include:
                  </p>
                  <ul className="mt-2 space-y-2 text-slate-300 text-sm">
                    <li><strong>Duplication:</strong> Introduces duplicate data points to test unlearning effectiveness.</li>
                    <li><strong>Label Poison (future):</strong> Modifies labels to corrupt training data (not yet implemented).</li>
                    <li><strong>Backdoor (future):</strong> Inserts backdoors to assess model robustness (not yet implemented).</li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-amber-400 mb-3">Duplicate Ratio (%)</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Specifies the percentage of data to duplicate (0-90%). A higher ratio increases the challenge for the unlearning process by creating more redundant data to remove.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-amber-400 mb-3">Clients Affected (%)</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Indicates the percentage of client nodes (1-100%) affected by the attack. This determines how widespread the attack is across the federated network.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-amber-400 mb-3">Strategy</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Defines the distribution strategy for the attack. Options include:
                  </p>
                  <ul className="mt-2 space-y-2 text-slate-300 text-sm">
                    <li><strong>Random:</strong> Applies the attack randomly across data points.</li>
                    <li><strong>Class-skewed:</strong> Targets specific classes for attack (e.g., duplicating only "cat" images).</li>
                    <li><strong>Client-skewed:</strong> Focuses the attack on specific client nodes.</li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-amber-400 mb-3">Target Class</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Specifies the class to target with the attack (e.g., "airplane" or "auto" for random selection). This allows testing unlearning on specific data categories, with class lists varying by dataset (e.g., digits 0-9 for MNIST, objects for CIFAR).
                  </p>
                </section>
              </div>
              <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6">
                <button
                  onClick={() => setShowAttackExplanation(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4">Node</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Data Points</th>
                      <th className="text-left py-3 px-4">Region</th>
                      <th className="text-left py-3 px-4">Duplicate Ratio</th>
                      <th className="text-left py-3 px-4">Unlearned Points</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((node) => (
                      <tr key={node.id} className="border-b border-slate-700/50 hover:bg-slate-900/50 transition">
                        <td className="py-3 px-4">{node.name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${node.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                          >
                            {node.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{node.dataPoints.toLocaleString()}</td>
                        <td className="py-3 px-4">{node.region}</td>
                        <td className="py-3 px-4">{(node.duplicateRatio * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4">{node.unlearned.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <button
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                            onClick={() => alert(`Initiating unlearning for ${node.name}`)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "unlearning" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Unlearning Management</h2>
              <div className="space-y-6">
                {/* Unlearning Progress */}
                <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Current Unlearning Task</h3>
                  {isUnlearning ? (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Unlearning Progress</span>
                        <span className="text-purple-400">{unlearningProgress}%</span>
                      </div>
                      <div className="bg-slate-900 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full"
                          style={{ width: `${unlearningProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Processing {gdpr.subjectId || "anonymous"} data across {nodes.length} nodes...
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No active unlearning tasks. Start a new task using the "Apply & Start Run" button above.
                    </p>
                  )}
                </div>

                {/* Unlearning History */}
                <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Unlearning History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4">Request ID</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Timestamp</th>
                          <th className="text-left py-3 px-4">Nodes Affected</th>
                          <th className="text-left py-3 px-4">Data Points Removed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unlearningHistory.map((request) => (
                          <tr key={request.id} className="border-b border-slate-700/50 hover:bg-slate-900/50 transition">
                            <td className="py-3 px-4">{request.id}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  request.status === "completed"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {request.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{new Date(request.timestamp).toLocaleString()}</td>
                            <td className="py-3 px-4">{request.nodesAffected}</td>
                            <td className="py-3 px-4">{request.dataPointsRemoved.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}