# Deploy Persis to Azure (full guide)

This document walks you through hosting **Persis** on Azure with:

- **Frontend:** Azure Static Web Apps (React + Vite)
- **Backend:** Azure App Service (.NET 8 Web API)
- **Database:** Azure SQL Database
- **CI/CD:** GitHub Actions (workflows already in this repo)

---

## 1. What you are deploying

| Component | Azure service | Purpose |
|-----------|---------------|---------|
| React app | **Static Web Apps** | Public website (`https://….azurestaticapps.net`) |
| .NET API | **App Service** | REST API (`https://….azurewebsites.net`) |
| Data | **Azure SQL** | Menu items, orders, order lines |

The frontend calls the API using `VITE_API_BASE_URL` at **build time** (see `frontend-swa.yml`). The API must allow the Static Web App origin in **CORS**.

---

## 2. Prerequisites

- Azure subscription ([create free account](https://azure.microsoft.com/free/))
- GitHub repository with this code pushed to **`main`**
- Tools on your PC (for first-time setup and optional local migration):
  - [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
  - [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) (optional but useful)
  - `dotnet-ef` global tool:  
    `dotnet tool install --global dotnet-ef --version 8.0.11`

---

## 3. Create a resource group

1. In [Azure Portal](https://portal.azure.com), search for **Resource groups** → **Create**.
2. **Subscription:** yours  
3. **Resource group name:** e.g. `persis-rg`  
4. **Region:** choose one close to your users (e.g. `East US`)  
5. **Review + create**

Use this group for SQL, App Service, and Static Web App.

---

## 4. Create Azure SQL Database

1. **Create a resource** → **SQL Database** (or **Azure SQL**).
2. **Subscription / Resource group:** select `persis-rg` (or your RG).
3. **Database name:** e.g. `persis-db`
4. **Server:** **Create new**
   - Server name: globally unique, e.g. `persis-sql-xyz`
   - Location: same region as other resources
   - Authentication: **SQL authentication** (note admin login + password)
5. **Workload:** General purpose / serverless is fine for small apps.
6. **Networking:**
   - Allow **public endpoint** for simplicity (you will lock down with firewall rules).
   - Enable **Allow Azure services and resources to access this server** (helps App Service reach SQL).
   - For **first migration from your PC**, add your client IP under firewall rules (or use “Add current client IP”).
7. **Review + create** and wait until deployment finishes.

### Connection string

1. Open the **SQL database** (not only the server) → **Connection strings**.
2. Copy **ADO.NET** connection string.
3. Replace `{your_username}` and `{your_password}` with your SQL admin credentials.

Keep this string secret. You will store it in **GitHub Actions secrets** and **App Service configuration**.

### Firewall note (GitHub Actions migrations)

The workflow **Backend DB Migration (Azure SQL)** runs from **GitHub-hosted runners** (dynamic IPs). If migration fails with “cannot open server”, either:

- Run **`dotnet ef database update`** once **from your PC** (with your IP allowed on the SQL firewall), **or**
- Temporarily add a broader firewall rule (less secure), **or**
- Use a self-hosted runner / private agent with a fixed IP.

For production, App Service should reach SQL using **“Allow Azure services”** plus correct connection string.

---

## 5. Create App Service (backend API)

1. **Create a resource** → **Web App**.
2. **Publish:** Code  
3. **Runtime stack:** **.NET 8** (LTS)  
4. **Operating system:** **Linux** (recommended) or Windows  
5. **Region:** same as resource group  
6. **App name:** globally unique, e.g. `persis-api-yourname`  
   - Your API URL will be: `https://persis-api-yourname.azurewebsites.net`
7. **App Service plan:** create new (e.g. **B1** for dev/test).
8. **Review + create**.

### Configure App Service (required)

Open the Web App → **Configuration** → **Application settings** → **New application setting** (each as separate row):

| Name | Value |
|------|--------|
| `Database__Provider` | `SqlServer` |
| `ConnectionStrings__DefaultConnection` | *(paste full Azure SQL ADO.NET connection string)* |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

**Important:** In Azure UI, connection strings can also be added under **Connection strings** tab with name `DefaultConnection` and type **SQLAzure**. Either approach works if the app reads `ConnectionStrings:DefaultConnection`. This project reads **configuration** `ConnectionStrings__DefaultConnection` / `GetConnectionString("DefaultConnection")` — setting it under **Application settings** as above is correct.

Click **Save** (restart when prompted).

### CORS

The API enables CORS from `appsettings.json` key **`Cors:AllowedOrigins`**.

Add your Static Web App URL after you create it (Step 6), e.g.:

`https://happy-rock-012345678.azurestaticapps.net`

**Option A — config in portal (recommended for quick deploy):**

Add application setting:

| Name | Value |
|------|--------|
| `Cors__AllowedOrigins__0` | `https://YOUR-SWA.azurestaticapps.net` |

For multiple origins, also add `Cors__AllowedOrigins__1`, etc.

**Option B — edit `appsettings.json` in repo** and redeploy (less ideal for secrets).

### Get publish profile (for GitHub deploy)

1. App Service → **Get publish profile** (downloads `.PublishSettings` XML).
2. Open the file in a text editor, **copy entire XML**.
3. You will paste this into GitHub secret **`AZURE_WEBAPP_PUBLISH_PROFILE`**.

---

## 6. Create Static Web App (frontend)

1. **Create a resource** → **Static Web App** → **Create**.
2. **Subscription / Resource group:** same as above.
3. **Name:** e.g. `persis-frontend`
4. **Plan type:** Free (ok to start)
5. **Region:** default is fine (SWA is globally distributed).

### Deployment options

**Option A — GitHub (recommended)**  
- Sign in to GitHub, pick repo and **`main`** branch.  
- **Build Presets:** **Custom**  
  - **App location:** `frontend`  
  - **Api location:** *(leave empty — API is on App Service)*  
  - **Output location:** `dist`  

Azure may add an auto-generated workflow. **This repo already includes** `.github/workflows/frontend-swa.yml`. If Azure adds a second workflow (often wrong `output_location: build`), **delete that generated file** in GitHub and keep only **`frontend-swa.yml`** so builds match Vite’s **`dist`** folder.

**Option B — Deployment token**  
- Choose deployment token, finish create, then copy token from **Manage deployment token** into GitHub secret **`AZURE_STATIC_WEB_APPS_API_TOKEN`**.

After creation, note:

- **SWA URL:** `https://<name>.azurestaticapps.net`  
- Add this URL to API **CORS** (Step 5).

---

## 7. GitHub repository secrets

In GitHub: **Repository → Settings → Secrets and variables → Actions → New repository secret**.

Secret **names** must be alphanumeric + underscores only (exact spelling matters).

| Secret name | What to paste |
|-------------|----------------|
| `AZURE_WEBAPP_NAME` | App Service **name** only (not URL), e.g. `persis-api-yourname` |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Full **Publish profile** XML from App Service |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Static Web App **deployment token** |
| `VITE_API_BASE_URL` | Backend public URL, **no trailing slash**, e.g. `https://persis-api-yourname.azurewebsites.net` |
| `AZURE_SQL_CONNECTION_STRING` | Full Azure SQL **ADO.NET** connection string (for migration workflow) |

---

## 8. Run database migrations

Apply EF schema to Azure SQL **before** or **right after** first API deploy.

### Option A — GitHub Actions (automated)

1. **Actions** → **Backend DB Migration (Azure SQL)** → **Run workflow**  
2. Ensure SQL firewall allows the runner (see Step 4). If it fails, use Option B.

### Option B — Your PC (reliable)

```powershell
$env:Database__Provider = "SqlServer"
$env:ConnectionStrings__DefaultConnection = "<your-azure-sql-connection-string>"
cd path\to\persis\backend\Persis.Api
dotnet ef database update
```

Ensure your IP is allowed on the SQL server firewall.

On first run with an empty database, the app also **seeds** sample menu items (`DbSeeder`).

---

## 9. Deploy backend and frontend (GitHub Actions)

### Order (recommended)

1. **Backend DB Migration (Azure SQL)** — schema ready  
2. **Backend Deploy (App Service)** — API live  
3. **Frontend Deploy (Static Web Apps)** — site built with correct `VITE_API_BASE_URL`

Workflows also run on push to `main` when matching paths change:

- `backend/**` → backend deploy + migration workflows  
- `frontend/**` → frontend SWA workflow  

You can always use **Run workflow** manually (**workflow_dispatch**).

---

## 10. Verify production

1. Open **Static Web App URL** in a browser.
2. Confirm the **menu loads** (calls `GET /api/menu` via your API URL baked into the build).
3. Add items → **Payment** → **Place order**.
4. Open `https://<your-api>.azurewebsites.net/api/orders` (GET) — order should appear.
5. Optional: `https://<your-api>.azurewebsites.net/swagger` — only if Swagger is enabled in that environment (this project enables Swagger in **Development**; Production may not show it unless you change code).

---

## 11. Configuration checklist (copy/paste)

**App Service**

- [ ] `Database__Provider` = `SqlServer`  
- [ ] `ConnectionStrings__DefaultConnection` = Azure SQL connection string  
- [ ] `ASPNETCORE_ENVIRONMENT` = `Production`  
- [ ] CORS includes `https://<your-swa>.azurestaticapps.net`  

**GitHub secrets**

- [ ] `AZURE_WEBAPP_NAME`  
- [ ] `AZURE_WEBAPP_PUBLISH_PROFILE`  
- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN`  
- [ ] `VITE_API_BASE_URL`  
- [ ] `AZURE_SQL_CONNECTION_STRING`  

**Azure SQL**

- [ ] Firewall allows App Service (Azure services)  
- [ ] Firewall allows your IP if running migrations locally  
- [ ] Migrations applied (`dotnet ef database update`)  

**Static Web App**

- [ ] Build: app `frontend`, output `dist`, API location empty  
- [ ] No duplicate auto-generated workflow with wrong `output_location`  

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Menu blank / network error in browser | Wrong `VITE_API_BASE_URL` at build time | Fix secret, re-run **Frontend Deploy** |
| CORS error in browser console | API CORS missing SWA URL | Add `Cors__AllowedOrigins__0` on App Service |
| API 500 on startup | Missing connection string or wrong `Database__Provider` | Check App Service application settings |
| Migration workflow fails | SQL firewall blocks GitHub IP | Run `dotnet ef database update` from your PC or adjust firewall |
| SWA deploy fails | Wrong token or wrong `output_location` | Token in `AZURE_STATIC_WEB_APPS_API_TOKEN`; output must be **`dist`** |
| App Service deploy fails | Bad publish profile or wrong app name | Re-download publish profile; secret `AZURE_WEBAPP_NAME` must match app name |

---

## 13. Security reminders

- Never commit Azure SQL passwords or publish profiles to git.  
- Rotate credentials if they were ever committed or shared.  
- Prefer **User secrets** locally and **Azure App Service configuration** / **Key Vault** in production for connection strings.  
- Payment in this app is **simulated**; do not send real card data in production without a PCI-compliant provider.

---

## 14. Local development vs Azure

| Environment | Frontend | API calls |
|-------------|----------|-----------|
| Local (`npm run dev`) | Vite dev server | Proxied `/api` → `http://localhost:5288` (see `vite.config.js`) |
| Azure (built site) | Static Web Apps | Direct to `VITE_API_BASE_URL` |

---

## 15. Related files in this repo

- `.github/workflows/backend-appservice.yml` — API deploy  
- `.github/workflows/backend-migrations.yml` — EF migrations against Azure SQL  
- `.github/workflows/frontend-swa.yml` — Static Web App deploy  
- `frontend/staticwebapp.config.json` — SPA fallback for client-side routes  
- `backend/Persis.Api/Program.cs` — DB provider toggle + CORS  
- `README.md` — general setup and cheat sheet  

---

You now have an end-to-end path from empty Azure resources to a live Persis site. If a single step fails, use the failing GitHub Actions log line and the troubleshooting table to narrow it down quickly.
