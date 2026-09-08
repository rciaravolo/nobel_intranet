$ErrorActionPreference = 'Stop'
$manifestPath = Join-Path $PSScriptRoot '_dispatch\manifest.json'
$logPath      = Join-Path $PSScriptRoot '_dispatch\_dispatch_log.jsonl'

$manifest = Get-Content -Raw -Encoding UTF8 $manifestPath | ConvertFrom-Json
$outlook  = New-Object -ComObject Outlook.Application

$ok = 0; $fail = 0
foreach ($entry in $manifest) {
  try {
    $html    = Get-Content -Raw -Encoding UTF8 $entry.html_file
    $subject = (Get-Content -Raw -Encoding UTF8 $entry.subject_file).Trim()
    $mail = $outlook.CreateItem(0)
    $mail.To = $entry.email
    $mail.Subject = $subject
    $mail.HTMLBody = $html
    $mail.Send()
    $ok++
    $log = @{ ts=(Get-Date -Format o); status='sent'; email=$entry.email; username=$entry.username } | ConvertTo-Json -Compress
    Add-Content -Path $logPath -Value $log -Encoding UTF8
    Write-Host ("[OK]   {0,-22} {1}" -f $entry.username, $entry.email)
  } catch {
    $fail++
    $log = @{ ts=(Get-Date -Format o); status='error'; email=$entry.email; username=$entry.username; error=$_.Exception.Message } | ConvertTo-Json -Compress
    Add-Content -Path $logPath -Value $log -Encoding UTF8
    Write-Host ("[FAIL] {0,-22} {1} :: {2}" -f $entry.username, $entry.email, $_.Exception.Message) -ForegroundColor Red
  }
  Start-Sleep -Milliseconds 400
}

Write-Host ""
Write-Host ("Enviados: {0}  |  Erros: {1}  |  Log: {2}" -f $ok, $fail, $logPath)
