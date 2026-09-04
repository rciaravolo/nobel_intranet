$ErrorActionPreference = 'Stop'
$manifestPath = Join-Path $PSScriptRoot '_dispatch\manifest.json'
$logPath      = Join-Path $PSScriptRoot '_dispatch\_guide_log.jsonl'
$assetsDir = Join-Path $PSScriptRoot '..\.open-next\assets'
$attachment = (Get-ChildItem -LiteralPath $assetsDir -Filter 'INTRA*Guia*.pdf' | Select-Object -First 1).FullName
if (-not $attachment -or -not (Test-Path -LiteralPath $attachment)) {
  throw "Anexo nao encontrado em $assetsDir (padrao INTRA*Guia*.pdf)"
}
Write-Host "Anexo: $attachment"

$manifest = Get-Content -Raw -Encoding UTF8 $manifestPath | ConvertFrom-Json
$outlook  = New-Object -ComObject Outlook.Application

function New-Body([string]$firstName) {
@"
<div style="font-family:Segoe UI,Arial,sans-serif;color:#1a1209;font-size:14px;line-height:1.6;max-width:560px">
  <p>Oi, $firstName —</p>
  <p>Complementando o e-mail anterior sobre o seu acesso à <strong>INTRA Nobel</strong>, segue em anexo o
  <strong>Guia de Primeiro Acesso</strong>. Ele cobre login, troca da senha padrão, mapa da plataforma
  e dicas de uso — recomendo dar uma olhada antes de entrar pela primeira vez.</p>
  <p>Qualquer dúvida, é só responder este e-mail.</p>
  <p style="margin-top:20px">Abraço,<br />Rafael Brandão<br /><span style="color:#8B7A5F;font-size:12px">Business Intelligence · Nobel Capital</span></p>
</div>
"@
}

$ok = 0; $fail = 0
foreach ($entry in $manifest) {
  try {
    $firstName = ($entry.name -split ' ')[0]
    $mail = $outlook.CreateItem(0)
    $mail.To = $entry.email
    $mail.Subject = 'INTRA Nobel — Guia de Primeiro Acesso (anexo)'
    $mail.HTMLBody = (New-Body $firstName)
    [void]$mail.Attachments.Add($attachment)
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
