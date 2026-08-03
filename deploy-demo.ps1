# Deploy 9-ball scorer to DEMO only (never production).
# Usage: .\deploy-demo.ps1

$ErrorActionPreference = "Stop"
$env:CLOUDFLARE_ACCOUNT_ID = "180f457e46d097180035f855959ee95a"

# Prefer CLOUDFLARE_API_TOKEN already set; else read wrangler oauth cache
if (-not $env:CLOUDFLARE_API_TOKEN) {
  $toml = Get-Content "$env:APPDATA\xdg.config\.wrangler\config\default.toml" -Raw -ErrorAction SilentlyContinue
  if ($toml -match 'oauth_token = "([^"]+)"') { $env:CLOUDFLARE_API_TOKEN = $matches[1] }
}

Set-Location $PSScriptRoot
Write-Host ">>> Deploying 9ballscores → DEMO (9ballscores-demo)" -ForegroundColor Yellow
wrangler pages deploy . --project-name=9ballscores-demo --branch=demo --commit-dirty=true --config wrangler.demo.toml
Write-Host ">>> Demo live: https://9ballscores-demo.pages.dev" -ForegroundColor Green
