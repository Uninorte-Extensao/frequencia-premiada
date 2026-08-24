declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: 'aluno' | 'professor'
        matricula?: string
        email?: string
      }
    }
  }
}

export {}
