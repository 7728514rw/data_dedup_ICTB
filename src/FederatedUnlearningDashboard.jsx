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

  // Shared CSS block (identical across all pages)
  const sharedStyles = `
    <style>
      /* Color variables - Dark purple theme matching the dashboard */
      :root {
        --primary: #a78bfa;
        --secondary: #ec4899;
        --accent-gold: #fbbf24;
        --accent-cyan: #22d3ee;
        --dark: #1e1b4b;
        --darker: #0f172a;
        --card-bg: #1e293b;
        --light: #f8fafc;
        --grey-100: #f1f5f9;
        --grey-200: #e2e8f0;
        --grey-300: #cbd5e1;
        --accent-red: #fee2e2;
        --accent-red-dark: #991b1b;
        --accent-yellow: #fef3c7;
        --accent-yellow-dark: #92400e;
        --accent-blue: #dbeafe;
        --accent-blue-dark: #1e40af;
      }

      /* General page styling */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        margin: 0;
        padding: 0;
        line-height: 1.6;
        color: var(--light);
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
        min-height: 100vh;
      }

      /* Header with sticky navigation */
      header {
        background-color: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 8px rgba(167, 139, 250, 0.2);
        padding: 1rem;
        position: sticky;
        top: 0;
        z-index: 100;
        border-bottom: 1px solid rgba(167, 139, 250, 0.1);
      }

      /* Navigation layout */
      nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
      }

      /* Logo styling */
      .logo {
        font-weight: bold;
        font-size: 1.5rem;
        color: var(--primary);
      }

      /* Navigation links */
      .nav-links {
        display: flex;
        gap: 1.5rem;
      }

      .nav-links a {
        text-decoration: none;
        color: var(--light);
        font-weight: 500;
        transition: color 0.3s;
      }

      .nav-links a:hover {
        color: var(--accent-cyan);
      }

      /* Hero section (for home page) */
      .hero {
        text-align: center;
        padding: 4rem 1rem;
        background: linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(49, 46, 129, 0.8) 100%);
        border-radius: 1rem;
        margin: 2rem 0;
      }

      .hero h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: var(--primary);
      }

      .hero p {
        font-size: 1.2rem;
        max-width: 700px;
        margin: 0 auto 2rem;
        color: var(--light);
      }

      /* Button styling */
      .btn {
        display: inline-block;
        background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s;
        box-shadow: 0 4px 6px rgba(167, 139, 250, 0.3);
      }

      .btn:hover {
        box-shadow: 0 6px 12px rgba(167, 139, 250, 0.5);
        transform: translateY(-2px);
      }

      /* Main content container */
      .container {
        max-width: 1200px;
        margin: 2rem auto;
        padding: 0 1rem;
      }

      /* Main page heading */
      h1 {
        color: var(--primary);
        margin-top: 0;
      }

      /* Content sections */
      .content-section {
        background: rgba(30, 41, 59, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(167, 139, 250, 0.2);
      }

      .content-section h2 {
        color: var(--accent-gold);
        border-bottom: 2px solid var(--accent-gold);
        padding-bottom: 0.5rem;
        margin-top: 0;
      }

      .content-section h3 {
        color: var(--primary);
        margin-top: 1.5rem;
      }

      /* Code blocks and technical diagrams */
      .tech-diagram {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(167, 139, 250, 0.3);
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin: 1.5rem 0;
        overflow-x: auto;
      }

      .tech-diagram pre {
        margin: 0;
        white-space: pre;
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.9rem;
        color: var(--accent-cyan);
      }

      /* Inline code */
      code {
        background: rgba(15, 23, 42, 0.6);
        color: var(--accent-cyan);
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.9em;
        border: 1px solid rgba(167, 139, 250, 0.2);
      }

      /* Features grid */
      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin: 3rem 0;
      }

      .feature-card {
        background: rgba(30, 41, 59, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(167, 139, 250, 0.2);
        transition: all 0.3s;
      }

      .feature-card:hover {
        border-color: var(--primary);
        box-shadow: 0 6px 12px rgba(167, 139, 250, 0.4);
        transform: translateY(-2px);
      }

      .feature-card h3 {
        color: var(--primary);
        margin-top: 0;
      }

      /* User story containers */
      .user-story {
        background: rgba(30, 41, 59, 0.6);
        border-left: 4px solid var(--primary);
        padding: 1.5rem;
        margin-bottom: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .user-story h3,
      .user-story h4 {
        color: var(--primary);
        margin-top: 0;
      }

      .user-story ul {
        margin: 1rem 0;
        padding-left: 1.5rem;
      }

      .user-story li {
        margin: 0.5rem 0;
        color: var(--light);
      }

      .user-story p {
        color: var(--light);
      }

      /* Story metadata badges */
      .story-meta {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
        flex-wrap: wrap;
      }

      .story-meta span {
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
      }

      /* Priority badges */
      .priority.high {
        background-color: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      .priority.medium {
        background-color: rgba(251, 191, 36, 0.2);
        color: var(--accent-gold);
        border: 1px solid rgba(251, 191, 36, 0.3);
      }

      .priority.low {
        background-color: rgba(34, 211, 238, 0.2);
        color: var(--accent-cyan);
        border: 1px solid rgba(34, 211, 238, 0.3);
      }

      /* Story points badge */
      .story-points {
        background-color: rgba(167, 139, 250, 0.2);
        color: var(--primary);
        border: 1px solid rgba(167, 139, 250, 0.3);
      }

      /* Tables */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
        table-layout: fixed;
      }

      .params-table {
        font-size: 0.95rem;
      }

      table thead th {
        background-color: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(167, 139, 250, 0.3);
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: var(--accent-gold);
        vertical-align: top;
      }

      table tbody td {
        border: 1px solid rgba(167, 139, 250, 0.3);
        padding: 1rem;
        vertical-align: top;
        color: var(--light);
        background-color: rgba(30, 41, 59, 0.8);
        line-height: 1.6;
      }

      table tbody td:first-child {
        font-weight: 600;
        color: var(--primary);
        width: 20%;
      }

      table tbody tr:nth-child(even) td {
        background-color: rgba(30, 41, 59, 0.95);
      }

      /* Ensure table text wraps properly */
      table td,
      table th {
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      /* Lists */
      ul, ol {
        line-height: 1.8;
      }

      /* Footer */
      footer {
        background-color: rgba(15, 23, 42, 0.95);
        color: var(--light);
        text-align: center;
        padding: 2rem 1rem;
        margin-top: 3rem;
        border-top: 1px solid rgba(167, 139, 250, 0.2);
      }

      /* Mobile responsive adjustments */
      @media (max-width: 768px) {
        .nav-links {
          gap: 1rem;
          font-size: 0.9rem;
        }
        
        .hero h1 {
          font-size: 2rem;
        }
        
        .hero p {
          font-size: 1rem;
        }
        
        .content-section {
          padding: 1.5rem;
        }
        
        .features {
          grid-template-columns: 1fr;
        }
        
        .tech-diagram {
          padding: 1rem;
          font-size: 0.85rem;
        }
        
        table {
          font-size: 0.85rem;
        }
        
        table thead th,
        table tbody td {
          padding: 0.5rem;
        }
      }
    </style>
  `;

  // Page HTML content
  const websitePages = {
    index: `
    <header>
        <nav>
            <div class="logo">Dedupe Project</div>
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
                <a href="user_stories.html">User Stories</a>
                <a href="legal_ethics.html">Legal & Ethics</a>
            </div>
        </nav>
    </header>
    <section class="hero">
        <h1>Master the Art of Data Deduplication</h1>
        <p>
            Efficient, secure, and scalable solutions for your storage needs.
            Reduce redundancy and optimize performance with our cutting-edge technology.
        </p>
        <a href="deduplication.html" class="btn">Learn More</a>
    </section>
    <div class="container">
        <h2>Why Choose Our Solution?</h2>
        <div class="features">
            <div class="feature-card">
                <h3>Space Savings</h3>
                <p>Reduce storage requirements by eliminating duplicate data blocks, saving you money on infrastructure.</p>
            </div>
            <div class="feature-card">
                <h3>Performance Boost</h3>
                <p>Faster backups and reduced network traffic with our optimized deduplication algorithms.</p>
            </div>
            <div class="feature-card">
                <h3>Enterprise Ready</h3>
                <p>Scalable solution that grows with your business needs, from small setups to large deployments.</p>
            </div>
        </div>
    </div>
    <footer>
        <p>&copy; Group 5 Project. All rights reserved.</p>
    </footer>
    `,

    deduplication: `
    <header>
        <nav>
            <div class="logo">Dedupe Project</div>
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
                <a href="user_stories.html">User Stories</a>
                <a href="legal_ethics.html">Legal & Ethics</a>
            </div>
        </nav>
    </header>
    <div class="container">
        <h1>Data Deduplication Attacks</h1>
        <div class="content-section">
            <h2>Why do Data Deduplication Attacks Exist?</h2>
            <p>
                Data deduplication attacks exploit the way machine learning models memorize duplicated data.
                The main reasons these attacks work:
            </p>
            <p><strong>Model Memorization:</strong> Neural networks can be overfit to duplicated samples...</p>
            <p><strong>Bias Amplification:</strong> If an attacker duplicates specific classes or patterns...</p>
            <p><strong>Privacy Leakage:</strong> Duplicates increase the chance that unique user data...</p>
            <p><strong>Evasion & Backdoors:</strong> Duplicated poisoned samples can dominate training...</p>
            <p><strong>Denial of Service (DoS) & Resource Exhaustion:</strong> If an attacker's goal isn't to poison...</p>
            <p><strong>Exploiting the Aggregation Mechanism:</strong> In federated learning, the central server averages...</p>
        </div>
        <div class="content-section">
            <h2>What is the Typical Execution Time of Deduplication Attacks</h2>
            <p>
                The execution time depends on dataset size, duplication rate, and model complexity...
            </p>
            <p><strong>High Difficulty of Detection:</strong> These attacks are incredibly stealthy...</p>
            <p><strong>Training amplification stage:</strong> Slows training slightly...</p>
            <p><strong>Attack Scalability:</strong> The attack is dangerously efficient...</p>
            <p><strong>Attack impact time:</strong> The effect (bias, memorization, or backdoor trigger)...</p>
            <p><strong>Low Resource Cost:</strong> Beyond just time, the computational resource cost...</p>
            <p>
                So these attacks are cheap, fast, and hard to detect...
            </p>
        </div>
    </div>
    <footer>
        <p>&copy; Group 5 Project. All rights reserved.</p>
    </footer>
    `,

    installation: `
    <header>
        <nav>
            <div class="logo">Dedupe Project</div>
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
                <a href="user_stories.html">User Stories</a>
                <a href="legal_ethics.html">Legal & Ethics</a>
            </div>
        </nav>
    </header>
    <div class="container">
        <h1>Installation Guide</h1>
        <div class="content-section">
            <h2>Overview</h2>
            <p>This explains how to set up the federated unlearning environment...</p>
        </div>
        <div class="content-section">
            <h2>Project Structure</h2>
            <p><strong>Program:</strong> Federated MNIST Demo</p>
            <p><strong>Files:</strong></p>
            <ul>
                <li><strong>dataset_prep.py</strong> – downloads MNIST...</li>
                <li><strong>setup_fed_env.py</strong> – federated learning simulation...</li>
                <li><strong>code_Anwar.py</strong> – React UI prototype...</li>
            </ul>
            <p><strong>Result:</strong> Prepares MNIST, simulates 3 clients...</p>
        </div>
        <!-- Other installation sections omitted for brevity -->
    </div>
    <footer>
        <p>&copy; Group 5 Project. All rights reserved.</p>
    </footer>
    `,

    user_stories: `
    <header>
        <nav>
            <div class="logo">Dedupe Project</div>
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
                <a href="user_stories.html">User Stories</a>
                <a href="legal_ethics.html">Legal & Ethics</a>
            </div>
        </nav>
    </header>
    <div class="container">
        <h1>Project User Stories</h1>
        <div class="content-section">
            <h2>Client User Stories</h2>
            <!-- User stories omitted for brevity -->
        </div>
        <div class="content-section">
            <h2>Development User Stories</h2>
            <!-- Development user stories omitted for brevity -->
        </div>
    </div>
    <footer>
        <p>&copy; Group 5 Project. All rights reserved.</p>
    </footer>
    `,

    legal_ethics: `
    <header>
        <nav>
            <div class="logo">Dedupe Project</div>
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
                <a href="user_stories.html">User Stories</a>
                <a href="legal_ethics.html">Legal & Ethics</a>
            </div>
        </nav>
    </header>
    <div class="container">
        <h1>Legal & Ethical Framework</h1>
        <p>Data deduplication and machine unlearning reduce unnecessary data...</p>
        <h2>Key Legal Concepts</h2>
        <ul>
            <li><strong>Data minimisation:</strong> Deduplication removes redundant...</li>
            <li><strong>Right to erasure (GDPR Art. 17):</strong> Unlearning removes...</li>
            <li><strong>Privacy by design:</strong> Differential privacy...</li>
            <li><strong>Accountability:</strong> Audit logs for transparency.</li>
        </ul>
        <h2>Ethical Principles (FAST)</h2>
        <ul>
            <li><strong>Fairness</strong> – Reduces bias...</li>
            <li><strong>Accountability</strong> – Tracks unlearning...</li>
            <li><strong>Safety</strong> – Adds privacy noise...</li>
            <li><strong>Transparency</strong> – Explains data controls...</li>
        </ul>
        <h2>Risk → Control Mapping</h2>
        <table class="params-table">
            <thead><tr><th>Risk</th><th>Control in our dashboard</th></tr></thead>
            <tbody>
                <tr><td>Over-representation of a person/class</td><td>Deduplication + duplicate ratio...</td></tr>
                <tr><td>Data lingering after deletion request</td><td>Unlearning mode with audit log.</td></tr>
                <tr><td>Re-identification through outputs</td><td>Differential Privacy...</td></tr>
                <tr><td>Excess retention</td><td>Retention window...</td></tr>
            </tbody>
        </table>
        <p style="font-size:0.9rem;opacity:.8">Educational content supporting GDPR & OAIC principles.</p>
    </div>
    <footer>
        <p>&copy; 2025 Dedupe Project. All rights reserved.</p>
    </footer>
    `,
  };

  // Append shared CSS to every page
  for (const page in websitePages) {
    websitePages[page] += sharedStyles;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Federated Unlearning Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-white font-medium text-white-300 mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white-900 border border-white-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter username"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white-400" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-white font-medium text-white-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white-900 border border-slate-700 rounded-lg p-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            Forgot password? Contact admin. | Current time: 01:11 PM AEDT, October 24, 2025
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
            Get More Info
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
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">1. Introduction</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    The Dedupe Project is committed to protecting your personal data in compliance with the General Data Protection Regulation (GDPR) (EU) 2016/679. This Privacy Policy outlines how we collect, process, store, and protect data within our federated learning and unlearning system, ensuring transparency, accountability, and respect for your data protection rights.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">2. Data Controller</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    The Dedupe Project, developed by Group 5, acts as the data controller for personal data processed within this system. For inquiries regarding data protection, please contact our Data Protection Officer at <a href="Group@5ICT_B-Projec" className="text-purple-400 hover:text-purple-300">Group@5ICT_B-Projec</a>.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">3. Data Protection Rights</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    Under GDPR, you have the following rights regarding your personal data:
                  </p>
                  <ul className="text-slate-300 text-sm leading-relaxed list-disc pl-5">
                    <li><strong>Right to be Informed:</strong> You have the right to know how your data is processed, as outlined in this policy.</li>
                    <li><strong>Right of Access:</strong> You can request access to your personal data held by the system.</li>
                    <li><strong>Right to Rectification:</strong> You can request corrections to inaccurate or incomplete data.</li>
                    <li><strong>Right to Erasure (Right to be Forgotten):</strong> You can request the removal of your data from our system, facilitated by our machine unlearning functionality (GDPR Art. 17).</li>
                    <li><strong>Right to Restrict Processing:</strong> You can limit how your data is used under certain conditions.</li>
                    <li><strong>Right to Data Portability:</strong> You can request a copy of your data in a structured, machine-readable format.</li>
                    <li><strong>Right to Object:</strong> You can object to the processing of your data for specific purposes.</li>
                    <li><strong>Rights Related to Automated Decision-Making:</strong> You have protections against decisions based solely on automated processing.</li>
                  </ul>
                  <p className="text-slate-300 text-sm leading-relaxed mt-3">
                    To exercise these rights, please submit a request via our dashboard (using the Data Subject ID field) or contact our Data Protection Officer.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">4. Data We Process</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    Our federated learning system processes the following types of data:
                  </p>
                  <ul className="text-slate-300 text-sm leading-relaxed list-disc pl-5">
                    <li><strong>Training Data:</strong> Anonymized datasets (e.g., MNIST, CIFAR-10, CIFAR-100) used for machine learning model training.</li>
                    <li><strong>Data Subject IDs:</strong> Unique identifiers for data removal requests (optional, as configured in GDPR Parameters).</li>
                    <li><strong>Metadata:</strong> Information about nodes (e.g., region, data points, duplicate ratios) and system metrics (e.g., model accuracy, privacy score).</li>
                    <li><strong>Audit Logs:</strong> Records of unlearning requests and system operations (if enabled).</li>
                  </ul>
                  <p className="text-slate-300 text-sm leading-relaxed mt-3">
                    We adhere to the principle of data minimization (GDPR Art. 5(1)(c)), ensuring that only necessary data is processed. Our deduplication module removes redundant data to reduce storage and processing overhead.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">5. Federated Unlearning Process</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    Our system supports the right to erasure through a machine unlearning process, which removes the influence of specific data from trained models without requiring full retraining. Key features include:
                  </p>
                  <ul className="text-slate-300 text-sm leading-relaxed list-disc pl-5">
                    <li><strong>Certified Unlearning:</strong> Ensures provable removal of data influence with audit logs for accountability.</li>
                    <li><strong>Hard Delete:</strong> Completely removes specified data from all nodes, as configured in the dashboard.</li>
                    <li><strong>Audit Logs:</strong> When enabled, logs track unlearning requests, including request IDs, timestamps, nodes affected, and data points removed.</li>
                  </ul>
                  <p className="text-slate-300 text-sm leading-relaxed mt-3">
                    Unlearning operations are initiated via the dashboard by specifying a Data Subject ID or anonymous request. Progress is displayed in real-time, ensuring transparency.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">6. Differential Privacy</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    To enhance privacy, our system supports Differential Privacy (DP) when enabled in the GDPR Parameters. DP adds controlled noise to model outputs to prevent re-identification of individuals, with a configurable epsilon (ε) value (default: 8). This aligns with GDPR’s privacy-by-design principle (Art. 25).
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Lower epsilon values provide stronger privacy guarantees but may impact model accuracy. You can adjust this setting in the dashboard to balance privacy and performance.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">7. Data Retention</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    We adhere to GDPR’s storage limitation principle (Art. 5(1)(e)) by setting configurable retention periods (default: 30 days). Data is automatically deleted after the retention period expires unless a legitimate reason for retention exists (e.g., ongoing unlearning requests). You can adjust retention days in the GDPR Parameters section of the dashboard.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">8. Legal Basis for Processing</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    We process personal data under the following GDPR legal bases:
                  </p>
                  <ul className="text-slate-300 text-sm leading-relaxed list-disc pl-5">
                    <li><strong>Consent (Art. 6(1)(a)):</strong> For processing training data when explicitly provided by data subjects.</li>
                    <li><strong>Legitimate Interests (Art. 6(1)(f)):</strong> For system operations, such as deduplication and performance optimization, where interests are balanced against data subjects’ rights.</li>
                    <li><strong>Legal Obligation (Art. 6(1)(c)):</strong> To comply with data protection laws, including fulfilling erasure requests.</li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">9. Data Security</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    We implement technical and organizational measures to protect your data, including:
                  </p>
                  <ul className="text-slate-300 text-sm leading-relaxed list-disc pl-5">
                    <li>Secure authentication for dashboard access (username: admin, password: securepass2025).</li>
                    <li>Encryption of data in transit and at rest across federated nodes.</li>
                    <li>Deduplication to reduce the risk of over-representation and bias.</li>
                    <li>Differential privacy to mitigate re-identification risks.</li>
                    <li>Regular audits via logged unlearning requests and system metrics.</li>
                  </ul>
                </section>
                <section className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-amber-400 mb-2">Important Notice</h4>
                      <p className="text-slate-300 text-sm">
                        Unlearning operations are irreversible and permanently remove the influence of specified data from the model. Ensure that requests are accurate before submission, as data cannot be recovered once unlearned. Audit logs (if enabled) provide a record of all operations for accountability.
                      </p>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">10. Third-Party Data Sharing</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    Our federated learning system operates on decentralized nodes, and data is not shared with third parties unless required for legal compliance or with your explicit consent. Node operators (e.g., VIC, NSW, QLD, NT, WA) are bound by data processing agreements to ensure GDPR compliance.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">11. Contact & Compliance</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    For questions, complaints, or to exercise your GDPR rights, please contact our Data Protection Officer at <a href="mailto:Group@5ICT_B-Project" className="text-purple-400 hover:text-purple-300">Group@5ICT_B-Projec</a>. You also have the right to lodge a complaint with a supervisory authority, such as the Office of the Australian Information Commissioner (OAIC) or an EU data protection authority.
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    This policy is regularly reviewed to ensure ongoing compliance with GDPR and other applicable regulations.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">12. Changes to This Policy</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    We may update this Privacy Policy to reflect changes in our system or legal requirements. Updates will be communicated via the dashboard or by email. The current policy is effective as of October 24, 2025.
                  </p>
                </section>
              </div>
              <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6 flex gap-3">
                <button
                  onClick={() => { setCurrentPage("legal_ethics"); setShowWebsite(true); }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-400 py-3 rounded-lg font-medium transition-all"
                >
                  Open Legal & Ethical Framework
                </button>
                <button
                  onClick={() => setShowGdprPolicy(false)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-medium transition-all"
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
        {/* ---- Attack Type ---- */}
        <section>
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Attack Type</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Determines the kind of adversarial manipulation applied to the federated training data.
            <ul className="list-disc pl-5 mt-2">
              <li>
                <strong>Duplication</strong>: Replicates a subset of samples to artificially inflate their influence, causing the model to over-fit to those points.
              </li>
              <li>
                <strong>Label Poison (future)</strong>: Flips or corrupts labels of selected samples, misleading the model into learning incorrect mappings.
              </li>
              <li>
                <strong>Backdoor (future)</strong>: Inserts hidden triggers that, when present in inference inputs, force the model to produce attacker-chosen outputs.
              </li>
            </ul>
            Selecting a type lets you test the system’s resilience against different threat models.
          </p>
        </section>

        {/* ---- Duplicate Ratio ---- */}
        <section>
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Duplicate Ratio (%)</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            The percentage of the original dataset that will be duplicated and re-inserted. A 10% ratio means 10% of the samples are copied, increasing their weight during training. Higher ratios amplify memorisation or bias but may also make the attack easier to detect due to unnatural data distribution. This setting is only active when <em>Attack Type</em> is “Duplication”.
          </p>
        </section>

        {/* ---- Clients Affected ---- */}
        <section>
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Clients Affected (%)</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Specifies how many federated clients (nodes) will be compromised and will inject malicious data. For example, 30% means 30% of the nodes send poisoned updates. In federated averaging, a larger fraction of malicious clients can dominate the global model, even if honest clients are in the majority.
          </p>
        </section>

        {/* ---- Strategy ---- */}
        <section>
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Strategy</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Controls the distribution of the attack across data or clients:
            <ul className="list-disc pl-5 mt-2">
              <li>
                <strong>Random</strong>: Duplicates/poisoned samples are chosen uniformly at random.
              </li>
              <li>
                <strong>Class-skewed</strong>: Focuses the attack on a specific class (see Target Class), creating bias toward that class.
              </li>
              <li>
                <strong>Client-skewed</strong>: Concentrates malicious updates on a subset of clients, exploiting the aggregation step.
              </li>
            </ul>
          </p>
        </section>

        {/* ---- Target Class ---- */}
        <section>
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Target Class</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            When using a class-skewed strategy, this selects the class to target. “Auto” lets the system pick the class automatically (often the least-represented one for maximum impact). For CIFAR-10 you can choose “airplane”, “car”, etc.; for MNIST the classes map to digits 0-9. Targeting a class can create focused biases or backdoors.
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

        {showWebsite && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="text-blue-400" size={24} />
                  <h2 className="text-2xl font-bold">Get More Info - Dedupe Project</h2>
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