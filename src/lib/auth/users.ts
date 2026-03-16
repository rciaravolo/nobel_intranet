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
  role: 'admin' | 'member'
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
]

export function findUserByUsername(username: string): User | undefined {
  return SEED_USERS.find((u) => u.username === username.toLowerCase().trim())
}

export function listUsers(): Omit<User, 'passwordHash'>[] {
  return SEED_USERS.map(({ passwordHash: _, ...rest }) => rest)
}
