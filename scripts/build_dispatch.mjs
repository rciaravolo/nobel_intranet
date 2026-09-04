// Renderiza HTML/subject por usuário e escreve em scripts/_dispatch/<username>.{html,subject.txt}
// junto com scripts/_dispatch/manifest.json (email, subject_file, html_file).

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const emailTsPath = join(__dirname, '..', 'src', 'lib', 'email.ts')
const src = readFileSync(emailTsPath, 'utf8')

const startWelcome = src.indexOf('export function welcomeFirstAccessEmail')
const welcomeBlock = src.slice(startWelcome)
const escapeHtmlMatch = src.match(/function escapeHtml\(input: string\): string \{[\s\S]*?\n\}/)
if (!escapeHtmlMatch) throw new Error('escapeHtml não encontrado')

const stripped = (welcomeBlock + '\n' + escapeHtmlMatch[0])
  .replace(/export function welcomeFirstAccessEmail\(params: \{[\s\S]*?\}\): \{ subject: string; html: string \} \{/,
           'function welcomeFirstAccessEmail(params) {')
  .replace(/function escapeHtml\(input: string\): string \{/, 'function escapeHtml(input) {')

const mod = new Function(stripped + '\nreturn { welcomeFirstAccessEmail };')()

const users = [
  { username: 'argos.sasso',       name: 'Argos Urbano',      email: 'argos.sasso@nobelcapital.com.br' },
  { username: 'cristiane.mellote', name: 'Cristiane Mellote', email: 'cristiane.mellote@nobelcapital.com.br' },
  { username: 'diana.frajtag',     name: 'Diana Frajtag',     email: 'diana.frajtag@nobelcapital.com.br' },
  { username: 'evandro.delduque',  name: 'Evandro Delduque',  email: 'evandro.delduque@nobelcapital.com.br' },
  { username: 'fabio.castelucci',  name: 'Fabio Castelucci',  email: 'fabio.castelucci@nobelcapital.com.br' },
  { username: 'fabio.ribeiro',     name: 'Fábio Ribeiro',     email: 'fabio.ribeiro@nobelcapital.com.br' },
  { username: 'giordano.molinari', name: 'Giordano Molinari', email: 'giordano.molinari@nobelcapital.com.br' },
  { username: 'leandro.barbancho', name: 'Leandro Barbancho', email: 'leandro.barbancho@nobelcapital.com.br' },
  { username: 'nina.lima',         name: 'Nina Lima',         email: 'nina.lima@nobelcapital.com.br' },
  { username: 'simone.augusto',    name: 'Simone Augusto',    email: 'simone.augusto@nobelcapital.com.br' },
  { username: 'adriano.fonseca',   name: 'Adriano Fonseca',   email: 'adriano.fonseca@nobelcapital.com.br' },
  { username: 'alexandre.franca',  name: 'Alexandre França',  email: 'alexandre.franca@nobelcapital.com.br' },
  { username: 'alvaro.quatrini',   name: 'Alvaro Villa',      email: 'alvaro.quatrini@nobelcapital.com.br' },
  { username: 'ep',                name: 'Eduardo Puschiavo', email: 'ep@nobelcapital.com.br' },
  { username: 'fabio.galdino',     name: 'Fabio Galdino',     email: 'fabio.galdino@nobelcapital.com.br' },
  { username: 'marcelo.almeida',   name: 'Marcelo Almeida',   email: 'marcelo.almeida@nobelcapital.com.br' },
  { username: 'marcelo.gaspar',    name: 'Marcelo Gaspar',    email: 'marcelo.gaspar@nobelcapital.com.br' },
  { username: 'roberta.figueira',  name: 'Roberta Figueira',  email: 'roberta.figueira@nobelcapital.com.br' },
  { username: 'fabricio.mastro',   name: 'Fabrício Mastro',   email: 'fabricio.mastro@nobelcapital.com.br' },
  { username: 'filipe.rezende',    name: 'Filipe Rezende',    email: 'filipe.rezende@nobelcapital.com.br' },
  { username: 'igor.ladeira',      name: 'Igor Ladeira',      email: 'igor.ladeira@nobelcapital.com.br' },
  { username: 'luan.prado',        name: 'Luan Prado',        email: 'luan.prado@nobelcapital.com.br' },
  { username: 'lucas.pradella',    name: 'Lucas Pradella',    email: 'lucas.pradella@nobelcapital.com.br' },
  { username: 'marco.silveira',    name: 'Marco Silveira',    email: 'marco.silveira@nobelcapital.com.br' },
  { username: 'rafael.paschoal',   name: 'Rafael Paschoal',   email: 'rafael.paschoal@nobelcapital.com.br' },
]

const outDir = join(__dirname, '_dispatch')
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const manifest = []
for (const u of users) {
  const { subject, html } = mod.welcomeFirstAccessEmail({
    userName: u.name,
    username: u.username,
    loginUrl: 'https://intra.nobelcapital.workers.dev',
    guideUrl: 'https://intra.nobelcapital.workers.dev/guia',
    defaultPassword: 'nobel2026',
  })
  const htmlFile = join(outDir, `${u.username}.html`)
  const subjFile = join(outDir, `${u.username}.subject.txt`)
  writeFileSync(htmlFile, html, 'utf8')
  writeFileSync(subjFile, subject, 'utf8')
  manifest.push({ email: u.email, name: u.name, username: u.username, html_file: htmlFile, subject_file: subjFile })
}

writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
console.log(`OK — ${manifest.length} arquivos gerados em`, outDir)
