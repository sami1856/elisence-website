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
  @{ Path = "$Root\sam\index.html"; Source = "sam_card" },
  @{ Path = "$Root\shiva\index.html"; Source = "shiva_card" },
  @{ Path = "$Root\connect\index.html"; Source = "connect_pwa" }
)

foreach ($page in $pages) {
  if (-not (Test-Path $page.Path)) {
    Fail "Missing page: $($page.Path)"
    continue
  }
  $content = Get-Content $page.Path -Raw
  if ($content -notmatch "Stay Connected|STAY CONNECTED") {
    Fail "Stay Connected action not found in $($page.Path)"
  } else {
    Pass "Stay Connected present in $(Split-Path $page.Path -Leaf)"
  }
  if ($content -notmatch [regex]::Escape("data-source=`"$($page.Source)`"")) {
    Fail "Expected data-source=$($page.Source) missing in $($page.Path)"
  } else {
    Pass "Source $($page.Source) wired in $(Split-Path $page.Path -Leaf)"
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

  if ($jsContent -match 'work_email') {
    Fail "Frontend still references work_email (must send email)"
  } else {
    Pass "Payload uses email (not work_email)"
  }
  if ($jsContent -notmatch 'email:\s*String\(formEl\.querySelector\("#ecc-email"\)') {
    Fail "collectPayload does not map email from #ecc-email"
  } else {
    Pass "collectPayload maps email field"
  }
  if ($jsContent -notmatch 'consent:\s*!!\(consent && consent\.checked\)') {
    Fail "collectPayload missing boolean consent"
  } else {
    Pass "collectPayload includes consent boolean"
  }
  if ($jsContent -match 'idempotency_key') {
    Fail "idempotency_key still present (backend forbids extras)"
  } else {
    Pass "No forbidden idempotency_key in payload"
  }
  if ($jsContent -notmatch 'bindSheetDismissGesture') {
    Fail "Swipe-down dismiss helper missing"
  } else {
    Pass "Swipe-down dismiss helper present"
  }
  if ($jsContent -notmatch 'data-ecc-drag-region') {
    Fail "Drag region for sheet dismiss missing"
  } else {
    Pass "Drag region present for NOT NOW / swipe dismiss UX"
  }
  if ($jsContent -notmatch 'ecc-cancel') {
    Fail "NOT NOW control missing"
  } else {
    Pass "NOT NOW dismiss control present"
  }

  $interestMaps = @(
    @{ Label = "Investment"; Key = "investment" },
    @{ Label = "Strategic Partnership"; Key = "strategic_partnership" },
    @{ Label = "Healthcare Systems"; Key = "healthcare_systems" },
    @{ Label = "Technology & AI"; Key = "technology_ai" },
    @{ Label = "Research"; Key = "research" },
    @{ Label = "Events"; Key = "events" },
    @{ Label = "General ELISENCE Updates"; Key = "general_updates" }
  )
  foreach ($m in $interestMaps) {
    $pattern = [regex]::Escape("{ label: `"$($m.Label)`", key: `"$($m.Key)`" }")
    if ($jsContent -notmatch $pattern) {
      Fail "Interest mapping missing: $($m.Label) -> $($m.Key)"
    } else {
      Pass "Interest $($m.Label) -> $($m.Key)"
    }
  }

  $meetingMaps = @(
    @{ Label = "Web Summit"; Key = "web_summit" },
    @{ Label = "HealthTech Event"; Key = "healthtech_event" },
    @{ Label = "Founder Event"; Key = "founder_event" },
    @{ Label = "Online"; Key = "online" },
    @{ Label = "Referred by someone"; Key = "referred" },
    @{ Label = "Other"; Key = "other" }
  )
  foreach ($m in $meetingMaps) {
    $pattern = [regex]::Escape("{ label: `"$($m.Label)`", key: `"$($m.Key)`" }")
    if ($jsContent -notmatch $pattern) {
      Fail "Meeting mapping missing: $($m.Label) -> $($m.Key)"
    } else {
      Pass "Meeting $($m.Label) -> $($m.Key)"
    }
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

$css = Join-Path $Root "assets\connect-consent\connect-consent.css"
if (-not (Test-Path $css)) {
  Fail "Missing connect-consent.css"
} else {
  $cssContent = Get-Content $css -Raw
  if ($cssContent -notmatch 'ecc-sheet__handle') {
    Fail "Sheet drag handle styles missing"
  } else {
    Pass "Sheet drag handle styles present"
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
