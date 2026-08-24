import { Request, Response } from 'express'
import { prisma } from '../prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// 1. Cadastro de Professor (Caso precise cadastrar novos professores)
export const cadastrarProfessor = async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body

  if (!email || !senha || !nome) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' })
  }

  try {
    const professorExiste = await prisma.professor.findUnique({
      where: { email },
    })

    if (professorExiste) {
      return res.status(400).json({ erro: 'Este e-mail já está cadastrado' })
    }

    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash(senha, salt)

    const professor = await prisma.professor.create({
      data: {
        nome,
        email,
        senha: senhaHash,
      },
    })

    const { senha: _, ...professorSemSenha } = professor

    return res.status(201).json({
      message: 'Professor cadastrado com sucesso!',
      professor: professorSemSenha,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: 'Erro interno ao cadastrar professor' })
  }
}

// 2. Login do Professor no App / Dashboard
export const loginProfessor = async (req: Request, res: Response) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe o e-mail e a senha' })
  }

  try {
    // Busca o professor pelo e-mail (campo @unique no schema.prisma)
    const professor = await prisma.professor.findUnique({
      where: { email },
    })

    if (!professor) {
      return res.status(404).json({ erro: 'Professor não encontrado' })
    }

    // Compara a senha digitada com o hash salvo no banco
    const senhaValida = await bcrypt.compare(senha, professor.senha)
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' })
    }

    // Gera o Token JWT válido por 7 dias
    const token = jwt.sign(
      { id: professor.id, role: 'professor', email: professor.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    const { senha: _, ...dadosProfessor } = professor

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      professor: dadosProfessor,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: 'Erro interno ao fazer login' })
  }
}
