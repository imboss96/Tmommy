# Deploy Tmommycares to an Ubuntu VPS

This guide deploys the MommyCare frontend and Express API to an Ubuntu VPS using Nginx, PM2, and HTTPS for `tmommycares.com` and `www.tmommycares.com`.

The examples use `/var/www/mommycare` as the application directory and assume your code is pushed to `https://github.com/imboss96/Tmommy.git`. Replace the repository URL if you use a fork or private repository.

## 1. Point the domain to your VPS

At the company that manages your domain's DNS, create or update these records with your VPS public IPv4 address:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | Your VPS IPv4 address |
| A | `www` | Your VPS IPv4 address |

Remove conflicting A records or URL redirects. If you have an AAAA record, make sure the VPS is configured for IPv6; otherwise remove that record to avoid some visitors reaching the wrong server. DNS changes can take time to propagate.

## 2. Prepare Ubuntu

Connect to the VPS over SSH, then install Nginx, Git, Node.js 22, and PM2:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node --version
npm --version
```

Allow SSH, HTTP, and HTTPS through the VPS firewall. For a VPS using UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw status
```

Do not expose port `5000` publicly. Nginx proxies API requests to the backend on the VPS itself.

## 3. Get the project onto the VPS

Clone the repository:

```bash
sudo mkdir -p /var/www/mommycare
sudo chown "$USER":"$USER" /var/www/mommycare
git clone https://github.com/imboss96/Tmommy.git /var/www/mommycare
cd /var/www/mommycare
npm ci
```

If the repository is private, configure GitHub access on the VPS using a deploy key or another approved Git credential method. Do not put access tokens in the clone URL or commit them to the repository.

## 4. Configure production environment variables

Create the private environment file:

```bash
nano /var/www/mommycare/.env.local
```

Enter your real production values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_API_URL=https://tmommycares.com

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
BREVO_API_KEY=YOUR_BREVO_API_KEY
BREVO_SENDER_EMAIL=app@tmommycares.com
BREVO_SENDER_NAME=MommyCare
NOTIFICATION_EMAIL=info@tmommycares.com
APP_URL=https://tmommycares.com
PORT=5000
```

Use the Supabase project URL and public anon key from the Supabase project settings. The service-role key and Cloudinary API secret must remain private; never use them as `VITE_` variables or commit `.env.local`.

### Set up administrator one-time codes

The `/admin` console requires an email one-time code for each new browser session. Configure this in the Supabase Dashboard under **Authentication → Email → SMTP Settings** and **Email Templates**:

1. In Brevo, verify `tmommycares.com` and add `no-reply@tmommycares.com` as a verified sender.
2. In Brevo **Settings → SMTP & API**, generate an SMTP key. In Supabase SMTP Settings, use host `smtp-relay.brevo.com`, port `587`, the SMTP login shown in Brevo, and that SMTP key as the password. Set the sender email to `no-reply@tmommycares.com` and sender name to `MommyCare`. The existing `BREVO_API_KEY` is for app notifications; it is not an SMTP password.
3. In Supabase **Email Templates → Magic Link**, replace the link-based content with a code-only message. For example, set the subject to `Your MommyCare administrator code` and the body to:

   ```html
   <h2>Your administrator sign-in code</h2>
   <p>Enter this one-time code in the MommyCare administrator sign-in screen:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
   <p>If you did not request this code, you can ignore this email.</p>
   ```

   Do not include `{{ .ConfirmationURL }}` in this template; the app verifies the numeric code using Supabase Auth.
4. Bootstrap the first administrator manually: create their account in Supabase Authentication and add a matching `admin_users.email` row with `status = 'active'`. The first administrator is needed to access the protected invitation panel.
5. After the first administrator can sign in, invite additional administrators from **Admin console → Site Settings → Invite an administrator**. Supabase sends the invitation email through the configured SMTP sender. The invited person accepts it, then uses the one-time email code on `/admin` for later sign-ins. Invitation delivery also depends on the Supabase SMTP settings above.

Admin API routes accept only a valid Supabase session belonging to an active administrator. The invitation panel adds invited addresses to `admin_users`; to revoke access, set that address's status to `disabled` in the table.

The sender address above is the **From** address shown in the message. The code is delivered to the administrator email entered on the `/admin` screen. Supabase documents OTP templates and custom SMTP in its [email template guide](https://supabase.com/docs/guides/auth/auth-email-templates) and [custom SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp). Brevo lists its SMTP host and credential requirements in its [SMTP setup guide](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP).

`VITE_API_URL` is embedded in the frontend at build time. Set it to `https://tmommycares.com` before building. The site also serves on `www.tmommycares.com`; Nginx will accept requests to both names.

