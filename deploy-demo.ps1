# Deploy 9-ball scorer to DEMO only (never production).
# Usage: .\deploy-demo.ps1

$ErrorActionPreference = "Stop"
$env:CLOUDFLARE_ACCOUNT_ID = "180f457e46d097180035f855959ee95a"
Set-Location $PSScriptRoot

# Do not stuff wrangler's oauth_token into CLOUDFLARE_API_TOKEN.
# That token is not an API token and Pages deploy then fails with 10000/9109.
# Prefer an actual API token if set; otherwise wrangler uses its OAuth session.

# Pages ignores --config; temporarily use demo wrangler.toml for D1 binding
Copy-Item wrangler.toml wrangler.toml.prod-bak -Force
Copy-Item wrangler.demo.toml wrangler.toml -Force
try {
  Write-Host ">>> Deploying 9ballscores → DEMO (9ballscores-demo)" -ForegroundColor Yellow
  wrangler pages deploy . --project-name=9ballscores-demo --branch=demo --commit-dirty=true
  Write-Host ">>> Demo live: https://9ballscores-demo.pages.dev" -ForegroundColor Green
} finally {
  Copy-Item wrangler.toml.prod-bak wrangler.toml -Force
  Remove-Item wrangler.toml.prod-bak -Force -ErrorAction SilentlyContinue
}
