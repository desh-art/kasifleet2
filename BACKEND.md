# Kassi Fleet backend

The backend uses only Node.js built-in modules. It serves the existing portal files and API from `http://127.0.0.1:3000`, and saves local development data in `data/kassifleet.json`.

## Start

Install Node.js 18 or newer, open PowerShell in this folder, then run:

```powershell
npm start
```

Open `http://127.0.0.1:3000/driver.index.html` for the driver portal. Use the server URL instead of opening the HTML files directly.

New drivers can register with their name, email, and password. Their account is saved locally and they are signed in immediately. This stores an email address but does not send a verification or confirmation email; sending email requires an SMTP provider and credentials.

## Optional demo accounts

Set these environment variables before starting the server to seed accounts for the other existing portals. Each account is only added if its email is not already registered.

```powershell
$env:KF_CUSTOMER_EMAIL = "customer@example.com"
$env:KF_CUSTOMER_PASSWORD = "choose-a-long-password"
$env:KF_VENDOR_EMAIL = "vendor@example.com"
$env:KF_VENDOR_PASSWORD = "choose-a-long-password"
$env:KF_ADMIN_EMAIL = "admin@example.com"
$env:KF_ADMIN_PASSWORD = "choose-a-long-password"
npm start
```

For deployment, set `KF_HOST`, `PORT`, and a long random `KF_TOKEN_SECRET`; use HTTPS and a production database. This local JSON-backed server is intended for development and demonstration, not public internet deployment.

## API

- `POST /api01/auth/register` creates a driver account.
- `POST /api01/auth/login` signs in any configured account.
- `GET /api02/menu` lists available dishes; `POST /api02/menu` adds a vendor dish.
- `POST /api03/orders` creates a delivery order for a customer and assigns it to a registered driver.
- `GET /api04/dispatch/my-deliveries` lists the signed-in driver's orders.
- `PATCH /api04/dispatch/:id/status` advances an assigned delivery from `assigned` to `picked_up` or from `picked_up` to `delivered`.
- `GET /api05/admin/overview` returns aggregate counts for an administrator.