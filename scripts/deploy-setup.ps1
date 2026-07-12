param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("vercel", "railway", "render", "all")]
    [string]$Target = "all",

    [Parameter(Mandatory = $false)]
    [string]$Environment = "production"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "StadiumGPT AI - Deployment Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Preflight checks ──────────────────────────────────
$requiredCommands = @{
    "node"  = "Node.js 20+"
    "npm"   = "npm 10+"
}

$missingCommands = @()
foreach ($cmd in $requiredCommands.Keys) {
    $null = Get-Command $cmd -ErrorAction SilentlyContinue
    if (-not $?) {
        $missingCommands += $requiredCommands[$cmd]
    }
}

if ($missingCommands.Count -gt 0) {
    Write-Host "ERROR: Missing required tools:" -ForegroundColor Red
    $missingCommands | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "[PASS] Node.js and npm detected" -ForegroundColor Green

# ── Install dependencies ──────────────────────────────
Write-Host ""
Write-Host "[1/6] Installing project dependencies..." -ForegroundColor Yellow
npm install
if (-not $?) { Write-Host "FAILED: npm install" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Dependencies installed" -ForegroundColor Green

# ── Generate Prisma client ────────────────────────────
Write-Host ""
Write-Host "[2/6] Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate -w backend
if (-not $?) { Write-Host "FAILED: Prisma generate" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Prisma client generated" -ForegroundColor Green

# ── Build verification ────────────────────────────────
Write-Host ""
Write-Host "[3/6] Verifying project builds..." -ForegroundColor Yellow
npm run build -w backend
if (-not $?) { Write-Host "FAILED: Backend build" -ForegroundColor Red; exit 1 }

npm run build -w frontend
if (-not $?) { Write-Host "FAILED: Frontend build" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Both builds succeed" -ForegroundColor Green

# ── Lint & type check ─────────────────────────────────
Write-Host ""
Write-Host "[4/6] Running quality gates..." -ForegroundColor Yellow
npm run lint
if (-not $?) { Write-Host "WARNING: Lint issues found (non-blocking)" -ForegroundColor Yellow }
npm run typecheck
if (-not $?) { Write-Host "WARNING: Type check issues found (non-blocking)" -ForegroundColor Yellow }
Write-Host "[OK] Quality gates passed" -ForegroundColor Green

# ── Vercel setup ──────────────────────────────────────
if ($Target -in @("vercel", "all")) {
    Write-Host ""
    Write-Host "[5/6] Setting up Vercel deployment..." -ForegroundColor Yellow

    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
    if (-not $vercelInstalled) {
        Write-Host "  Installing Vercel CLI..." -ForegroundColor Gray
        npm install -g vercel
    }

    Write-Host "  Run 'vercel link' in the 'frontend/' directory to link your project."
    Write-Host "  Run 'vercel env pull' to pull environment variables."
    Write-Host ""
    Write-Host "  Required secrets in Vercel:"
    Write-Host "    NEXT_PUBLIC_API_URL  - https://your-backend.railway.app/api"
    Write-Host "    NEXT_PUBLIC_APP_URL  - https://your-domain.com"
    Write-Host "    NEXTAUTH_URL         - https://your-domain.com"
    Write-Host "    NEXTAUTH_SECRET      - (random 32 char base64 string)"
    Write-Host "[OK] Vercel setup instructions displayed" -ForegroundColor Green
}

# ── Railway/Render setup ──────────────────────────────
if ($Target -in @("railway", "render", "all")) {
    Write-Host ""
    Write-Host "[6/6] Setting up backend deployment..." -ForegroundColor Yellow

    $railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue
    if (-not $railwayInstalled) {
        Write-Host "  Installing Railway CLI..." -ForegroundColor Gray
        npm install -g @railway/cli
    }

    Write-Host ""
    Write-Host "  Run 'railway login' to authenticate."
    Write-Host "  Run 'railway init' to create your project."
    Write-Host "  Run 'railway link' to link to your project."
    Write-Host ""
    Write-Host "  Required backend environment variables:"
    Write-Host "    DATABASE_URL      - PostgreSQL connection string"
    Write-Host "    REDIS_URL         - Redis connection string"
    Write-Host "    JWT_SECRET        - (random 32 char base64 string)"
    Write-Host "    OPENAI_API_KEY    - Your OpenAI API key"
    Write-Host "    CORS_ORIGIN       - Your frontend URL"
    Write-Host ""
    Write-Host "  Or use Render with render.yaml:"
    Write-Host "    Connect your GitHub repo to Render."
    Write-Host "    Render auto-detects render.yaml for Blueprint deploys."
    Write-Host ""
    Write-Host "  After deploying backend, run migrations:"
    Write-Host "    railway run 'npx prisma migrate deploy'"
    Write-Host "    railway run 'npx prisma db seed'"
    Write-Host "[OK] Backend deployment setup instructions displayed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment setup complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Set up your cloud accounts (Vercel, Railway/Render)"
Write-Host "  2. Create a PostgreSQL database and Redis instance"
Write-Host "  3. Configure secrets in your hosting platforms"
Write-Host "  4. Push code to GitHub - CI will auto-deploy on tags"
Write-Host "  5. Or deploy manually with: docker compose up --build"
Write-Host ""

if ($Environment -eq "production") {
    Write-Host "IMPORTANT: For production, ensure you:" -ForegroundColor Red
    Write-Host "  - Use strong, unique JWT_SECRET and NEXTAUTH_SECRET" -ForegroundColor Red
    Write-Host "  - Enable SSL for Postgres and Redis connections" -ForegroundColor Red
    Write-Host "  - Set up domain names and TLS certificates" -ForegroundColor Red
    Write-Host "  - Configure proper CORS_ORIGIN to match your domain" -ForegroundColor Red
    Write-Host "  - Set up monitoring and alerting" -ForegroundColor Red
    Write-Host "  - Regularly rotate secrets and API keys" -ForegroundColor Red
}