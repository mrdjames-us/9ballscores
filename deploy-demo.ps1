# Deploy 9-ball scorer to DEMO only (never production).
# Usage: .\deploy-demo.ps1

$ErrorActionPreference = "Stop"
$env:CLOUDFLARE_ACCOUNT_ID = "180f457e46d097180035f855959ee95a"
Set-Location $PSScriptRoot

if (-not $env:CLOUDFLARE_API_TOKEN) {
  $toml = Get-Content "$env:APPDATA\xdg.config\.wrangler\config\default.toml" -Raw -ErrorAction SilentlyContinue
  if ($toml -match 'oauth_token = "([^"]+)"') { $env:CLOUDFLARE_API_TOKEN = $matches[1] }
}

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
