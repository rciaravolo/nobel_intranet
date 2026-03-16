#!/bin/bash
# setup-vps.sh — Configura a VPS Hostinger para rodar o Claude Code
# Execute como usuário não-root: bash scripts/setup-vps.sh

set -e

echo "🟡 [pm-intranet] Iniciando setup da VPS..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# 1. Verificar que não é root
if [ "$EUID" -eq 0 ]; then
  error "Não execute como root. Crie um usuário dedicado primeiro."
fi

# 2. Atualizar sistema
log "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 3. Instalar dependências
log "Instalando dependências base..."
sudo apt install -y tmux git curl wget unzip build-essential

# 4. Instalar NVM + Node.js
log "Instalando Node.js via NVM..."
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi
source ~/.bashrc || true
nvm install 22
nvm use 22
nvm alias default 22
log "Node $(node -v) instalado"

# 5. Instalar Claude Code
log "Instalando Claude Code..."
npm install -g @anthropic/claude-code
log "Claude Code $(claude --version) instalado"

# 6. Instalar GitHub CLI
log "Instalando GitHub CLI..."
if ! command -v gh &> /dev/null; then
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  sudo apt update && sudo apt install gh -y
fi
log "GitHub CLI $(gh --version | head -1) instalado"

# 7. Configurar tmux
log "Configurando tmux..."
cat > ~/.tmux.conf << 'TMUXEOF'
set -g default-terminal "screen-256color"
set -g history-limit 10000
set -g mouse on
set -g base-index 1
set -g pane-base-index 1
set -g status-bg colour235
set -g status-fg white
set -g status-left '#[fg=yellow,bold] [#S] '
set -g status-right '#[fg=cyan] %H:%M '
bind r source-file ~/.tmux.conf \; display "tmux.conf recarregado!"
TMUXEOF

# 8. Script de start do Claude
log "Criando script de inicialização..."
cat > ~/start-claude.sh << 'STARTEOF'
#!/bin/bash
SESSION="intra-dev"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

tmux has-session -t $SESSION 2>/dev/null

if [ $? != 0 ]; then
  tmux new-session -d -s $SESSION -n "claude"
  tmux send-keys -t $SESSION "cd ~/projects/intra && claude" C-m
  echo "✅ Sessão '$SESSION' criada"
else
  echo "✅ Sessão '$SESSION' já existe"
fi

tmux attach-session -t $SESSION
STARTEOF
chmod +x ~/start-claude.sh

# 9. Auto-start no boot
log "Configurando auto-start..."
(crontab -l 2>/dev/null; echo "@reboot sleep 10 && /bin/bash -c 'tmux new-session -d -s intra-dev 2>/dev/null || true'") | crontab -

# 10. Gerar SSH key para GitHub
if [ ! -f ~/.ssh/id_ed25519 ]; then
  log "Gerando SSH key..."
  ssh-keygen -t ed25519 -C "intra-vps@nobelcapital" -f ~/.ssh/id_ed25519 -N ""
  echo ""
  warn "Adicione esta chave SSH no GitHub (Settings → SSH Keys):"
  echo ""
  cat ~/.ssh/id_ed25519.pub
  echo ""
fi

# 11. Configurar Git
log "Configurando Git..."
git config --global user.name "Nobel Capital - Intra"
git config --global user.email "rafael.brandao@nobelcapital.com.br"
git config --global init.defaultBranch main
git config --global pull.rebase false

# 12. Criar pasta de projetos
mkdir -p ~/projects

echo ""
echo "============================================"
echo " Setup concluído! Próximos passos:"
echo "============================================"
echo ""
echo "1. Adicione a chave SSH acima no GitHub"
echo "   github.com → Settings → SSH and GPG keys"
echo ""
echo "2. Configure o ANTHROPIC_API_KEY:"
echo "   echo 'export ANTHROPIC_API_KEY=\"sk-ant-...\"' >> ~/.bashrc"
echo "   source ~/.bashrc"
echo ""
echo "3. Autentique no GitHub CLI:"
echo "   gh auth login"
echo ""
echo "4. Clone o repositório:"
echo "   cd ~/projects && git clone git@github.com:SEU_ORG/intra.git"
echo ""
echo "5. Inicie o Claude:"
echo "   ~/start-claude.sh"
echo ""
