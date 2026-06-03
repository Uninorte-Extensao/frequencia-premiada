import { Request, Response } from 'express'
import { prisma } from '../prisma' // Ajuste o caminho se necessário

// Cadastrar aluno
export const cadastrarAluno = async (req: Request, res: Response) => {
  // Adicionado 'matricula' e atualizado para 'nfc_uid'
  const { nome, matricula, nfc_uid, turmaId } = req.body

  try {
    // 1. Verifica se a matrícula já existe
    const matriculaExiste = await prisma.aluno.findUnique({
      where: { matricula },
    })

    if (matriculaExiste) {
      return res.status(400).json({ erro: 'Esta matrícula já está cadastrada' })
    }

    // 2. Verifica se a tag NFC já está em uso (caso ela seja enviada no cadastro)
    if (nfc_uid) {
      const tagExiste = await prisma.aluno.findUnique({
        where: { nfc_uid },
      })

      if (tagExiste) {
        return res.status(400).json({ erro: 'Essa tag NFC já está vinculada a outro aluno' })
      }
    }

    // 3. Cria o aluno
    const aluno = await prisma.aluno.create({
      data: { nome, matricula, nfc_uid, turmaId },
    })

    return res.status(201).json({
      message: 'Aluno cadastrado com sucesso!',
      aluno,
    })
  } catch (error) {
    console.error(error) // Útil para debugar no terminal
    return res.status(500).json({ erro: 'Erro interno do servidor ao cadastrar aluno' })
  }
}

// Listar alunos por turma
export const listarAlunosPorTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params

  try {
    const alunos = await prisma.aluno.findMany({
      where: { turmaId: String(turmaId) }, // Removido o Number() pois turmaId é String (UUID)
      orderBy: { nome: 'asc' },
    })

    return res.json(alunos)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor ao listar alunos' })
  }
}

// Buscar aluno por tag NFC ou matrícula (O "Bip" da chamada)
export const buscarAlunoPorTag = async (req: Request, res: Response) => {
  const codigo = req.params.nfc_uid as string

  try {
    const aluno = await prisma.aluno.findFirst({
      where: {
        OR: [
          { nfc_uid: codigo },
          { matricula: codigo },
        ],
      },
      include: { turma: true },
    })

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado com este código' })
    }

    return res.json(aluno)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor ao buscar tag' })
  }
}

// Ranking de pontos por turma (Gamificação)
export const rankingPorTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params

  try {
    const alunos = await prisma.aluno.findMany({
      where: { turmaId: String(turmaId) }, // Removido o Number()
      orderBy: { pontos: 'desc' },
      include: { turma: true },
    })

    return res.json(alunos)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor ao gerar ranking' })
  }
}

// BÔNUS: Rota para vincular a tag depois (Batismo)
export const vincularNfc = async (req: Request, res: Response) => {
  const { matricula, nfc_uid } = req.body;

  try {
    const aluno = await prisma.aluno.update({
      where: { matricula: matricula },
      data: { nfc_uid: nfc_uid },
    });

    return res.status(200).json({ message: 'Tag vinculada com sucesso!', aluno });
  } catch (error) {
    return res.status(400).json({ erro: "Erro ao vincular. Matrícula não encontrada ou tag em uso." });
  }
};
