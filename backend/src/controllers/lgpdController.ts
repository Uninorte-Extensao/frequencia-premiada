import { Request, Response } from 'express'
import { prisma } from '../prisma'
import { emitirEvento } from '../realtime'

// Exportar todos os dados de um aluno (Portabilidade — LGPD Art. 18)
export const exportarDadosAluno = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: String(id) },
      include: {
        turma: true,
        presencas: {
          include: {
            turma: true
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
      historicoPrescencas: aluno.presencas.map(p => ({
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

    emitirEvento('lgpd:anonimizacao', {
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
    // Retorna informações sobre os dados coletados e base legal
    return res.json({
      sistema: 'EduPoints — Frequência Premiada',
      responsavel: 'Escola Pública Municipal',
      baseLegal: 'LGPD Art. 7, Inciso III — Execução de políticas públicas',
      dadosColetados: [
        {
          dado: 'Nome do aluno',
          finalidade: 'Identificação no sistema de frequência',
          retencao: 'Período letivo + 5 anos',
          sensivel: false,
        },
        {
          dado: 'Tag NFC',
          finalidade: 'Identificação física do aluno',
          retencao: 'Período letivo',
          sensivel: false,
        },
        {
          dado: 'Registro de presença',
          finalidade: 'Controle de frequência escolar obrigatório',
          retencao: '5 anos conforme legislação educacional',
          sensivel: false,
        },
        {
          dado: 'Pontuação gamificada',
          finalidade: 'Engajamento e redução de evasão',
          retencao: 'Período letivo',
          sensivel: false,
        },
      ],
      direitosDoTitular: [
        'Acesso aos dados (GET /lgpd/alunos/:id/dados)',
        'Anonimização (DELETE /lgpd/alunos/:id)',
        'Portabilidade (GET /lgpd/alunos/:id/dados)',
        'Informação sobre compartilhamento',
      ],
      contatoDPO: 'dpo@escola.edu.br',
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}
