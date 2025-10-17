import { useState, useEffect, useRef } from "react";
import { Lock, User, Eye, EyeOff, Activity, Database, Trash2, CheckCircle, AlertTriangle, TrendingUp, Server, Settings, ShieldCheck, Scale } from "lucide-react";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
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
  const [showWebsite, setShowWebsite] = useState(false);
  const [currentPage, setCurrentPage] = useState("index");
  const websiteRef = useRef(null);
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
  const [unlearningHistory] = useState([
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
        // Update unlearning history (simulated)
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [isUnlearning, unlearningProgress]);

  const handleLogin = (e) => {
    e.preventDefault();
    const validUsername = "admin";
    const validPassword = "securepass2025";
    if (username === validUsername && password === validPassword) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

  useEffect(() => {
    setError("");
  }, [username, password]);

  const applyAndStart = () => {
    setIsUnlearning(true);
    setUnlearningProgress(0);
  };

  useEffect(() => {
    if (websiteRef.current && showWebsite) {
      const links = websiteRef.current.querySelectorAll('a[href]');
      links.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          if (href) {
            const pageKey = href.replace('.html', '');
            if (websitePages[pageKey]) {
              setCurrentPage(pageKey);
            }
          }
        });
      });
      return () => {
        links.forEach((link) => {
          link.removeEventListener('click', () => {});
        });
      };
    }
  }, [currentPage, showWebsite]);

  const websitePages = {
    index: `
    <!-- Header section with navigation bar -->
    <header>
        <nav>
            <div class="logo">Dedupe Project</div>
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
                <a href="user-stories.html">User Stories</a>
            </div>
        </nav>
    </header>
    <section class="hero">
        <h1>Master the Art of Data Deduplication</h1>
        <p>Efficient, secure, and scalable solutions for your storage needs.</p>
        <a href="deduplication.html" class="btn">Learn More</a>
    </section>
    <div class="container">
        <h2>Why Choose Our Solution?</h2>
        <div class="features">
            <div class="feature-card"><h3>Space Savings</h3><p>Reduce storage requirements.</p></div>
            <div class="feature-card"><h3>Performance Boost</h3><p>Faster backups.</p></div>
            <div class="feature-card"><h3>Enterprise Ready</h3><p>Scalable solution.</p></div>
        </div>
    </div>
    <footer><p>&copy; 2023 Dedupe Project. All rights reserved.</p></footer>
    <style>:root{--primary:#4f46e5;--secondary:#10b981;--dark:#1e293b;--light:#f8fafc}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;margin:0;padding:0;line-height:1.6;color:var(--dark);background-color:var(--light)}header{background-color:white;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:1rem;position:sticky;top:0;z-index:100}nav{display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto}.logo{font-weight:bold;font-size:1.5rem;color:var(--primary)}.nav-links{display:flex;gap:1.5rem}.nav-links a{text-decoration:none;color:var(--dark);font-weight:500;transition:color 0.3s}.nav-links a:hover{color:var(--primary)}.hero{text-align:center;padding:4rem 1rem;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)}.hero h1{font-size:2.5rem;margin-bottom:1rem;color:var(--primary)}.hero p{font-size:1.2rem;max-width:700px;margin:0 auto 2rem}.btn{display:inline-block;background-color:var(--primary);color:white;padding:0.75rem 1.5rem;border-radius:0.375rem;text-decoration:none;font-weight:500;transition:background-color 0.3s}.btn:hover{background-color:#4338ca}.container{max-width:1200px;margin:2rem auto;padding:0 1rem}h2{color:var(--secondary);border-bottom:2px solid var(--secondary);padding-bottom:0.5rem;margin-top:0}.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;margin:3rem 0}.feature-card{background:white;border-radius:0.5rem;padding:1.5rem;box-shadow:0 4px 6px rgba(0,0,0,0.05)}.feature-card h3{color:var(--primary);margin-top:0}footer{background-color:var(--dark);color:white;text-align:center;padding:2rem 1rem;margin-top:3rem}@media (max-width:768px){.nav-links{gap:1rem}.hero h1{font-size:2rem}}</style>
    `,
    deduplication: `
    <header><nav><div class="logo">Dedupe Project</div><div class="nav-links"><a href="index.html">Home</a><a href="deduplication.html">Deduplication</a><a href="installation.html">Installation</a><a href="user-stories.html">User Stories</a></div></nav></header>
    <div class="container">
        <h1>Data Deduplication Attacks</h1>
        <div class="content-section"><h2>Why do Data Deduplication Attacks Exist?</h2><p>Data deduplication attacks exploit model memorization.</p></div>
        <div class="content-section"><h2>What is the Typical Execution Time of Deduplication Attacks</h2><p>Depends on dataset size and duplication rate.</p></div>
    </div>
    <footer><p>&copy; 2023 Dedupe Project. All rights reserved.</p></footer>
    <style>:root{--primary:#4f46e5;--secondary:#10b981;--dark:#1e293b;--light:#f8fafc}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;margin:0;padding:0;line-height:1.6;color:var(--dark);background-color:var(--light)}header{background-color:white;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:1rem;position:sticky;top:0;z-index:100}nav{display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto}.logo{font-weight:bold;font-size:1.5rem;color:var(--primary)}.nav-links{display:flex;gap:1.5rem}.nav-links a{text-decoration:none;color:var(--dark);font-weight:500;transition:color 0.3s}.nav-links a:hover{color:var(--primary)}.container{max-width:1200px;margin:2rem auto;padding:0 1rem}h1{color:var(--primary);margin-top:0}.content-section{background:white;border-radius:0.5rem;padding:2rem;margin-bottom:2rem;box-shadow:0 4px 6px rgba(0,0,0,0.05)}.content-section h2{color:var(--secondary);border-bottom:2px solid var(--secondary);padding-bottom:0.5rem;margin-top:0}footer{background-color:var(--dark);color:white;text-align:center;padding:2rem 1rem;margin-top:3rem}@media (max-width:768px){.nav-links{gap:1rem}}</style>
    `,
    installation: `
    <header><nav><div class="logo">Dedupe Project</div><div class="nav-links"><a href="index.html">Home</a><a href="deduplication.html">Deduplication</a><a href="installation.html">Installation</a><a href="user-stories.html">User Stories</a></div></nav></header>
    <div class="container"><h1>Installation Guide</h1><div class="content-section"><h2>Overview</h2><p>Set up federated unlearning environment.</p></div></div>
    <footer><p>&copy; 2023 Dedupe Project. All rights reserved.</p></footer>
    <style>:root{--primary:#4f46e5;--secondary:#10b981;--dark:#1e293b;--light:#f8fafc}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;margin:0;padding:0;line-height:1.6;color:var(--dark);background-color:var(--light)}header{background-color:white;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:1rem;position:sticky;top:0;z-index:100}nav{display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto}.logo{font-weight:bold;font-size:1.5rem;color:var(--primary)}.nav-links{display:flex;gap:1.5rem}.nav-links a{text-decoration:none;color:var(--dark);font-weight:500;transition:color 0.3s}.nav-links a:hover{color:var(--primary)}.container{max-width:1200px;margin:2rem auto;padding:0 1rem}h1{color:var(--primary);margin-top:0}.content-section{background:white;border-radius:0.5rem;padding:2rem;margin-bottom:2rem;box-shadow:0 4px 6px rgba(0,0,0,0.05)}.content-section h2{color:var(--secondary);border-bottom:2px solid var(--secondary);padding-bottom:0.5rem;margin-top:0}footer{background-color:var(--dark);color:white;text-align:center;padding:2rem 1rem;margin-top:3rem}@media (max-width:768px){.nav-links{gap:1rem}}</style>
    `,
    'user-stories': `
    <header><nav><div class="logo">Dedupe Project</div><div class="nav-links"><a href="index.html">Home</a><a href="deduplication.html">Deduplication</a><a href="installation.html">Installation</a><a href="user-stories.html">User Stories</a></div></nav></header>
    <div class="container"><h1>Project User Stories</h1><div class="content-section"><h2>Client User Stories</h2><p>Steps from Dr. Viet Vo.</p></div></div>
    <footer><p>&copy; 2023 Dedupe Project. All rights reserved.</p></footer>
    <style>:root{--primary:#4f46e5;--secondary:#10b981;--dark:#1e293b;--light:#f8fafc}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;margin:0;padding:0;line-height:1.6;color:var(--dark);background-color:var(--light)}header{background-color:white;box-shadow:0 2px 4px rgba(0,0,0,0.1);padding:1rem;position:sticky;top:0;z-index:100}nav{display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto}.logo{font-weight:bold;font-size:1.5rem;color:var(--primary)}.nav-links{display:flex;gap:1.5rem}.nav-links a{text-decoration:none;color:var(--dark);font-weight:500;transition:color 0.3s}.nav-links a:hover{color:var(--primary)}.container{max-width:1200px;margin:2rem auto;padding:0 1rem}h1{color:var(--primary);margin-top:0}.content-section{background:white;border-radius:0.5rem;padding:2rem;margin-bottom:2rem;box-shadow:0 4px 6px rgba(0,0,0,0.05)}.content-section h2{color:var(--secondary);border-bottom:2px solid var(--secondary);padding-bottom:0.5rem;margin-top:0}footer{background-color:var(--dark);color:white;text-align:center;padding:2rem 1rem;margin-top:3rem}@media (max-width:768px){.nav-links{gap:1rem}}</style>
    `
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Federated Unlearning Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter username"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter password"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-medium text-sm transition-all"
            >
              Login
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-4">
            Forgot password? Contact admin. | Current time: 02:57 PM AEDT, October 17, 2025
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Federated Unlearning Dashboard
          </h1>
          <p className="text-slate-300">
            Configure dataset, attack parameters, and GDPR controls. Run experiments and visualize live metrics.
          </p>
          <button
            onClick={() => setShowWebsite(true)}
            className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-2 px-4 rounded-lg font-medium text-sm"
          >
            <Database size={18} />
            View Ivan's Website
          </button>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setUsername("");
              setPassword("");
            }}
            className="ml-4 bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

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

        {showGdprPolicy && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Scale className="text-emerald-400" size={24} />
                  <h2 className="text-2xl font-bold">GDPR Privacy Policy</h2>
                </div>
                <button onClick={() => setShowGdprPolicy(false)} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section><h3 className="text-lg font-semibold text-emerald-400 mb-3">Data Protection Rights</h3><p className="text-slate-300 text-sm leading-relaxed mb-3">Under GDPR, data subjects have rights...</p></section>
                <section><h3 className="text-lg font-semibold text-emerald-400 mb-3">Federated Unlearning Process</h3><p className="text-slate-300 text-sm leading-relaxed">Our system ensures data removal...</p></section>
                <section><h3 className="text-lg font-semibold text-emerald-400 mb-3">Differential Privacy</h3><p className="text-slate-300 text-sm leading-relaxed">Adds noise to protect data...</p></section>
                <section><h3 className="text-lg font-semibold text-emerald-400 mb-3">Data Retention</h3><p className="text-slate-300 text-sm leading-relaxed">Determines data retention periods...</p></section>
                <section className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4"><div className="flex items-start gap-3"><AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} /><div><h4 className="font-semibold text-amber-400 mb-2">Important Notice</h4><p className="text-slate-300 text-sm">Unlearning operations are irreversible...</p></div></div></section>
                <section><h3 className="text-lg font-semibold text-emerald-400 mb-3">Contact & Compliance</h3><p className="text-slate-300 text-sm leading-relaxed">Contact our Data Protection Officer...</p></section>
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

        {showAttackExplanation && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="text-amber-400" size={24} />
                  <h2 className="text-2xl font-bold">Attack Parameters Explained</h2>
                </div>
                <button onClick={() => setShowAttackExplanation(false)} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section><h3 className="text-lg font-semibold text-amber-400 mb-3">Attack Type</h3><p className="text-slate-300 text-sm leading-relaxed">Defines the type of attack...</p></section>
                <section><h3 className="text-lg font-semibold text-amber-400 mb-3">Duplicate Ratio (%)</h3><p className="text-slate-300 text-sm leading-relaxed">Specifies the percentage of data...</p></section>
                <section><h3 className="text-lg font-semibold text-amber-400 mb-3">Clients Affected (%)</h3><p className="text-slate-300 text-sm leading-relaxed">Indicates the percentage of clients...</p></section>
                <section><h3 className="text-lg font-semibold text-amber-400 mb-3">Strategy</h3><p className="text-slate-300 text-sm leading-relaxed">Defines the distribution strategy...</p></section>
                <section><h3 className="text-lg font-semibold text-amber-400 mb-3">Target Class</h3><p className="text-slate-300 text-sm leading-relaxed">Specifies the class to target...</p></section>
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

        {showWebsite && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="text-blue-400" size={24} />
                  <h2 className="text-2xl font-bold">Ivan's Website - Dedupe Project</h2>
                </div>
                <button onClick={() => setShowWebsite(false)} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6" ref={websiteRef} dangerouslySetInnerHTML={{ __html: websitePages[currentPage] }} />
              <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6">
                <button
                  onClick={() => setShowWebsite(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
                    <div><div className="flex justify-between text-sm mb-2"><span>Network Latency</span><span className="text-green-400">42ms</span></div><div className="bg-slate-900 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width:"85%"}}/></div></div>
                    <div><div className="flex justify-between text-sm mb-2"><span>Synchronization</span><span className="text-blue-400">92%</span></div><div className="bg-slate-900 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:"92%"}}/></div></div>
                    <div><div className="flex justify-between text-sm mb-2"><span>Privacy Compliance</span><span className="text-purple-400">98%</span></div><div className="bg-slate-900 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{width:"98%"}}/></div></div>
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
                  <thead><tr className="border-b border-slate-700"><th className="text-left py-3 px-4">Node</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Data Points</th><th className="text-left py-3 px-4">Region</th><th className="text-left py-3 px-4">Duplicate Ratio</th><th className="text-left py-3 px-4">Unlearned Points</th><th className="text-left py-3 px-4">Actions</th></tr></thead>
                  <tbody>
                    {nodes.map((node) => (
                      <tr key={node.id} className="border-b border-slate-700/50 hover:bg-slate-900/50 transition">
                        <td className="py-3 px-4">{node.name}</td>
                        <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${node.status==="active"?"bg-green-500/20 text-green-400":"bg-yellow-500/20 text-yellow-400"}`}>{node.status}</span></td>
                        <td className="py-3 px-4">{node.dataPoints.toLocaleString()}</td>
                        <td className="py-3 px-4">{node.region}</td>
                        <td className="py-3 px-4">{(node.duplicateRatio*100).toFixed(1)}%</td>
                        <td className="py-3 px-4">{node.unlearned.toLocaleString()}</td>
                        <td className="py-3 px-4"><button className="text-purple-400 hover:text-purple-300 transition-colors" onClick={() => alert(`Initiating unlearning for ${node.name}`)}><Trash2 size={16}/></button></td>
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
                <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Current Unlearning Task</h3>
                  {isUnlearning ? (
                    <div>
                      <div className="flex justify-between text-sm mb-2"><span>Unlearning Progress</span><span className="text-purple-400">{unlearningProgress}%</span></div>
                      <div className="bg-slate-900 rounded-full h-3"><div className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full" style={{width:`${unlearningProgress}%`}}/></div>
                      <p className="text-xs text-slate-400 mt-2">Processing {gdpr.subjectId || "anonymous"} data across {nodes.length} nodes...</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No active unlearning tasks. Start a new task using the "Apply & Start Run" button above.</p>
                  )}
                </div>
                <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Unlearning History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-slate-700"><th className="text-left py-3 px-4">Request ID</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Timestamp</th><th className="text-left py-3 px-4">Nodes Affected</th><th className="text-left py-3 px-4">Data Points Removed</th></tr></thead>
                      <tbody>
                        {unlearningHistory.map((request) => (
                          <tr key={request.id} className="border-b border-slate-700/50 hover:bg-slate-900/50 transition">
                            <td className="py-3 px-4">{request.id}</td>
                            <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${request.status==="completed"?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{request.status}</span></td>
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
};

export default App;