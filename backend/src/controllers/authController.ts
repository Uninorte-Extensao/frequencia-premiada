import { Request, Response } from 'express'
import { prisma } from '../prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Cadastrar professor
export const cadastrarProfessor = async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body

  try {
    const professorExiste = await prisma.professor.findUnique({
      where: { email },
    })

    if (professorExiste) {
      return res.status(400).json({ erro: 'Email já cadastrado' })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const professor = await prisma.professor.create({
      data: { nome, email, senha: senhaHash },
    })

    return res.status(201).json({
      message: 'Professor cadastrado com sucesso!',
      professor: { id: professor.id, nome: professor.nome, email: professor.email },
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Login do professor (Agora com a validação do CT04 inclusa!)
export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body

  // Validação: Campos vazios retornam status 400 ANTES de bater no banco
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' })
  }

  try {
    const professor = await prisma.professor.findUnique({
      where: { email },
    })

    // Validação: Usuário inexistente
    if (!professor) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' })
    }

    const senhaValida = await bcrypt.compare(senha, professor.senha)

    // Validação: Senha incorreta
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' })
    }

    // Sucesso: Retorna 200 e Token
    const token = jwt.sign(
      { id: professor.id, role: 'professor', email: professor.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    )

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      professor: { id: professor.id, nome: professor.nome, email: professor.email },
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Caso as suas rotas estejam importando exatamente o nome "loginProfessor",
// mantenha este alias aqui para não quebrar o arquivo authRoutes.ts
export const loginProfessor = login;
