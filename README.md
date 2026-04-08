# Persis — Indian restaurant ordering (React + .NET 8 + Azure SQL)

Full-stack starter for **Persis Indian Food**: a Vite + React menu/checkout UI and an ASP.NET Core 8 Web API with Entity Framework Core and Azure SQL (or local SQL Server).

**Deploy to Azure (step-by-step):** see [docs/AZURE_DEPLOYMENT.md](docs/AZURE_DEPLOYMENT.md) — Static Web Apps (frontend), App Service (backend), Azure SQL, GitHub Actions, secrets, CORS, and troubleshooting.

## Repository layout

| Path | Purpose |
|------|---------|
| `frontend/` | React (Vite), Azure Static Web Apps–ready |
| `backend/Persis.Api/` | Web API, EF Core, migrations |
| `Persis.sln` | Visual Studio / `dotnet` solution |

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/) (for `npm`)
- SQL Server reachable from your machine: **Azure SQL**, **SQL Server Express**, or **LocalDB** (Windows)
- `dotnet-ef` tool (for migrations):

```powershell
dotnet tool install --global dotnet-ef --version 8.0.11
```

---

## 1. Local run

### Database connection

1. Open `backend/Persis.Api/appsettings.json`.
2. Keep `Database:Provider` as `InMemory` for no-DB local mode.
3. For SQL mode, set `Database:Provider` to `SqlServer` and provide `ConnectionStrings:DefaultConnection`.

Alternatively, use environment variables (good for production):

- `ConnectionStrings__DefaultConnection` = your connection string

For local secrets (recommended, avoids storing passwords in files):

```powershell
cd backend\Persis.Api
dotnet user-secrets set "Database:Provider" "SqlServer"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your-connection-string>"
```

### SQL migrations

From the API project folder:

```powershell
cd backend\Persis.Api
dotnet restore
dotnet ef database update
```

If you need to recreate migrations from scratch (already included in this repo):

```powershell
dotnet ef migrations add InitialCreate -o Data/Migrations
dotnet ef database update
```

On first successful run, the API applies migrations and **seeds** eight sample menu items.

### Run the API

```powershell
cd backend\Persis.Api
dotnet run
```

- HTTP: `http://localhost:5288`
- HTTPS: `https://localhost:7288` (browser may warn about the dev certificate)

Swagger (Development): `/swagger`

### Run the React app

1. Copy `frontend/.env.example` to `frontend/.env` (or use the provided `.env`).
2. Set `VITE_API_BASE_URL` to match the API (default file uses `http://localhost:5288` to avoid HTTPS certificate issues).

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The menu loads from `GET /api/menu`; checkout calls `POST /api/orders`.

### CORS

Allowed origins are listed under `Cors:AllowedOrigins` in `appsettings.json`. Add your Static Web App URL when you deploy the frontend.

---

## 2. Connecting frontend ↔ backend

- **Local:** `VITE_API_BASE_URL` in `frontend/.env` must point to the API base (no trailing slash), e.g. `http://localhost:5288`.
- **Production:** set `VITE_API_BASE_URL` to your Azure App Service URL, e.g. `https://your-api.azurewebsites.net`, then rebuild the frontend (`npm run build`).
- The API enables CORS for origins you list in `Cors:AllowedOrigins` (see `appsettings.Example.json`).

Axios calls are centralized in `frontend/src/services/api.js`.

---

## 3. Using your own food images

1. Add image files under **`frontend/public/images/`** (e.g. `chicken-biryani.jpg`).
2. The seeded `ImageUrl` values look like `/images/chicken-biryani.svg`. To use JPG/PNG, either:
   - Replace the file but **keep the same filename**, or  
   - Update **`backend/Persis.Api/Data/DbSeeder.cs`** `ImageUrl` strings to match your filenames, then update the database (re-seed or run SQL `UPDATE` on `MenuItems`).
3. Rebuild/restart the frontend; paths under `public/` are served as static files.

See also `frontend/public/images/README.txt`.

---

## 4. Azure SQL setup (summary)

