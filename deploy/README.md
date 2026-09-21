# GitHub -> Hostinger VPS deployment

## 1. Push the project to GitHub

Run these commands on your Windows machine after installing Git and creating an empty GitHub repository:

```powershell
git init
git add .
git commit -m "Prepare MommyCare for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Never commit `.env`, `.env.local`, Supabase service-role keys, Cloudinary secrets, or the admin PIN.

## 2. Point Namecheap DNS to Hostinger

In Namecheap Advanced DNS, create or update:

- `A` record, host `@`, value: your Hostinger VPS IPv4 address
- `A` record, host `www`, value: your Hostinger VPS IPv4 address

Remove conflicting URL redirects or old A records. DNS can take time to propagate.

## 3. Prepare Ubuntu on Hostinger

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
sudo mkdir -p /var/www/mommycare
sudo chown -R $USER:$USER /var/www/mommycare
```

## 4. Clone and build

Replace the repository URL with your GitHub repository:

```bash
cd /var/www
rm -rf mommycare
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY.git mommycare
cd /var/www/mommycare
npm ci
```

Create the private production environment file:

```bash
nano /var/www/mommycare/.env.local
```

Use your real values. The frontend must use the same public origin for API requests:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_API_URL=https://example.com

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
APP_URL=https://example.com
PORT=5000
ADMIN_PIN=USE_A_LONG_RANDOM_PIN
```

Build the frontend and start the API:

```bash
npm run lint
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup`, then run `pm2 save` again.

## 5. Configure Nginx

```bash
sudo cp deploy/nginx-mommycare.conf /etc/nginx/sites-available/mommycare
sudo sed -i 's/example.com/your-real-domain.com/g' /etc/nginx/sites-available/mommycare
sudo ln -s /etc/nginx/sites-available/mommycare /etc/nginx/sites-enabled/mommycare
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Enable HTTPS

After DNS points to the VPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-real-domain.com -d www.your-real-domain.com
sudo certbot renew --dry-run
```

## 7. Future deployments

```bash
cd /var/www/mommycare
git pull origin main
npm ci
npm run lint
npm run build
pm2 restart mommycare-api
```

Apply Supabase migrations separately from the VPS using the Supabase dashboard or Supabase CLI, especially `supabase/migrations/005_reviews.sql`.
