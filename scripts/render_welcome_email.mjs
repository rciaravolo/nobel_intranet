// Renderiza o template welcomeFirstAccessEmail em HTML para envio via Outlook.
// Reaproveita a função canônica do repo (src/lib/email.ts) via strip de tipos.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const emailTsPath = join(__dirname, '..', 'src', 'lib', 'email.ts')
const src = readFileSync(emailTsPath, 'utf8')

// Extrai só as funções puras (welcomeFirstAccessEmail + escapeHtml) e strip de tipos.
const startWelcome = src.indexOf('export function welcomeFirstAccessEmail')
const welcomeBlock = src.slice(startWelcome)

const escapeHtmlMatch = src.match(/function escapeHtml\(input: string\): string \{[\s\S]*?\n\}/)
if (!escapeHtmlMatch) throw new Error('escapeHtml não encontrado')

const stripped = (welcomeBlock + '\n' + escapeHtmlMatch[0])
  .replace(/export function welcomeFirstAccessEmail\(params: \{[\s\S]*?\}\): \{ subject: string; html: string \} \{/,
           'function welcomeFirstAccessEmail(params) {')
  .replace(/function escapeHtml\(input: string\): string \{/, 'function escapeHtml(input) {')

const mod = new Function(stripped + '\nreturn { welcomeFirstAccessEmail };')()

const { subject, html } = mod.welcomeFirstAccessEmail({
  userName: 'Rafael Brandão',
  username: 'rafael.brandao',
  loginUrl: 'https://intra.nobelcapital.workers.dev',
  guideUrl: 'https://intra.nobelcapital.workers.dev/guia',
  defaultPassword: 'nobel2026',
})

writeFileSync(join(__dirname, '_welcome_preview.subject.txt'), subject, 'utf8')
writeFileSync(join(__dirname, '_welcome_preview.html'), html, 'utf8')
console.log('OK — subject e HTML gerados')
console.log('Subject:', subject)
