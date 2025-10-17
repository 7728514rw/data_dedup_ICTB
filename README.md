# Federated Unlearning Dashboard (React + Vite + Tailwind)

**New features added (per feedback):**
- Dataset switcher (MNIST / CIFAR-10 / CIFAR-100)
- Attack parameter selection (type, duplicate ratio, strategy, clients affected, target class)
- GDPR parameters (subject ID, unlearning mode, retention, DP on/off + epsilon, audit log)

## Quickstart
```bash
npm install
npm run dev
```
Open the printed URL (e.g. http://localhost:5173).

## Configure backend (optional)
Create `.env`:
```
VITE_API_URL=http://localhost:8000
```
The "Apply & Start Run" button posts the config to your backend (code is stubbed — uncomment to enable).
