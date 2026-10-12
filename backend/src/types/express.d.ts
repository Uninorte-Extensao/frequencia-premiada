declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: 'aluno' | 'professor' | 'admin'
        matricula?: string
        email?: string
        turmaId?: string
      }
    }
  }
}

export {}