1. In [Azure Portal](https://portal.azure.com), create an **Azure SQL Database** (and server).
2. Configure firewall: allow your client IP for development; for App Service, use **Azure services** / managed identity or firewall rules as appropriate.
3. Copy the ADO.NET connection string; set it as:
   - App Service **Connection strings** → name `DefaultConnection`, or  
   - Environment variable `ConnectionStrings__DefaultConnection`
4. Run migrations against that database (from your PC with firewall open, or via a release pipeline):

```powershell
$env:ConnectionStrings__DefaultConnection = "<your-azure-sql-connection-string>"
cd backend\Persis.Api
dotnet ef database update
```

---

## 5. Deploy backend — Azure App Service

1. Create an **App Service** (Linux + .NET 8 recommended).
2. Set **Configuration → Connection strings**: `DefaultConnection` = Azure SQL connection string (type: SQLAzure).
3. Set **Cors** origins in `appsettings` or use App Service CORS + same values in `Cors:AllowedOrigins` for the API app (this project uses in-app CORS policy `"PersisCors"`).
4. Deploy: Visual Studio publish, `az webapp up`, or GitHub Actions. Ensure `dotnet publish` output is deployed and `ASPNETCORE_ENVIRONMENT` is `Production` if you disable Swagger.

---

## 6. Deploy frontend — Azure Static Web Apps

1. Create a **Static Web App**; connect your Git repo or use manual deploy.
2. Build settings (typical):
   - App location: `frontend`
   - Build output: `dist`
   - Api location: leave empty (API is separate on App Service).
3. Add application setting in SWA (or build pipeline): `VITE_API_BASE_URL` = your App Service URL **before** build, or configure a **GitHub Action** env for the build step.
4. Include `staticwebapp.config.json` (SPA fallback to `index.html`).

---

## 7. GitHub Actions (ready to use)

This repo includes two workflows:

- `/.github/workflows/backend-appservice.yml` (deploy API to Azure App Service)
- `/.github/workflows/frontend-swa.yml` (deploy frontend to Azure Static Web Apps)

Set these GitHub **repository secrets** before running:

- `AZURE_WEBAPP_NAME` = App Service name (example: `persis-api-prod`)
- `AZURE_WEBAPP_PUBLISH_PROFILE` = publish profile XML from App Service
- `AZURE_STATIC_WEB_APPS_API_TOKEN` = deployment token from Static Web App
- `VITE_API_BASE_URL` = public backend URL (example: `https://your-api.azurewebsites.net`)
- `AZURE_SQL_CONNECTION_STRING` = Azure SQL connection string (for EF migration workflow)

Recommended App Service configuration (Azure Portal → Configuration):

- `Database__Provider=SqlServer`
- `ConnectionStrings__DefaultConnection=<azure sql connection string>`
- `ASPNETCORE_ENVIRONMENT=Production`

After adding secrets/config, push to `main` (or run workflows manually via `workflow_dispatch`).

Optional migration workflow:

- `/.github/workflows/backend-migrations.yml`
- Runs `dotnet ef database update` against Azure SQL using `AZURE_SQL_CONNECTION_STRING`

---

## API endpoints

| Method | Route | Description |
|--------|--------|-------------|
| GET | `/api/menu` | List available menu items |
| GET | `/api/menu/{id}` | Single item |
| POST | `/api/orders` | Place order (simulated payment; stores **last 4** of card only) |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/{id}` | Order detail |

**Security note:** The API never stores full card numbers or CVV. Totals are **recalculated on the server** from menu prices; the `$5` discount applies when subtotal ≥ `$30`.

---

## Commands cheat sheet

```powershell
# Frontend
cd frontend
npm install
npm run dev
npm run build

# Backend
cd backend\Persis.Api
dotnet restore
dotnet ef migrations add InitialCreate -o Data/Migrations   # already committed
dotnet ef database update
dotnet run
```

---

## Troubleshooting

- **CORS errors:** Add your exact frontend origin (including scheme and port) to `Cors:AllowedOrigins`.
- **Certificate errors with HTTPS API:** Use `http://localhost:5288` in `VITE_API_BASE_URL` for local dev, or trust the ASP.NET dev certificate (`dotnet dev-certs https --trust`).
- **`dotnet ef` design-time warning:** A design-time factory is in `Data/AppDbContextFactory.cs`; migrations should still generate. If `dotnet ef` cannot connect, set `ConnectionStrings__DefaultConnection` for the update command.

---

## License

Starter project for Persis — modify freely for your restaurant.
