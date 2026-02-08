# StudyAI – End-to-End Deployment Guide (Hostinger Ubuntu 24.04 LTS + Docker)

Complete deployment guide for StudyAI on Hostinger VPS running Ubuntu 24.04 LTS with Docker.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Get VPS Access](#2-get-vps-access)
3. [Connect via SSH](#3-connect-via-ssh)
4. [Install Docker](#4-install-docker)
5. [Clone the Repository](#5-clone-the-repository)
6. [Create Environment File (.env)](#6-create-environment-file-env)
7. [Build and Run Containers](#7-build-and-run-containers)
8. [Configure Firewall](#8-configure-firewall)
9. [Verify Deployment](#9-verify-deployment)
10. [Access the Application](#10-access-the-application)
11. [Optional: HTTPS with Nginx](#11-optional-https-with-nginx)
12. [Optional: Auto-Start on Reboot](#12-optional-auto-start-on-reboot)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Prerequisites

Before starting, ensure you have:

| Item | Description |
|------|-------------|
| **Hostinger VPS** | Ubuntu 24.04 LTS |
| **VPS IP** | From Hostinger hPanel (e.g. `147.93.29.215`) |
| **SSH credentials** | root or sudo user |
| **Neon Postgres** | Connection string from [neon.tech](https://neon.tech) |
| **Ollama API key** | From [ollama.com/settings/keys](https://ollama.com/settings/keys) (or OpenRouter API key) |
| **GitHub repo** | [https://github.com/Abhra1980/studyai_v1](https://github.com/Abhra1980/studyai_v1) |

---

## 2. Get VPS Access

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com)
2. Go to **VPS** → Select your server
3. Note your **IP address** (e.g. `147.93.29.215`)
4. Use **SSH Access** or **Terminal** from Hostinger to connect

---

## 3. Connect via SSH

From your local machine (Windows: use PowerShell, CMD, or PuTTY):

```bash
ssh root@YOUR_VPS_IP
```

Example:
```bash
ssh root@147.93.29.215
```

Enter your SSH password when prompted. You should see a prompt like:
```
root@srv1344811:~#
```

---

## 4. Install Docker

Run these commands on the VPS:

```bash
# Update packages
sudo apt update

# Install Docker and Docker Compose
sudo apt install -y docker.io docker-compose-v2

# Enable Docker to start on boot
sudo systemctl enable docker

# Start Docker
sudo systemctl start docker

# Verify Docker is running
docker --version
docker compose version
```

You should see version numbers for both commands.

---

## 5. Clone the Repository

```bash
# Create directory (if /var/www doesn't exist)
sudo mkdir -p /var/www
cd /var/www

# Clone the StudyAI repo
sudo git clone https://github.com/Abhra1980/studyai_v1.git

# Enter project directory
cd studyai_v1
```

Alternative path (e.g. user home):
```bash
cd ~
git clone https://github.com/Abhra1980/studyai_v1.git
cd studyai_v1
```

---

## 6. Create Environment File (.env)

The backend **requires** a `.env` file. Without it, the backend container will **exit**.

```bash
cd /var/www/studyai_v1   # or ~/studyai_v1

# Copy template
cp .env.example .env

# Edit .env
nano .env
```

**Set these required values** (replace placeholders):

```env
# ── Database (REQUIRED) ────────────────────────────────────────────
neon_db_api_key=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require

# ── JWT Auth (REQUIRED) ────────────────────────────────────────────
JWT_SECRET_KEY=generate-a-long-random-string-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# ── LLM Provider (REQUIRED) ────────────────────────────────────────
LLM_PROVIDER=ollama

# Ollama Cloud (recommended for VPS)
OLLAMA_BASE_URL=https://ollama.com
OLLAMA_MODEL=gpt-oss:120b-cloud
OLLAMA_API_KEY=your-ollama-api-key-from-ollama-com

# ── Production ─────────────────────────────────────────────────────
DEV_AUTO_LOGIN_ENABLED=false
```

**How to get values:**

| Variable | Source |
|----------|--------|
| `neon_db_api_key` | [Neon Console](https://console.neon.tech) → Connection string |
| `JWT_SECRET_KEY` | Generate: `openssl rand -hex 32` |
| `OLLAMA_API_KEY` | [ollama.com/settings/keys](https://ollama.com/settings/keys) |

**Save and exit:** `Ctrl+O`, Enter, then `Ctrl+X`.

---

## 7. Build and Run Containers

```bash
cd /var/www/studyai_v1   # or your project path

# Build and start (first time takes a few minutes)
docker compose up -d --build
```

Wait until you see:
```
✓ Container studyai_v1-backend-1 Started
✓ Container studyai_v1-frontend-1 Started
```

Check status:
```bash
docker compose ps
```

Both `backend` and `frontend` should show **Up**.

---

## 8. Configure Firewall

Allow external access to the app:

```bash
# Allow SSH first (IMPORTANT – prevents lockout)
sudo ufw allow 22/tcp

# Allow web ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp

# Enable firewall
sudo ufw enable
```

When prompted: **Command may disrupt existing ssh connections. Proceed with operation (y/n)?**  
Type **y** and press Enter.

Verify:
```bash
sudo ufw status
```

You should see ports 22, 80, 443, 8080 as ALLOW.

---

## 9. Verify Deployment

```bash
# Check containers
docker compose ps

# Test health endpoint (use 8080 if frontend is on 8080)
curl http://localhost:8080/api/v1/health
```

Expected response:
```json
{"status":"healthy","app":"StudyAI","version":"1.0.0","database":"connected",...}
```

---

## 10. Access the Application

Open a browser and go to:

```
http://YOUR_VPS_IP:8080
```

Example:
```
http://147.93.29.215:8080
```

You should see the StudyAI login page.

---

## 11. Optional: HTTPS with Nginx

To use a domain and HTTPS:

### 11.1 Point domain to VPS

In your domain DNS settings, add an **A record** pointing to your VPS IP.

### 11.2 Install Nginx and Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 11.3 Get SSL certificate

```bash
sudo certbot --nginx -d yourdomain.com
```

Follow the prompts (email, agree to terms).

### 11.4 Configure Nginx to proxy to Docker

```bash
sudo nano /etc/nginx/sites-available/studyai
```

Add:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/studyai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Access via: **https://yourdomain.com**

---

## 12. Optional: Auto-Start on Reboot

To start containers automatically after VPS reboot:

```bash
crontab -e
```

Add this line (adjust path if needed):
```
@reboot cd /var/www/studyai_v1 && docker compose up -d
```

Save and exit.

---

## 13. Troubleshooting

### Backend container exits

**Check logs:**
```bash
docker compose logs backend
```

**Common causes:**

| Cause | Fix |
|-------|-----|
| Missing `.env` | Create `.env` from `.env.example` with real values |
| Invalid `neon_db_api_key` | Verify connection string in Neon Console |
| Missing `OLLAMA_API_KEY` | Add key from [ollama.com/settings/keys](https://ollama.com/settings/keys) |
| Wrong `OLLAMA_BASE_URL` | Use `https://ollama.com` for Ollama Cloud |

### Frontend works, backend exits

Ensure `.env` is in the project root and contains all required variables. The `env_file: .env` in docker-compose loads from the project directory.

### Connection timeout (ERR_CONNECTION_TIMED_OUT)

- Open port 8080 in firewall: `sudo ufw allow 8080/tcp && sudo ufw reload`
- Verify containers are running: `docker compose ps`

### Port 80 vs 8080

- Default: frontend runs on **8080** → use `http://YOUR_IP:8080`
- To use port 80: edit `docker-compose.yml`, change frontend ports to `"80:80"`, then `docker compose up -d`

### Restart containers

```bash
docker compose down
docker compose up -d
```

### Pull latest code and redeploy

```bash
cd /var/www/studyai_v1
git pull
docker compose up -d --build
```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| View all logs | `docker compose logs -f` |
| View backend logs | `docker compose logs backend` |
| View frontend logs | `docker compose logs frontend` |
| Restart | `docker compose restart` |
| Stop | `docker compose down` |
| Start | `docker compose up -d` |
| Rebuild & start | `docker compose up -d --build` |
| Check status | `docker compose ps` |

---

## Deployment Checklist

- [ ] SSH to VPS
- [ ] Install Docker
- [ ] Clone repo
- [ ] Create `.env` with real values (neon_db_api_key, JWT_SECRET_KEY, OLLAMA_*)
- [ ] Run `docker compose up -d --build`
- [ ] Verify both backend and frontend are Up
- [ ] Configure firewall (22, 80, 443, 8080)
- [ ] Access app at `http://YOUR_VPS_IP:8080`
- [ ] (Optional) Set up nginx + Certbot for HTTPS
- [ ] (Optional) Add crontab for auto-start on reboot
