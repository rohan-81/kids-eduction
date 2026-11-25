# KidsZone Backend - Production Deployment & Operations Guide

This guide details the steps to deploy the Django backend for the Kids Learning Application in a production environment with PostgreSQL, Gunicorn, Nginx, and automatic static content ingestion.

---

## 1. Prerequisites

- Python 3.10+
- Node.js 18+ (used for running the static data extractor)
- PostgreSQL 14+
- Nginx & Gunicorn
- SSL Certificate (Let's Encrypt / Certbot)

---

## 2. Server Setup & PostgreSQL Initialization

### A. Create PostgreSQL Database and User
```bash
sudo -u postgres psql

-- Inside PostgreSQL prompt:
CREATE DATABASE kidszone_db WITH ENCODING 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';
CREATE USER kidszone_user WITH PASSWORD 'YourStrongSecurePasswordHere!';
GRANT ALL PRIVILEGES ON DATABASE kidszone_db TO kidszone_user;
ALTER DATABASE kidszone_db OWNER TO kidszone_user;
\q
```

---

## 3. Application Deployment & Environment Setup

### A. Clone Codebase & Create Virtual Environment
```bash
cd /var/www/kids-education
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### B. Configure Environment Variables
Copy the template and fill in production secrets:
```bash
cp backend/.env.example backend/.env
nano backend/.env
```
Ensure:
- `DJANGO_DEBUG=False`
- `DJANGO_SECRET_KEY` is a unique 50+ character random string
- `DATABASE_URL=postgres://kidszone_user:YourStrongSecurePasswordHere!@localhost:5432/kidszone_db`
- `DJANGO_ALLOWED_HOSTS=api.yourkidsdomain.com`

---

## 4. Database Migrations & Content Ingestion

### A. Apply Database Migrations
```bash
cd backend
python manage.py migrate
```

### B. Single Command Automatic Educational Content Import
Run the centralized, idempotent import tool to discover and populate all 1,280+ educational records:
```bash
# Optional dry run to preview discovery metrics:
python manage.py import_all_data --dry-run

# Live import:
python manage.py import_all_data
```

### C. Create Superuser (Admin Dashboard Access)
```bash
python manage.py createsuperuser
```

### D. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

---

## 5. Systemd Service Configuration (Gunicorn)

Create `/etc/systemd/system/kidszone.service`:
```ini
[Unit]
Description=KidsZone Django Backend Daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/kids-education/backend
ExecStart=/var/www/kids-education/venv/bin/gunicorn \
          --access-logfile /var/log/kidszone_access.log \
          --error-logfile /var/log/kidszone_error.log \
          --workers 3 \
          --bind 127.0.0.1:8000 \
          config.wsgi:application

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start kidszone
sudo systemctl enable kidszone
```

---

## 6. Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/kidszone`:
```nginx
server {
    listen 80;
    server_name api.yourkidsdomain.com;

    location /static/ {
        alias /var/www/kids-education/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/kids-education/backend/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable site and obtain SSL:
```bash
sudo ln -s /etc/nginx/sites-available/kidszone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d api.yourkidsdomain.com
```

---

## 7. PostgreSQL Backup & Restore Strategy

### Automated Nightly Backup Cron
Add to crontab (`crontab -e`):
```bash
0 2 * * * pg_dump -U kidszone_user -h localhost kidszone_db | gzip > /var/backups/kidszone_db_$(date +\%F).sql.gz
```

### Manual Backup:
```bash
pg_dump -U kidszone_user -h localhost kidszone_db > backup_kidszone.sql
```

### Restore:
```bash
psql -U kidszone_user -h localhost kidszone_db < backup_kidszone.sql
```
