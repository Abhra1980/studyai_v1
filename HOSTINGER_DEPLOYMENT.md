# Deploying StudyAI to Hostinger via Docker

Complete step-by-step guide for deploying the StudyAI application as Docker containers on Hostinger VPS.

---

## Prerequisites

- Hostinger VPS with Ubuntu 24.04 (Docker pre-installed or install manually)
- Domain with A record pointing to your VPS IP
- SSH access to your VPS
- GitHub repo: [https://github.com/Abhra1980/studyai_v1](https://github.com/Abhra1980/studyai_v1)

---

## Step 1: Connect to Your Hostinger VPS

```bash
ssh root@YOUR_VPS_IP
# Or: ssh username@YOUR_VPS_IP
```

---

## Step 2: Install Docker (if not pre-installed)

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker
```

---

## Step 3: Clone the Repository

```bash
cd /var/www   # or your preferred directory
sudo git clone https://github.com/Abhra1980/studyai_v1.git
cd studyai_v1
```

---

## Step 4: Create `.env` on the VPS

```bash
sudo cp .env.example .env
sudo nano .env
```

Set these values (use your actual credentials):

```env
# Database (Neon Postgres)
neon_db_api_key=postgresql://user:pass@host/dbname?sslmode=require

# JWT Secret (generate a strong random string)
JWT_SECRET_KEY=your-strong-secret-key-here

# LLM (Ollama Cloud – recommended for VPS)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=https://ollama.com
OLLAMA_MODEL=gpt-oss:120b-cloud
OLLAMA_API_KEY=your-ollama-api-key

# Production – disable dev auto-login
DEV_AUTO_LOGIN_ENABLED=false
```

**Getting the Ollama API key:** [ollama.com/settings/keys](https://ollama.com/settings/keys)

---

## Step 5: Adjust docker-compose for Hostinger (Optional)

If port 80 is free on Hostinger, you can change the frontend port in `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "80:80"
```

If port 80 is already in use (e.g. by another app), keep `8080:80` and use port 8080 for access.

---

## Step 6: Build and Run Containers

```bash
cd /var/www/studyai_v1
sudo docker compose up -d --build
```

Wait for the build to complete. Both backend and frontend containers will start.

---

## Step 7: Verify Deployment

```bash
# Check containers are running
sudo docker compose ps

# Test API health
curl http://localhost:80/api/v1/health
# Or if using port 8080:
curl http://localhost:8080/api/v1/health
```

You should see a JSON response with `"status": "ok"`.

---

## Step 8: Set Up HTTPS with Nginx + Certbot (Recommended)

To serve your app over HTTPS with your domain:

```bash
# Install nginx and certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Get SSL certificate (ensure domain A record points to VPS IP first)
sudo certbot --nginx -d yourdomain.com
```

Create an nginx config:

```bash
sudo nano /etc/nginx/sites-available/studyai
```

**If frontend is on port 80 (direct Docker):**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:80;
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

**If frontend is on port 8080:**

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

Enable the site and reload nginx:

```bash
sudo ln -s /etc/nginx/sites-available/studyai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 9: Configure Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Useful Commands on Hostinger

| Task | Command |
|------|---------|
| View logs | `sudo docker compose logs -f` |
| Restart containers | `sudo docker compose restart` |
| Pull updates & redeploy | `cd /var/www/studyai_v1 && sudo git pull && sudo docker compose up -d --build` |
| Stop app | `sudo docker compose down` |
| Start app | `sudo docker compose up -d` |

---

## Auto-Start on Reboot (Optional)

To ensure containers start automatically after VPS reboot:

```bash
# Option A: Crontab
crontab -e
# Add line:
@reboot cd /var/www/studyai_v1 && docker compose up -d

# Option B: Systemd service (create /etc/systemd/system/studyai.service)
# [Unit]
# Description=StudyAI Docker Compose
# Requires=docker.service
# After=docker.service
#
# [Service]
# Type=oneshot
# RemainAfterExit=yes
# WorkingDirectory=/var/www/studyai_v1
# ExecStart=/usr/bin/docker compose up -d
# ExecStop=/usr/bin/docker compose down
# [Install]
# WantedBy=multi-user.target
```

---

## Deployment Architecture on Hostinger

```
User (HTTPS) → Nginx (443) → Docker Compose
                                ├── Frontend (nginx :80/8080)
                                └── Backend (:8000)
                                      ├── Neon Postgres (external)
                                      └── Ollama Cloud (external)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 80 in use | Use `8080:80` for frontend, proxy nginx to 8080 |
| 500 on Generate Content | Check OLLAMA_API_KEY and OLLAMA_BASE_URL in `.env` |
| DB connection failed | Verify neon_db_api_key in `.env` |
| Containers not starting | Run `docker compose logs backend` and `docker compose logs frontend` |

---

## Quick Checklist

- [ ] SSH to VPS
- [ ] Install Docker (if needed)
- [ ] Clone repo from GitHub
- [ ] Create `.env` from `.env.example` with real values
- [ ] Run `docker compose up -d --build`
- [ ] Verify health endpoint
- [ ] (Optional) Set up nginx + Certbot for HTTPS
- [ ] Open firewall (80, 443)
- [ ] Access app at `http://YOUR_IP` or `https://yourdomain.com`
