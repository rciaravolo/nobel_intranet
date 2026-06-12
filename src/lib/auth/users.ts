/**
 * Seed de usuários para desenvolvimento/teste.
 * Em produção: query no Cloudflare D1 via Prisma.
 *
 * Hash gerado com: hashPassword('password123', salt)
 * Admin: rafael.brandao / password123
 */

export interface User {
  id: string
  username: string
  passwordHash: string
  name: string
  email: string
  role: 'admin' | 'master' | 'lider' | 'assessor'
  equipe?: string
  department: string
  avatarInitials: string
}

const SEED_USERS: User[] = [
  {
    id: 'usr_admin_001',
    username: 'rafael.brandao',
    // scrypt hash de "password123" — gerado com salt fixo para seed reproduzível
    passwordHash:
      '704fcea865f0c2eb89f925cadd2fa8a74b0fa5cd1170ea377849e8c53b18a842f643f65db22f7f4c14621834a6909addc4a8a18d97bcb151e209cc7ae015224d.a7f3d2e1c4b5a6f7d8e9c0b1a2f3d4e5',
    name: 'Rafael Brandão',
    email: 'rafael.brandao@nobelcapital.com.br',
    role: 'admin',
    department: 'Gestão',
    avatarInitials: 'RB',
  },
  {
    id: 'usr_a32005_001',
    username: 'fabio.ribeiro',
    // scrypt hash de "nobel2026"
    passwordHash:
      '0c32a40a02106a9d2a8dc16ae9ac32106689595d8ce16be9c2f3b336cdc286c275ae7e9a930c0af714be1b7875940439fb208ac2119034ee65567aed8f17642e.b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
    name: 'Fábio Ribeiro',
    email: 'fabio.ribeiro@nobelcapital.com.br',
    role: 'assessor',
    department: 'Assessoria — Equipe BRAVO',
    avatarInitials: 'FR',
  },
  {
    id: 'usr_master_001',
    username: 'luis.valente',
    // scrypt hash de "nobel2026" com salt único
    passwordHash:
      'cddd96033ba0086734e8be4113e35e64c536305456bb2500ae3199e630be4420f4b32a2f66d57c1f368cd61c9d8c48e356f196b58a07e59dc75958b16d54a083.e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
    name: 'Luis Valente',
    email: 'luis.valente@nobelcapital.com.br',
    role: 'master',
    department: 'Gestão',
    avatarInitials: 'LV',
  },
  {
    id: 'usr_master_002',
    username: 'vitor.baqueiro',
    // scrypt hash de "nobel2026" com salt único
    passwordHash:
      '8aac4c24d4d1ec36251594a27ed90676ffa74bb62031715600e5d664ada45dd509c6f76c4be3a8a15ad4a70b8a6cfbea3ab512785e82f082a3f3cc14f3e41cf1.f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
    name: 'Vitor Baqueiro',
    email: 'vitor.baqueiro@nobelcapital.com.br',
    role: 'master',
    department: 'Gestão',
    avatarInitials: 'VB',
  },
  {
    id: 'usr_a65954_001',
    username: 'adriano.fonseca',
    // scrypt hash de "nobel2026"
    passwordHash:
      '6d22e2f635075d005517d6cdc3819b45f0ab3486dddfa5f1007734ccd808da9b5b3898ada2d65e972c045d03fddc98fa38da0b6779fe061d58e84df09a450550.a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    name: 'Adriano Fonseca',
    email: 'adriano.fonseca@nobelcapital.com.br',
    role: 'assessor',
    equipe: 'PRIVATE',
    department: 'Assessoria — PRIVATE',
    avatarInitials: 'AF',
  },
  {
    id: 'usr_a74811_001',
    username: 'igor.ladeira',
    // scrypt hash de "nobel2026"
    passwordHash:
      '16384db6df3976b002c37cfae71075ede70b67283d2011c37aa7da3b1165835f6e8b70a203cced7ed1a921192794027993210e242a569d5ee5bbd88f5799d277.f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6',
    name: 'Igor Ladeira',
    email: 'igor.ladeira@nobelcapital.com.br',
    role: 'assessor',
    equipe: 'SMART-Alfa',
    department: 'Assessoria — SMART-Alfa',
    avatarInitials: 'IL',
  },
  {
    id: 'usr_a44655_001',
    username: 'filipe.rezende',
    // scrypt hash de "nobel2026"
    passwordHash:
      '32b4a2a5a840a138633a2a1bb37d9a5c39c1f696d8f45dfa2c5dbc147a10c448a86ee87cc3626a9eac4fb43b41657f6b7c9a25d83df22965532c7fc407e7046b.c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    name: 'Filipe Rezende',
    email: 'filipe.rezende@nobelcapital.com.br',
    role: 'assessor',
    equipe: 'SMART',
    department: 'Assessoria — SMART',
    avatarInitials: 'FZ',
  },
  {
    id: 'usr_lider_001',
    username: 'rafael.bonfim',
    // scrypt hash de "nobel2026"
    passwordHash:
      '506d8e15d26d81be3824ac7056c6dac8721f6366cd9cc708b6dfb4bcf39dc7f79af06104d17d88e36f4fdcd0bb013fc5a72f5144280c138a3e1b88d1efe7186f.d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    name: 'Rafael Bonfim',
    email: 'rafael.bonfim@nobelcapital.com.br',
    role: 'lider',
    equipe: 'BRAVO',
    department: 'Assessoria — Equipe BRAVO',
    avatarInitials: 'RBo',
  },
  {
    id: 'usr_lider_002',
    username: 'viviane.fabbri',
    // scrypt hash de "nobel2026"
    passwordHash:
      '8d6ee14d321fabdb226d7fb73e6426cd5622a6ebc7a925996b6ecb27fa82ece88c60bc508f60b330c6b315b383b65b2f647b42abc31c80910993bc4977b45122.d7bb74b66f8f099817340ee6024e6449',
    name: 'Viviane Fabbri',
    email: 'viviane.fabbri@nobelcapital.com.br',
    role: 'lider',
    equipe: 'RIO PRETO',
    department: 'Assessoria — Equipe RIO PRETO',
    avatarInitials: 'VF',
  },
]

export function findUserByUsername(username: string): User | undefined {
  return SEED_USERS.find((u) => u.username === username.toLowerCase().trim())
}

export function listUsers(): Omit<User, 'passwordHash'>[] {
  return SEED_USERS.map(({ passwordHash: _, ...rest }) => rest)
}
