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

// Page HTML content (unchanged from your original)
const websitePages = {
    index: `
    <header>
        <nav>
            <!-- Logo / site name -->
            <div class="logo">Dedupe Project</div>
            <!-- Links to other pages -->
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
				<a href="user_stories.html">User Stories</a>
            </div>
        </nav>
    </header>

    <!-- Hero section (large banner area at the top of the page) -->
    <section class="hero">
        <h1>Master the Art of Data Deduplication</h1>
        <p>
            Efficient, secure, and scalable solutions for your storage needs.
            Reduce redundancy and optimize performance with our cutting-edge technology.
        </p>
        <!-- Call-to-action button -->
        <a href="deduplication.html" class="btn">Learn More</a>
    </section>

    <!-- Main content container -->
    <div class="container">
        <h2>Why Choose Our Solution?</h2>

        <!-- Features laid out in cards -->
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

    <!-- Footer section at the bottom of the page -->
    <footer>
        <p>&copy; Group 5 Project. All rights reserved.</p>
    </footer>
    `,

    deduplication: `
    <header>
        <nav>
            <!-- Logo / site title -->
            <div class="logo">Dedupe Project</div>
            <!-- Navigation menu -->
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
				<a href="user_stories.html">User Stories</a>
            </div>
        </nav>
    </header>

    <!-- Main container for page content -->
    <div class="container">
        <h1>Data Deduplication Attacks</h1>
        
        <!-- First section explaining why attacks exist -->
        <div class="content-section">
            <h2>Why do Data Deduplication Attacks Exist?</h2>
            <p>
                Data deduplication attacks exploit the way machine learning models memorize duplicated data.
                The main reasons these attacks work:
            </p>

            <!-- Subpoints explained -->
            <p><strong>Model Memorization:</strong> Neural networks can be overfit to duplicated samples. Attackers deliberately insert duplicates to amplify the “weight” of a particular record, so the model “remembers” it disproportionately. It’s sort of like a student who “cram” pieces of data in a specific time to pass an assessment, they’re not actually learning the subject. Similarly, a deduplication attack forces the model to “cram” a specific piece of data making the model quite confident about that specific piece of information but unreliable when faced with slightly different data it hasn’t seen before. </p>
            <p><strong>Bias Amplification:</strong> If an attacker duplicates specific classes or patterns, the model becomes biased toward them — skewing predictions or making unlearning ineffective. </p>
            <p><strong>Privacy Leakage:</strong> Duplicates increase the chance that unique user data (like a rare medical record) is strongly encoded in model parameters, making it easier to reconstruct via model inversion attacks. </p>
            <p><strong>Evasion & Backdoors:</strong> Duplicated poisoned samples can dominate training and force the model to learn an attacker-chosen decision boundary (backdoor attack).</p>
            <p><strong>Denial of Service (DoS) & Resource Exhaustion:</strong> If an attacker's goal isn't to poison the model, but to stop it from being trained at all. By injecting a massive number of duplicates, they can artificially inflate the dataset size. This forces the training process to consume far more time, memory, and power than anticipated. In a learning system where clients have limited resources or a central server has a strict budget, this can effectively grind the entire operation to a halt. Attackers use redundant data to prevent the model from making any real progress.  </p>
            <p><strong>Exploiting the Aggregation Mechanism:</strong> In federated learning, the central server averages the updates from all clients to create the global model. A deduplication attack can turn this democratic process into a rigged election. If an attacker controls just two clients and feeds them both the same set of duplicated poisoned data, their malicious update is essentially submitted twice. When the server averages everything, the attacker's malicious gradient gets twice the "voting power" compared to a normal client. By duplicating data on their end, they amplify their influence on the final model, allowing a small minority of attackers to easily overpower the honest majority. </p>
        </div>

        <!-- Second section about how long attacks take -->
        <div class="content-section">
            <h2>What is the Typical Execution Time of Deduplication Attacks</h2>
            <p>
                The execution time depends on dataset size, duplication rate, and model complexity, but generally:
            </p>

            <!-- Subpoints explained -->
            <p><strong>High Difficulty of Detection:</strong> These attacks are incredibly stealthy. From a system's perspective, a duplicated data point doesn't look like a virus or a classic hacking attempt; it just looks like a very popular or common piece of data. There's no malicious code to detect. This is especially true for near-duplicates, where the attacker makes tiny, trivial changes to each copy. A standard deduplication system looking for perfect matches will miss them completely, while the model still treats them as the same core data, amplifying their effect. Dataset modification stage: Very fast — duplication is just copying indices (seconds). </p>
            <p><strong>Training amplification stage:</strong> Slows training slightly because the dataset is larger — typically +10–30% longer training time for a 10–30% duplication rate. </p>
            <p><strong>Attack Scalability:</strong> The attack is dangerously efficient and scalable. An attacker doesn't need to spend weeks crafting thousands of unique malicious data points. They only need to create one effective poisoned sample and then instruct the system to duplicate it. This low-effort, high-impact nature means a single attacker can exert a disproportionately large influence on a massive, distributed machine learning model. </p>
            <p><strong>Attack impact time:</strong>  The effect (bias, memorization, or backdoor trigger) appears as soon as training is done — no runtime cost during inference. </p>
            <p><strong>Low Resource Cost:</strong> Beyond just time, the computational resource cost is minimal. An attacker doesn't need a supercomputer. The main resource they consume is a bit more storage on the target system and slightly more RAM usage during training on the client-side. In many federated learning scenarios, where clients have varied and limited resources, this minor increase often goes unnoticed and is written off as normal system fluctuation. </p>

            <p>
                So these attacks are cheap, fast, and hard to detect, which makes them dangerous in federated and distributed settings.
            </p>
        </div>
    </div>

    <!-- Footer with basic info -->
    <footer>
        <p>&copy; Group 5 Project. All rights reserved.</p>
    </footer>
    `,

    installation: `
   <header>
        <nav>
            <div class="logo">Dedupe Project</div>
            <div class="nav-links">
                <!-- Navigation links to other pages -->
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
				<a href="user_stories.html">User Stories</a>
            </div>
        </nav>
    </header>

    <!-- Main content container -->
    <div class="container">
        <h1>Installation Guide</h1>

        <!-- Section: Overview -->
        <div class="content-section">
            <h2>Overview</h2>
            <p>This explains how to set up the federated unlearning environment. It covers prerequisites, installation, and testing with Python and Flower.</p>
        </div>

        <!-- Section: Project Structure -->
        <div class="content-section">
            <h2>Project Structure</h2>
            <p><strong>Program:</strong> Federated MNIST Demo</p>
            <p><strong>Files:</strong></p>
            <ul>
                <li><strong>dataset_prep.py</strong> – downloads MNIST and shows a sample; prints partition/duplication sizes.</li>
                <li><strong>setup_fed_env.py</strong> – federated learning simulation using Flower's simulator (requires Ray).</li>
                <li><strong>code_Anwar.py</strong> – React UI prototype (optional; separate Node.js app).</li>
            </ul>
            <p><strong>Result:</strong> Prepares MNIST, simulates 3 clients, runs 3 federated rounds with a small CNN, prints loss/accuracy per round.</p>
        </div>

        <!-- Section: Prerequisites -->
        <div class="content-section">
            <h2>Prerequisites (both OSes)</h2>
            <p><strong>Python:</strong> Use Python 3.11 for the Flower simulator (Ray doesn’t support 3.13 yet on Windows). Otherwise, use the Ray-free fallback.</p>
            <p><strong>Disk & Network:</strong> ~1 GB free space, internet required for dataset and pip.</p>
            <p><strong>(Optional)</strong> Node.js LTS for running the React UI.</p>
        </div>

        <!-- Section: Folder Layout -->
        <div class="content-section">
            <h2>Folder Layout</h2>
            <p>All files should be placed inside one project folder:</p>
            <div class="tech-diagram">
                <pre>ProjectB/
    dataset_prep.py
    setup_fed_env.py
    (optional) code_Anwar.py</pre>
            </div>
        </div>

        <!-- Section: requirements.txt -->
        <div class="content-section">
            <h2>Quick "requirements.txt"</h2>
            <p>Create this file to install dependencies:</p>
            <div class="tech-diagram">
                <pre>flwr[simulation]==1.22.0
torch
torchvision
matplotlib</pre>
            </div>
        </div>

        <!-- Section: Windows setup -->
        <div class="content-section">
            <h2>Windows 10/11 – Install & Run (Python 3.11 recommended)</h2>

            <h3>Install Python 3.11</h3>
            <p>Download from python.org. Check "Add Python to PATH" during install.</p>
            <p>Open PowerShell and navigate to the project folder:</p>
            <div class="tech-diagram">
                <pre>cd "C:\Users\<you>\Documents\ProjectB"</pre>
            </div>

            <h3>Create & activate a virtual environment</h3>
            <p><strong>Create:</strong> <code>py -3.11 -m venv .venv</code></p>
            <p><strong>Allow activation for this session:</strong> <code>Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass</code></p>
            <p><strong>Activate:</strong> <code>. .\.venv\Scripts\Activate.ps1</code> (PowerShell)</p>
            <p><strong>(or)</strong> <code>.\.venv\Scripts\activate.bat</code> (Command Prompt)</p>

            <h3>Install dependencies</h3>
            <p>This installs Flower + Ray, Torch, and other libraries:</p>
            <div class="tech-diagram">
                <pre>python -m pip install --upgrade pip
pip install -r requirements.txt</pre>
            </div>

            <h3>Run dataset prep</h3>
            <div class="tech-diagram">
                <pre>python dataset_prep.py</pre>
            </div>
            <p>You should see an MNIST sample image and printed partition sizes.</p>

            <h3>Run the federated simulation</h3>
            <div class="tech-diagram">
                <pre>python setup_fed_env.py</pre>
            </div>
            <p>This will show Flower/Ray logs with training round metrics.</p>
        </div>

        <!-- Section: macOS setup -->
        <div class="content-section">
            <h2>macOS – Install & Run (zsh/Terminal)</h2>

            <h3>Install Python 3.11</h3>
            <p>Run <code>brew install python@3.11</code> or download from python.org.</p>

            <h3>Create & activate venv</h3>
            <div class="tech-diagram">
                <pre>cd ~/Projects/ProjectB
python3.11 -m venv .venv
source .venv/bin/activate</pre>
            </div>

            <h3>Install dependencies</h3>
            <div class="tech-diagram">
                <pre>python -m pip install --upgrade pip
pip install -r requirements.txt</pre>
            </div>

            <h3>Run dataset prep</h3>
            <div class="tech-diagram">
                <pre>python dataset_prep.py</pre>
            </div>

            <h3>Run the federated simulation</h3>
            <div class="tech-diagram">
                <pre>python setup_fed_env.py</pre>
            </div>
            <p>You’ll see training results and accuracy per round.</p>
        </div>

        <!-- Section: Ray-free fallback -->
        <div class="content-section">
            <h2>Ray-free fallback (works on Python 3.12+/3.13)</h2>
            <p>Use this if Python 3.11 isn’t available. Requirements:</p>
            <div class="tech-diagram">
                <pre>torch
torchvision
matplotlib</pre>
            </div>
            <p>Run:</p>
            <div class="tech-diagram">
                <pre>python dataset_prep.py
python setup_fed_env_noray.py</pre>
            </div>
        </div>

        <!-- Section: React UI -->
        <div class="content-section">
            <h2>Optional: React UI (from code_Anwar.py)</h2>
            <p>Steps to preview in React:</p>
            <ol>
                <li>Install Node.js LTS.</li>
                <li><code>npx create-react-app fed-ui && cd fed-ui</code></li>
                <li>Replace <code>src/App.js</code> with <code>code_Anwar.py</code> contents.</li>
                <li><code>npm start</code> to open the browser preview.</li>
            </ol>
        </div>

        <!-- Section: Deliverables -->
        <div class="content-section">
            <h2>Verification / Deliverables</h2>
            <p><strong>What to include:</strong></p>
            <ul>
                <li>Screenshot of MNIST sample window.</li>
                <li>Terminal logs showing Flower or Ray-free rounds.</li>
            </ul>
            <p><strong>Artifacts:</strong></p>
            <ul>
                <li>Virtual environment folder (.venv/)</li>
                <li>./data/ folder with MNIST dataset</li>
                <li>Final console accuracy line</li>
            </ul>
        </div>

        <!-- Section: Troubleshooting -->
        <div class="content-section">
            <h2>Troubleshooting</h2>
            <ul>
                <li><strong>Ray import error:</strong> Use Python 3.11 or Ray-free script.</li>
                <li><strong>Matplotlib window doesn’t show:</strong> Add <code>plt.show(block=True)</code>.</li>
                <li><strong>SSL/download issues:</strong> Install <code>certifi</code> or configure proxy.</li>
                <li><strong>OneDrive sync issues:</strong> Move project to a shorter local path.</li>
            </ul>
        </div>

        <!-- Section: Handy scripts -->
        <div class="content-section">
            <h2>Handy run scripts (optional)</h2>

            <h3>Windows – run.bat</h3>
            <div class="tech-diagram">
                <pre>@echo off
setlocal
cd /d %~dp0
if not exist .venv (
  py -3.11 -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
python dataset_prep.py
python setup_fed_env.py</pre>
            </div>

            <h3>macOS – run.sh</h3>
            <div class="tech-diagram">
                <pre>#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
[ -d .venv ] || python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python dataset_prep.py
python setup_fed_env.py</pre>
            </div>
            <p><strong>Note:</strong> Run <code>chmod +x run.sh</code> before execution</p>
        </div>
    </div>

    <!-- Footer -->
    <footer>
        <p>&copy; Group 5 Project. All rights reserved.</p>
    </footer>
    `,

    "user_stories": `
    <header>
        <nav>
            <div class="logo">Dedupe Project</div>
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
                <a href="user_stories.html">User Stories</a>
            </div>
        </nav>
    </header>

    <div class="container">
        <h1>Project User Stories</h1>
        
        <!-- Client User Stories Section -->
        <div class="content-section">
            <h2>Client User Stories</h2>
            <p>These user stories are a collated list of the steps provided by our client Dr. Viet Vo explaining how we should aim to progress to achieve successful completion of the project.</p>

            <!-- User Story 01 -->
            <div class="user-story">
                <h3>User Story ID: 01</h3>
                <h4>Title: Replicate and Evaluate Existing Deep Learning Architectures</h4>
                <p><strong>User Story:</strong><br>
                As a researcher in federated learning security, I want to begin by evaluating the implementation of existing works on various machine learning and deep learning architectures to provide a better understanding of possibilities for this project, as well as establishing a performance baseline for comparing adversarial impacts in later experiments.</p>
                
                <p><strong>Acceptance Criteria / Tasks:</strong></p>
                <ul>
                    <li>Implement LeNet and AlexNet based on methods described in the documentation provided.</li>
                    <li>Train models under standard (non-adversarial) settings.</li>
                    <li>Record baseline accuracy, loss, and convergence behavior.</li>
                    <li>Document any variable results between replication results and original works.</li>
                </ul>
                
                <div class="story-meta">
                    <span class="priority high">Priority: High</span>
                    <span class="story-points">Story Points: 3</span>
                </div>
            </div>

            <!-- User Story 02 -->
            <div class="user-story">
                <h3>User Story ID: 02</h3>
                <h4>Title: Analyse the Effects of Adversarial Configurations</h4>
                <p><strong>User Story:</strong><br>
                As a researcher in federated learning security, I want to explore the effects of different adversarial configurations (malicious clients, data volume, training duration), so that I can understand how varying attack parameters influence model robustness.</p>
                
                <p><strong>Acceptance Criteria / Tasks:</strong></p>
                <ul>
                    <li>Configure experiments with different numbers of malicious clients (e.g., 1, 5, 10).</li>
                    <li>Vary the training data volume across clients.</li>
                    <li>Test the impact of shorter vs. longer training durations.</li>
                    <li>Record performance metrics (accuracy, robustness, convergence).</li>
                    <li>Summarise trends and correlations between adversarial parameters and outcomes.</li>
                </ul>
                
                <div class="story-meta">
                    <span class="priority high">Priority: High</span>
                    <span class="story-points">Story Points: 8</span>
                </div>
            </div>

            <!-- User Story 03 -->
            <div class="user-story">
                <h3>User Story ID: 03</h3>
                <h4>Title: Experiment with Non-IID Federated Data</h4>
                <p><strong>User Story:</strong><br>
                As a researcher in federated learning security, I want to adapt experiments to federated learning environments with non-IID data, so that I can evaluate model performance in realistic, heterogeneous deployment scenarios.</p>
                
                <p><strong>Acceptance Criteria / Tasks:</strong></p>
                <ul>
                    <li>Partition datasets into non-IID distributions across clients.</li>
                    <li>Compare performance against IID settings.</li>
                    <li>Measure impact on adversarial attack effectiveness under non-IID data.</li>
                    <li>Document challenges and potential mitigation strategies.</li>
                </ul>
                
                <div class="story-meta">
                    <span class="priority high">Priority: High</span>
                    <span class="story-points">Story Points: 8</span>
                </div>
            </div>

            <!-- User Story 04 -->
            <div class="user-story">
                <h3>User Story ID: 04 (optional)</h3>
                <h4>Title: Assess Defense Strategies Against Data Duplication Attacks</h4>
                <p><strong>User Story:</strong><br>
                As a researcher in federated learning security, I want to evaluate the effectiveness of existing robustness defenses (e.g., FLShield [4]) against data duplication attacks, so that I can determine how well current frameworks protect against adversarial strategies and identify gaps for improvement.</p>
                
                <p><strong>Acceptance Criteria / Tasks:</strong></p>
                <ul>
                    <li>Implement a data duplication attack within the federated learning environment.</li>
                    <li>Integrate defense mechanisms such as FLShield [4] and other existing strategies.</li>
                    <li>Measure defense effectiveness using accuracy, robustness, and attack success rates.</li>
                    <li>Compare theoretical defense expectations with experimental results.</li>
                    <li>Document strengths, weaknesses, and potential improvements for defense strategies.</li>
                </ul>
                
                <div class="story-meta">
                    <span class="priority medium">Priority: Medium (Optional but valuable)</span>
                    <span class="story-points">Story Points: 8</span>
                </div>
            </div>

            <!-- User Story 05 -->
            <div class="user-story">
                <h3>User Story ID: 05</h3>
                <h4>Title: Develop Dashboard for Reporting Results</h4>
                <p><strong>User Story:</strong><br>
                As a researcher in federated learning security, I want to create a dashboard to visualise and report experimental results, so that I can easily compare models, parameters, and defense effectiveness, and communicate findings clearly.</p>
                
                <p><strong>Acceptance Criteria / Tasks:</strong></p>
                <ul>
                    <li>Design a dashboard interface to present key metrics (accuracy, loss, robustness, attack success rate).</li>
                    <li>Include graphical visualisations (e.g., line charts, bar graphs, heatmaps).</li>
                </ul>
                
                <div class="story-meta">
                    <span class="priority medium">Priority: Medium</span>
                    <span class="story-points">Story Points: 8</span>
                </div>
            </div>
        </div>

        <!-- Additional User Stories Section -->
        <div class="content-section">
            <h2>Development User Stories</h2>

            <!-- Adversarial Parameters Analysis -->
            <div class="user-story">
                <h4>Title: Analyse Adversarial Parameters</h4>
                <p><strong>User Story:</strong><br>
                As a security analyst, I want to analyse adversarial parameters like the number of malicious clients, data volume, and training duration so that I can quantify the effort needed for successful duplication attacks and evaluate the effectiveness of our machine unlearning and deduplication solutions.</p>
                
                <div class="story-meta">
                    <span class="priority high">Priority: High</span>
                    <span class="story-points">Story Points: 5</span>
                </div>
                
                <p><strong>Key Parameters:</strong></p>
                <table class="params-table">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Description</th>
                            <th>Why it Matters</th>
                            <th>Metrics to Quantify Effort</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Number of Malicious Clients</td>
                            <td>The scale of the attack, from a single malicious actor to a coordinated group.</td>
                            <td>This helps us figure out if our security solution can handle a big, distributed attack.</td>
                            <td>Duplication Rate: How much data gets copied based on the number of attackers.<br><br>Reconstruction Accuracy: How good the copies are, depending on how many people involved</td>
                        </tr>
                        <tr>
                            <td>Data Volume</td>
                            <td>The size and complexity of the dataset they're targeting.</td>
                            <td>We need to see if our solution works just as well on a massive amount of data as it does on a small one.</td>
                            <td>Cost per Duplication: The time and resources it takes to copy a single bit of data.<br><br>Efficiency: How fast they can pull off the attack as the dataset grows.</td>
                        </tr>
                        <tr>
                            <td>Training Duration</td>
                            <td>The time the attacker spends on the malicious process.</td>
                            <td>This shows us if a long, patient attack is more successful than a quick, fast one.</td>
                            <td>Success Rate Over Time: How much data they can get the longer they work at it.<br><br>Attack Persistence: How long the attacker can stay hidden before we catch them.</td>
                        </tr>
                        <tr>
                            <td>Machine Unlearning/Deduplication Solution</td>
                            <td>Our defense system to stop the bad guys from copying our data.</td>
                            <td>The whole point of our work is to prove that our solution makes it much harder for them to succeed.</td>
                            <td>Effort Multiplier: How many times more effort the attacker needs after we put our solution in place.<br><br>Risk Reduction: How much we reduce the chance of data getting stolen.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Build Deduplication Module -->
            <div class="user-story">
                <h4>Title: Build and Test Data Deduplication Module</h4>
                <p><strong>User Story:</strong><br>
                As a developer, I want to design and implement a deduplication module that integrates with the federated learning pipeline, so that duplicate data entries can be automatically detected and removed before training.</p>
                
                <p><strong>Acceptance Criteria / Tasks:</strong></p>
                <ul>
                    <li>Implement a deduplication function.</li>
                    <li>Integrate the module into the data preprocessing pipeline.</li>
                    <li>Test module accuracy.</li>
                </ul>
                
                <div class="story-meta">
                    <span class="priority high">Priority: High</span>
                    <span class="story-points">Story Points: 5</span>
                </div>
            </div>

            <!-- Machine Unlearning -->
            <div class="user-story">
                <h4>Title: Implement Machine Unlearning Functionality</h4>
                <p><strong>User Story:</strong><br>
                As a developer, I want to implement a machine unlearning feature that can remove the influence of specific client data from the global model, so that the system can comply with security and privacy requirements without full retraining.</p>
                
                <p><strong>Acceptance Criteria / Tasks:</strong></p>
                <ul>
                    <li>Implement incremental unlearning methods.</li>
                    <li>Test accuracy and convergence of the model before and after unlearning.</li>
                    <li>Compare runtime with full retraining for efficiency.</li>
                </ul>
                
                <div class="story-meta">
                    <span class="priority high">Priority: High</span>
                    <span class="story-points">Story Points: 8</span>
                </div>
            </div>

            <!-- Attack Simulation Framework -->
            <div class="user-story">
                <h4>Title: Develop Attack Simulation Framework</h4>
                <p><strong>User Story:</strong><br>
                As a developer, I want to create a reuseable framework to simulate duplication and adversarial attacks, so that researchers can run consistent, repeatable experiments under different configurations.</p>
                
                <p><strong>Acceptance Criteria / Tasks:</strong></p>
                <ul>
                    <li>Implement attack scripts with adjustable parameters.</li>
                    <li>Ensure framework can log results.</li>
                </ul>
                
                <div class="story-meta">
                    <span class="priority medium">Priority: Medium</span>
                    <span class="story-points">Story Points: 5</span>
                </div>
            </div>

            <!-- Regulatory Compliance -->
            <div class="user-story">
                <h4>Title: Regulatory Compliance of Privacy Data</h4>
                <p><strong>User Story:</strong><br>
                As the model owner, I want to ensure that the model remains compliant with privacy regulations as outlined in the General Data Protection Regulation (GDPR). This is important because the model will run an unlearning algorithim of client data.</p>
                
                <p><strong>Acceptance Criteria / Tasks:</strong></p>
                <ul>
                    <li>Validate that the model before and after the unlearning request</li>
                    <li>Monitor risks of adversarial misuse</li>
                    <li>Refer to the GDPR for information on compliance</li>
                </ul>
                
                <div class="story-meta">
                    <span class="priority high">Priority: High</span>
                    <span class="story-points">Story Points: 8</span>
                </div>
            </div>
        </div>
    </div>

    <footer>
        <p>&copy; Group 5 Project. All rights reserved.</p>
    </footer>

    `
};

// Append shared CSS to every page dynamically
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