### Set up Brevo email notifications

1. Create or sign in to your Brevo account and generate a transactional email API key.
2. Authenticate `tmommycares.com` in Brevo by adding the DNS records Brevo provides, then verify `app@tmommycares.com` as a sender. If you use a different verified sender, set it as `BREVO_SENDER_EMAIL`.
3. Put the API key in `BREVO_API_KEY` and keep it private. Set `NOTIFICATION_EMAIL` to `info@tmommycares.com` (or another inbox you monitor).
4. Save `.env.local`. The API sends notification emails after successfully saving client bookings, emergency requests, contact inquiries, and provider applications. Review form submissions and attachments in the admin dashboard; provider document files are not attached to notification emails.

If Brevo is not configured or rejects a send, the form submission remains saved and the API records the notification failure in its PM2 logs.

## 5. Apply database migrations

In the Supabase SQL Editor or using your established Supabase migration workflow, apply the SQL files in `supabase/migrations/` in order. Include the provider applications migration (`006_provider_applications.sql`) if you use provider applications and their private document storage.

## 6. Build the frontend and start the API

Run the checks and create the production frontend build:

```bash
cd /var/www/mommycare
npm run lint
npm run build
```

Start the Express API with the provided PM2 configuration and enable startup on reboot:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Run the `sudo` command printed by `pm2 startup`, then save the process list again:

```bash
pm2 save
pm2 status
```

The API listens on port `5000`; Nginx will forward `/api/` requests to it.

## 7. Configure Nginx

Install the repository's Nginx configuration, set the domain names, enable it, and validate the configuration:

```bash
sudo cp /var/www/mommycare/deploy/nginx-mommycare.conf /etc/nginx/sites-available/mommycare
sudo sed -i 's/example.com/tmommycares.com/g' /etc/nginx/sites-available/mommycare
sudo ln -s /etc/nginx/sites-available/mommycare /etc/nginx/sites-enabled/mommycare
sudo nginx -t
sudo systemctl reload nginx
```

If `ln` reports that the site is already enabled, do not create another link; continue after confirming `/etc/nginx/sites-enabled/mommycare` points to the file in `sites-available`.

## 8. Enable HTTPS

Confirm both domain names resolve to the VPS and that ports 80 and 443 are reachable. Then install a Let's Encrypt certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tmommycares.com -d www.tmommycares.com
sudo certbot renew --dry-run
```

Choose the HTTPS redirect option if Certbot offers it.

## 9. Verify the deployment

Check the API locally on the VPS:

```bash
curl http://127.0.0.1:5000/api/health
```

The response should be JSON with `"ok":true`. Then check the public HTTPS endpoints:

```bash
curl -I https://tmommycares.com
curl https://tmommycares.com/api/health
```

Open `https://tmommycares.com` in a browser and verify the page and API-backed content load. If the API is unavailable, inspect PM2 and Nginx:

```bash
pm2 status
pm2 logs mommycare-api
sudo nginx -t
sudo tail -n 100 /var/log/nginx/error.log
```

## 10. Deploy future changes

From the VPS:

```bash
cd /var/www/mommycare
git pull
npm ci
npm run lint
npm run build
pm2 restart mommycare-api
```

Changes to frontend code require rebuilding with `npm run build`. If you change a `VITE_` environment variable, rebuild so the new value is included in the frontend. Do not overwrite `.env.local` when deploying.

For application and Nginx details, see [the deployment overview](./README.md).
