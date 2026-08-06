# ELISENCE Connect Consent — smoke checks (read-only)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$fail = 0

function Fail([string]$msg) {
  Write-Host "FAIL: $msg" -ForegroundColor Red
  $script:fail++
}

function Pass([string]$msg) {
  Write-Host "PASS: $msg" -ForegroundColor Green
}

$pages = @(
  "$Root\sam\index.html",
  "$Root\shiva\index.html",
  "$Root\connect\index.html"
)

foreach ($page in $pages) {
  if (-not (Test-Path $page)) {
    Fail "Missing page: $page"
    continue
  }
  $content = Get-Content $page -Raw
  if ($content -notmatch "Stay Connected|STAY CONNECTED") {
    Fail "Stay Connected action not found in $page"
  } else {
    Pass "Stay Connected present in $(Split-Path $page -Leaf)"
  }
}

$js = Join-Path $Root "assets\connect-consent\connect-consent.js"
if (-not (Test-Path $js)) {
  Fail "Missing connect-consent.js"
} else {
  $jsContent = Get-Content $js -Raw
  if ($jsContent -match 'id="ecc-consent"[^>]*checked') {
    Fail "Consent checkbox appears pre-ticked in JS template"
  } else {
    Pass "Consent checkbox not pre-ticked in JS"
  }
  if ($jsContent -notmatch 'type="checkbox"[^>]*id="ecc-consent"') {
    Fail "Consent checkbox missing in JS template"
  } else {
    Pass "Consent checkbox present in JS"
  }
  $apiHosts = [regex]::Matches($jsContent, 'https?://[^/"''`\s]+') |
    ForEach-Object { $_.Value } |
    Where-Object { $_ -match 'api\.' -or $_ -match '/v8/' }
  $badHosts = $apiHosts | Where-Object { $_ -notmatch 'api\.elisence\.com' }
  if ($badHosts) {
    Fail "Non-allowlisted API hosts in connect-consent.js: $($badHosts -join ', ')"
  } else {
    Pass "connect-consent.js uses api.elisence.com only"
  }
}

$consentAssets = Get-ChildItem -Path (Join-Path $Root "assets\connect-consent") -File -ErrorAction SilentlyContinue
foreach ($file in $consentAssets) {
  $text = Get-Content $file.FullName -Raw
  $hosts = [regex]::Matches($text, 'https?://api\.[^/"''`\s]+') | ForEach-Object { $_.Value }
  $bad = $hosts | Where-Object { $_ -ne "https://api.elisence.com" }
  if ($bad) {
    Fail "Unexpected API host in $($file.Name): $($bad -join ', ')"
  }
}

$resultPages = @(
  "$Root\connect\confirm\index.html",
  "$Root\connect\unsubscribe\index.html",
  "$Root\connect\preferences\index.html"
)
foreach ($rp in $resultPages) {
  if (-not (Test-Path $rp)) {
    Fail "Missing result page: $rp"
    continue
  }
  $text = Get-Content $rp -Raw
  if ($text -notmatch 'api\.elisence\.com') {
    Fail "api.elisence.com not referenced in $rp"
  } elseif ($text -match 'https?://api\.(?!elisence\.com)') {
    Fail "Foreign API host in $rp"
  } else {
    Pass "Result page API host OK: $(Split-Path $rp -Leaf)"
  }
}

Write-Host ""
if ($fail -eq 0) {
  Write-Host "All smoke checks passed." -ForegroundColor Cyan
  exit 0
} else {
  Write-Host "$fail check(s) failed." -ForegroundColor Red
  exit 1
}
