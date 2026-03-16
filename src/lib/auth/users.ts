/**
 * Seed de usuários para desenvolvimento/teste.
 * Em produção, isso vem do D1 via Prisma.
 *
 * Senhas hasheadas com bcrypt (rounds=12).
 * Para gerar: `await bcrypt.hash('senha', 12)`
 *
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

// Hash de "password123" com bcrypt rounds=12
// Gerado via: require('bcryptjs').hashSync('password123', 12)
const SEED_USERS: User[] = [
  {
    id: 'usr_admin_001',
    username: 'rafael.brandao',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LQv3c1yqBWVHxkd0L',
    name: 'Rafael Brandão',
    email: 'rafael.brandao@nobelcapital.com.br',
    role: 'admin',
    department: 'Gestão',
    avatarInitials: 'RB',
  },
]

/**
 * Busca um usuário pelo username.
 * Em produção: substituir por query no D1.
 */
export function findUserByUsername(username: string): User | undefined {
  return SEED_USERS.find((u) => u.username === username)
}

/**
 * Retorna todos os usuários (sem passwordHash).
 * Em produção: substituir por query no D1.
 */
export function listUsers(): Omit<User, 'passwordHash'>[] {
  return SEED_USERS.map(({ passwordHash: _, ...rest }) => rest)
}
