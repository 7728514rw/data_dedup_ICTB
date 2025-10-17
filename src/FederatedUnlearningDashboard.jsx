import { useState, useEffect, useRef } from "react";
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

      // Cleanup event listeners on unmount
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
            <!-- Logo / site name -->
            <div class="logo">Dedupe Project</div>
            <!-- Links to other pages -->
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
				<a href="user-stories.html">User Stories</a>
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
        <p>&copy; 2023 Dedupe Project. All rights reserved.</p>
    </footer>

    <!-- CSS styles are placed here inside <style> so no separate file is needed -->
    <style>
        /* Color variables that can be reused across the page */
        :root {
            --primary: #4f46e5;   /* Main purple color */
            --secondary: #10b981; /* Green accent color */
            --dark: #1e293b;      /* Dark text color */
            --light: #f8fafc;     /* Light background color */
        }

        /* General page styling */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: var(--dark);
            background-color: var(--light);
        }

        /* Header bar with sticky position */
        header {
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 1rem;
            position: sticky; /* keeps header visible when scrolling */
            top: 0;
            z-index: 100; /* ensures it stays on top of other content */
        }

        /* Navigation bar layout */
        nav {
            display: flex;
            justify-content: space-between; /* spaces logo and links apart */
            align-items: center;
            max-width: 1200px;
            margin: 0 auto; /* centers nav content */
        }

        /* Logo styling */
        .logo {
            font-weight: bold;
            font-size: 1.5rem;
            color: var(--primary);
        }

        /* Navigation links layout */
        .nav-links {
            display: flex;
            gap: 1.5rem; /* space between links */
        }

        /* Styling for each navigation link */
        .nav-links a {
            text-decoration: none;
            color: var(--dark);
            font-weight: 500;
            transition: color 0.3s; /* smooth color change */
        }

        .nav-links a:hover {
            color: var(--primary); /* turns purple when hovered */
        }

        /* Hero section (big top banner) */
        .hero {
            text-align: center;
            padding: 4rem 1rem;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }

        .hero h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: var(--primary);
        }

        .hero p {
            font-size: 1.2rem;
            max-width: 700px;
            margin: 0 auto 2rem; /* centers text and adds spacing */
        }

        /* Button styling */
        .btn {
            display: inline-block;
            background-color: var(--primary);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.3s;
        }

        .btn:hover {
            background-color: #4338ca; /* darker purple on hover */
        }

        /* Main content container */
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        h1 {
            color: var(--primary);
            margin-top: 0;
        }

        /* Section box styling */
        .content-section {
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .content-section h2 {
            color: var(--secondary);
            border-bottom: 2px solid var(--secondary);
            padding-bottom: 0.5rem;
            margin-top: 0;
        }

        /* Tech diagram placeholder style */
        .tech-diagram {
            background: #f1f5f9;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        /* Features grid layout */
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }

        /* Each feature card */
        .feature-card {
            background: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .feature-card h3 {
            color: var(--primary);
            margin-top: 0;
        }

        /* Footer styling */
        footer {
            background-color: var(--dark);
            color: white;
            text-align: center;
            padding: 2rem 1rem;
            margin-top: 3rem;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
            .nav-links {
                gap: 1rem;
            }
            .hero h1 {
                font-size: 2rem; /* smaller title on mobile */
            }
        }
    </style>
    `,
    deduplication: `
    <!-- Header with navigation links -->
    <header>
        <nav>
            <!-- Logo / site title -->
            <div class="logo">Dedupe Project</div>
            <!-- Navigation menu -->
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
				<a href="user-stories.html">User Stories</a>
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
        <p>&copy; 2023 Dedupe Project. All rights reserved.</p>
    </footer>

    <!-- CSS styles placed here instead of separate file -->
    <style>
        /* Reusable color variables */
        :root {
            --primary: #4f46e5;   /* Purple (main theme) */
            --secondary: #10b981; /* Green accent */
            --dark: #1e293b;      /* Dark text/background */
            --light: #f8fafc;     /* Light background */
        }

        /* Overall page look */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: var(--dark);
            background-color: var(--light);
        }

        /* Sticky header at the top */
        header {
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 1rem;
            position: sticky; /* stays visible when scrolling */
            top: 0;
            z-index: 100; /* stays above other content */
        }

        /* Navigation bar */
        nav {
            display: flex;
            justify-content: space-between; /* logo on left, links on right */
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }

        /* Logo text */
        .logo {
            font-weight: bold;
            font-size: 1.5rem;
            color: var(--primary);
        }

        /* Navigation links container */
        .nav-links {
            display: flex;
            gap: 1.5rem; /* space between links */
        }

        /* Styling for each link */
        .nav-links a {
            text-decoration: none;
            color: var(--dark);
            font-weight: 500;
            transition: color 0.3s; /* smooth hover effect */
        }

        .nav-links a:hover {
            color: var(--primary);
        }

        /* Container for the main page content */
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        h1 {
            color: var(--primary);
            margin-top: 0;
        }

        /* White content boxes */
        .content-section {
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        /* Section titles */
        .content-section h2 {
            color: var(--secondary);
            border-bottom: 2px solid var(--secondary);
            padding-bottom: 0.5rem;
            margin-top: 0;
        }

        /* Footer styling */
        footer {
            background-color: var(--dark);
            color: white;
            text-align: center;
            padding: 2rem 1rem;
            margin-top: 3rem;
        }

        /* Mobile-friendly adjustments */
        @media (max-width: 768px) {
            .nav-links {
                gap: 1rem; /* smaller gap on small screens */
            }
        }
    </style>
    `,
    installation: `
    <!-- Header with navigation bar -->
    <header>
        <nav>
            <div class="logo">Dedupe Project</div>
            <div class="nav-links">
                <!-- Navigation links to other pages -->
                <a href="index.html">Home</a>
                <a href="deduplication.html">Deduplication</a>
                <a href="installation.html">Installation</a>
				<a href="user-stories.html">User Stories</a>
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
                <pre>cd "C:\\Users\\&lt;you&gt;\\Documents\\ProjectB"</pre>
            </div>

            <h3>Create & activate a virtual environment</h3>
            <p><strong>Create:</strong> <code>py -3.11 -m venv .venv</code></p>
            <p><strong>Allow activation for this session:</strong> <code>Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass</code></p>
            <p><strong>Activate:</strong> <code>. .\\.venv\\Scripts\\Activate.ps1</code> (PowerShell)</p>
            <p><strong>(or)</strong> <code>.\\.venv\\Scripts\\activate.bat</code> (Command Prompt)</p>

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
        <p>&copy; 2023 Dedupe Project. All rights reserved.</p>
    </footer>

    <!-- CSS Styles directly inside this page (instead of separate file) -->
    <style>
        :root {
            --primary: #4f46e5;
            --secondary: #10b981;
            --dark: #1e293b;
            --light: #f8fafc;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: var(--dark);
            background-color: var(--light);
        }

        header {
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 1rem;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }

        .logo {
            font-weight: bold;
            font-size: 1.5rem;
            color: var(--primary);
        }

        .nav-links {
            display: flex;
            gap: 1.5rem;
        }

        .nav-links a {
            text-decoration: none;
            color: var(--dark);
            font-weight: 500;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: var(--primary);
        }

        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        h1 {
            color: var(--primary);
            margin-top: 0;
        }

        .content-section {
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .content-section h2 {
            color: var(--secondary);
            border-bottom: 2px solid var(--secondary);
            padding-bottom: 0.5rem;
            margin-top: 0;
        }

        .tech-diagram {
            background: #f1f5f9;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
            text-align: left;
        }

        footer {
            background-color: var(--dark);
            color: white;
            text-align: center;
            padding: 2rem 1rem;
            margin-top: 3rem;
        }

        @media (max-width: 768px) {
            .nav-links {
                gap: 1rem;
            }
        }
    </style>
    `,
    'user-stories': `
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
                    <li>Include graphical visualisations (e.g...(truncated 8391 characters)... are placed here inside <style> so no separate file is needed -->
                    <style>
        /* Color variables that can be reused across the page */
        :root {
            --primary: #4f46e5;   /* Main purple color */
            --secondary: #10b981; /* Green accent color */
            --dark: #1e293b;      /* Dark text color */
            --light: #f8fafc;     /* Light background color */
        }

        /* General page styling */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: var(--dark);
            background-color: var(--light);
        }

        /* Header bar with sticky position */
        header {
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 1rem;
            position: sticky; /* keeps header visible when scrolling */
            top: 0;
            z-index: 100; /* ensures it stays on top of other content */
        }

        /* Navigation bar layout */
        nav {
            display: flex;
            justify-content: space-between; /* spaces logo and links apart */
            align-items: center;
            max-width: 1200px;
            margin: 0 auto; /* centers nav content */
        }

        /* Logo styling */
        .logo {
            font-weight: bold;
            font-size: 1.5rem;
            color: var(--primary);
        }

        /* Navigation links layout */
        .nav-links {
            display: flex;
            gap: 1.5rem; /* space between links */
        }

        /* Styling for each navigation link */
        .nav-links a {
            text-decoration: none;
            color: var(--dark);
            font-weight: 500;
            transition: color 0.3s; /* smooth color change */
        }

        .nav-links a:hover {
            color: var(--primary); /* turns purple when hovered */
        }

        /* Hero section (big top banner) */
        .hero {
            text-align: center;
            padding: 4rem 1rem;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }

        .hero h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: var(--primary);
        }

        .hero p {
            font-size: 1.2rem;
            max-width: 700px;
            margin: 0 auto 2rem; /* centers text and adds spacing */
        }

        /* Button styling */
        .btn {
            display: inline-block;
            background-color: var(--primary);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.3s;
        }

        .btn:hover {
            background-color: #4338ca; /* darker purple on hover */
        }

        /* Main content container */
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        h1 {
            color: var(--primary);
            margin-top: 0;
        }

        /* Section box styling */
        .content-section {
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .content-section h2 {
            color: var(--secondary);
            border-bottom: 2px solid var(--secondary);
            padding-bottom: 0.5rem;
            margin-top: 0;
        }

        /* Tech diagram placeholder style */
        .tech-diagram {
            background: #f1f5f9;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        /* Features grid layout */
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }

        /* Each feature card */
        .feature-card {
            background: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .feature-card h3 {
            color: var(--primary);
            margin-top: 0;
        }

        /* Footer styling */
        footer {
            background-color: var(--dark);
            color: white;
            text-align: center;
            padding: 2rem 1rem;
            margin-top: 3rem;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
            .nav-links {
                gap: 1rem;
            }
            .hero h1 {
                font-size: 2rem; /* smaller title on mobile */
            }
        }
		
        /* Table styling */
        .params-table {
            width: 100%;
            border-collapse: collapse;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 0.95rem;
            color: #1e293b;
        }

        /* Header cells */
        .params-table thead th {
            background-color: #f1f5f9; /* light grey header */
            border: 1px solid #cbd5e1;
            padding: 10px 12px;
            text-align: left;
            font-weight: 600;
        }

        /* Table body cells */
        .params-table td {
            border: 1px solid #cbd5e1;
            padding: 10px 12px;
            vertical-align: top;
        }

        /* First column bold */
        .params-table td:first-child {
            font-weight: 600;
            width: 18%;
        }

        /* Optional zebra striping for readability */
        .params-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* User story container */
        .user-story {
            background: #f8fafc;
            border-left: 4px solid var(--primary);
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-radius: 0.375rem;
        }

        .user-story h3, .user-story h4 {
            color: var(--primary);
            margin-top: 0;
        }

        /* Story metadata badges */
        .story-meta {
            display: flex;
            justify-content: space-between;
            margin: 1rem 0;
            gap: 1rem;
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
            background-color: #fee2e2;
            color: #991b1b;
        }

        .priority.medium {
            background-color: #fef3c7;
            color: #92400e;
        }

        .priority.low {
            background-color: #dbeafe;
            color: #1e40af;
        }

        /* Story points badge */
        .story-points {
            background-color: #dbeafe;
            color: #1e40af;
        }

    </style>
    `
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
          <button
            onClick={() => setShowWebsite(true)}
            className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-2 px-4 rounded-lg font-medium text-sm"
          >
            <Database size={18} />
            View Ivan's Website
          </button>
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

        {/* Ivan's Website Modal */}
        {showWebsite && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="text-blue-400" size={24} />
                  <h2 className="text-2xl font-bold">Ivan's Website - Dedupe Project</h2>
                </div>
                <button
                  onClick={() => setShowWebsite(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
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