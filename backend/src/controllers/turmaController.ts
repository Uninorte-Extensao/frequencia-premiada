import { Request, Response } from 'express'
import { prisma } from '../prisma'

// Cadastrar turma
export const cadastrarTurma = async (req: Request, res: Response) => {
  const { nome } = req.body

  try {
    const turma = await prisma.turma.create({
      data: { nome },
    })

    return res.status(201).json({
      message: 'Turma cadastrada com sucesso!',
      turma,
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Listar todas as turmas
export const listarTurmas = async (req: Request, res: Response) => {
  try {
    const turmas = await prisma.turma.findMany({
      orderBy: { nome: 'asc' },
    })

    return res.json(turmas)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Ranking de turmas por pontos acumulados dos alunos
export const rankingTurmas = async (req: Request, res: Response) => {
  try {
    const turmas = await prisma.turma.findMany({
      include: {
        alunos: {
          select: {
            pontos: true,
          },
        },
      },
    })

    const ranking = turmas
      .map((turma) => ({
        id: turma.id,
        nome: turma.nome,
        pontos: turma.alunos.reduce((total, aluno) => total + aluno.pontos, 0),
        totalAlunos: turma.alunos.length,
      }))
      .sort((a, b) => b.pontos - a.pontos)

    return res.json(ranking)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor ao gerar ranking de turmas' })
  }
}
