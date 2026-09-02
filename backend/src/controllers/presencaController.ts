import { Request, Response } from 'express'
import { prisma } from '../prisma'
import { emitirEvento } from '../realtime'

// Editar presença manualmente
export const editarPresenca = async (req: Request, res: Response) => {
  const { id } = req.params
  const { status, justificativa } = req.body
  const professor = req.user

  try {
    const presencaExiste = await prisma.presenca.findUnique({
      where: { id: String(id) },
    })

    if (!presencaExiste) {
      return res.status(404).json({ erro: 'Presença não encontrada' })
    }

    // Valida o status
    const statusValidos = ['presente', 'falta', 'justificada']
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido. Use: presente, falta ou justificada' })
    }

    const presencaAtualizada = await prisma.presenca.update({
      where: { id: String(id) },
      data: {
        status,
        editadoPor: professor.email,
      },
      include: {
        aluno: {
          select: { id: true, nome: true, apelido: true, matricula: true, pontos: true },
        },
        turma: true,
      },
    })

    // Se mudou para justificada, não desconta pontos
    // Se mudou de presente para falta, desconta 10 pontos
    if (presencaExiste.status === 'presente' && status === 'falta') {
      await prisma.aluno.update({
        where: { id: presencaExiste.alunoId },
        data: { pontos: { decrement: 10 } },
      })
    }

    // Se mudou de falta para presente, adiciona 10 pontos
    if (presencaExiste.status === 'falta' && status === 'presente') {
      await prisma.aluno.update({
        where: { id: presencaExiste.alunoId },
        data: { pontos: { increment: 10 } },
      })
    }

    // Emite evento de auditoria para o Dashboard
    emitirEvento('presenca:editada', {
      presenca: presencaAtualizada,
      editadoPor: professor.email,
      justificativa: justificativa || null,
    })

    return res.json({
      message: 'Presença atualizada com sucesso!',
      presenca: presencaAtualizada,
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Lançar falta justificada para um aluno
export const lancarFaltaJustificada = async (req: Request, res: Response) => {
  const { alunoId, data } = req.body
  const professor = req.user

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: String(alunoId) },
    })

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' })
    }

    const presenca = await prisma.presenca.create({
      data: {
        alunoId: String(alunoId),
        turmaId: aluno.turmaId,
        status: 'justificada',
        editadoPor: professor.email,
        data: data ? new Date(data) : new Date(),
      },
      include: {
        aluno: {
          select: { id: true, nome: true, apelido: true, matricula: true, pontos: true },
        },
        turma: true,
      },
    })

    return res.status(201).json({
      message: 'Falta justificada lançada com sucesso!',
      presenca,
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Listar histórico de edições (auditoria)
export const listarAuditoria = async (req: Request, res: Response) => {
  try {
    const edicoes = await prisma.presenca.findMany({
      where: {
        editadoPor: { not: null },
      },
      include: {
        aluno: {
          select: { id: true, nome: true, apelido: true, matricula: true, pontos: true },
        },
      },
      orderBy: { data: 'desc' },
      take: 50,
    })

    return res.json(edicoes)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Registrar presença via NFC (App Mobile)
export const registrarPresenca = async (req: Request, res: Response) => {
  const { nfc_uid } = req.body

  if (!nfc_uid) {
    return res.status(400).json({ erro: 'Código NFC é obrigatório' })
  }

  try {
    // 1. Busca o aluno pelo código da tag
    const aluno = await prisma.aluno.findUnique({
      where: { nfc_uid },
    })

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado com este cartão' })
    }

    // 2. Registra a presença oficial
    const [presenca] = await prisma.$transaction([
      prisma.presenca.create({
        data: {
          alunoId: aluno.id,
          turmaId: aluno.turmaId,
          status: 'presente',
          data: new Date(),
        },
        include: {
          aluno: {
            select: { id: true, nome: true, apelido: true, matricula: true, pontos: true },
          },
        },
      }),
      prisma.aluno.update({
        where: { id: aluno.id },
        data: { pontos: { increment: 10 } },
      }),
    ])

    // 4. Aciona o WebSocket para atualizar o Dashboard
    emitirEvento('presenca:nova', presenca)

    return res.status(201).json({
      message: 'Presença registrada com sucesso!',
      presenca,
    })
  } catch (error) {
    console.error("Erro no registro via NFC:", error)
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}
// Listar todas as presenças (Caminho Feliz para o App!)
export const listarPresencas = async (req: Request, res: Response) => {
  try {
    const presencas = await prisma.presenca.findMany({
      include: {
        aluno: {
          select: { id: true, nome: true, apelido: true, matricula: true, pontos: true },
        },
      },
      orderBy: {
        data: 'desc', // Mostra as mais recentes primeiro
      },
    })
    return res.json(presencas)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar presenças' })
  }
}
