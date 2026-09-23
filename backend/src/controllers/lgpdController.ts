import { Request, Response } from 'express'
import { prisma } from '../prisma'
import { io } from '../server'
import { TERMOS_PRIVACIDADE } from '../config/termosPrivacidade'

export const registrarCienciaPrimeiroAcesso = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'aluno') {
    return res.status(403).json({ erro: 'Acesso permitido somente ao aluno' })
  }

  const { ciente, versao } = req.body
  if (ciente !== true) return res.status(400).json({ erro: 'A ciência dos termos é obrigatória' })
  if (versao !== TERMOS_PRIVACIDADE.versao) {
    return res.status(409).json({ erro: 'A versão dos termos foi atualizada. Recarregue e tente novamente.' })
  }

  try {
    const aluno = await prisma.aluno.update({
      where: { id: req.user.id },
      data: {
        primeiro_acesso: false,
        termo_versao: TERMOS_PRIVACIDADE.versao,
        termo_ciente_em: new Date(),
      },
      select: {
        id: true,
        nome: true,
        apelido: true,
        matricula: true,
        turmaId: true,
        pontos: true,
        primeiro_acesso: true,
        termo_versao: true,
        termo_ciente_em: true,
        turma: { select: { id: true, nome: true } },
      },
    })

    return res.json({ message: 'Ciência registrada com sucesso', aluno })
  } catch {
    return res.status(500).json({ erro: 'Não foi possível registrar a ciência dos termos' })
  }
}

// Exportar todos os dados de um aluno (Portabilidade — LGPD Art. 18)
export const exportarDadosAluno = async (req: Request, res: Response) => {
  const { id } = req.params

  if (!req.user) return res.status(401).json({ erro: 'Usuário não autenticado' })
  if (req.user.role === 'aluno' && req.user.id !== id) {
    return res.status(403).json({ erro: 'Acesso não autorizado' })
  }

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: String(id) },
      include: {
        turma: true,
        presencas: {
          include: {
            turma: true,
            professor: {
              select: { nome: true, email: true }
            }
          },
          orderBy: { data: 'desc' }
        }
      }
    })

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' })
    }

    // Log de acesso a dados sensíveis
    console.log(`[LGPD] Exportação de dados solicitada para aluno ID ${id} em ${new Date().toISOString()}`)

    return res.json({
      message: 'Dados exportados conforme LGPD Art. 18 — Portabilidade',
      dataExportacao: new Date().toISOString(),
      titular: {
        id: aluno.id,
        nome: aluno.nome,
        turma: aluno.turma.nome,
        pontos: aluno.pontos,
      },
      historicoPresencas: aluno.presencas.map(p => ({
        data: p.data,
        status: p.status,
        //disciplina: p.disciplina.nome,
        //professor: p.professor.nome,
        editadoPor: p.editadoPor || null,
      }))
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Anonimizar dados de um aluno (Direito ao Esquecimento — LGPD Art. 18)
export const anonimizarAluno = async (req: Request, res: Response) => {
  const { id } = req.params
  const professor = req.user

  try {
    const aluno = await prisma.aluno.findUnique({
  where: { id: String(id) }, // Certifique-se de que aqui também está String(id) e não Number(id)
  include: {
    turma: true,
    presencas: true // <-- É isso que resolve os erros das linhas 39 e 42!
  }
});

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' })
    }

    // Anonimiza os dados pessoais mantendo histórico estatístico
    const alunoAnonimizado = await prisma.aluno.update({
      where: { id: String(id) },
      data: {
        nome: `Aluno Anonimizado #${id}`,
        nfc_uid: `ANONIMIZADO_${id}_${Date.now()}`,
      }
    })

    // Log de auditoria LGPD
    console.log(`[LGPD] Dados do aluno ID ${id} anonimizados por ${professor.email} em ${new Date().toISOString()}`)

    io.emit('lgpd:anonimizacao', {
      alunoId: id,
      solicitadoPor: professor.email,
      data: new Date().toISOString(),
    })

    return res.json({
      message: 'Dados anonimizados com sucesso conforme LGPD Art. 18',
      alunoId: id,
      solicitadoPor: professor.email,
      dataExecucao: new Date().toISOString(),
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Listar log de acessos a dados sensíveis
export const listarConsentimentos = async (req: Request, res: Response) => {
  try {
    return res.json(TERMOS_PRIVACIDADE)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}
