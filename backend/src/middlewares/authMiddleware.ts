import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

type Role = 'aluno' | 'professor'

interface JwtUserPayload extends jwt.JwtPayload {
  id: string
  role: Role
  matricula?: string
  email?: string
}

const rolesValidas: Role[] = ['aluno', 'professor']

const isJwtUserPayload = (payload: string | jwt.JwtPayload): payload is JwtUserPayload =>
  typeof payload !== 'string' &&
  typeof payload.id === 'string' &&
  rolesValidas.includes(payload.role as Role)

export const autenticar = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json({ erro: 'Token não fornecido' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)

    if (!isJwtUserPayload(decoded)) {
      res.status(401).json({ erro: 'Token inválido ou expirado' })
      return
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      matricula: decoded.matricula,
      email: decoded.email,
    }

    next()
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
}

export const autorizarRole = (roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ erro: 'Usuário não autenticado' })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ erro: 'Acesso não autorizado' })
      return
    }

    next()
  }
