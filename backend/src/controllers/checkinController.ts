import { Request, Response } from 'express'
import { prisma } from '../prisma'
import { emitirEvento } from '../realtime'

// 1. REGISTRAR CHECK-IN
export const registrarCheckin = async (req: Request, res: Response): Promise<any> => {
  const nfc_uid = req.body.nfc_uid || req.body.tag_nfc;

  if (!nfc_uid) {
    return res.status(400).json({ erro: 'Tag NFC ou Código não fornecido' })
  }

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { nfc_uid: String(nfc_uid) },
      include: { turma: true },
    })

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' })
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const checkinExiste = await prisma.presenca.findFirst({
      where: {
        alunoId: aluno.id,
        data: { gte: hoje },
        status: 'presente',
      },
    })

    if (checkinExiste) {
      return res.status(400).json({ erro: 'Aluno já registrou presença hoje' })
    }

    const [presenca, alunoAtualizado] = await prisma.$transaction([
      prisma.presenca.create({
        data: {
          alunoId: aluno.id,
          turmaId: aluno.turmaId,
          status: 'presente',
        },
      }),
      prisma.aluno.update({
        where: { id: aluno.id },
        data: { pontos: { increment: 10 } },
      }),
    ])

    emitirEvento('presenca:nova', {
  aluno: {
    id: aluno.id,
    nome: aluno.nome,
    pontos: alunoAtualizado.pontos,
    turma: { nome: aluno.turma.nome },
  },
  emRisco: false,
  data: new Date().toISOString(),
})

    return res.status(201).json({
  message: 'Presença registrada!',
  pontos: alunoAtualizado.pontos,
  aluno: {
    id: aluno.id,
    nome: aluno.nome,
    pontos: alunoAtualizado.pontos,
  }
})
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro no servidor' })
  }
}

// 2. LISTAR TODAS AS PRESENÇAS
export const listarTodasPresencas = async (req: Request, res: Response): Promise<any> => {
  try {
    const presencas = await prisma.presenca.findMany({
      include: {
        aluno: {
          select: { id: true, nome: true, apelido: true, matricula: true, pontos: true },
        },
        turma: true 
      },
      orderBy: { data: 'desc' }, 
    })

    return res.json(presencas)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar histórico' })
  }
}

// 3. LISTAR POR TURMA
export const listarPresencasPorTurma = async (req: Request, res: Response): Promise<any> => {
  const { turmaId } = req.params
  try {
    const presencas = await prisma.presenca.findMany({
      where: { turmaId: String(turmaId) },
      include: {
        aluno: {
          select: { id: true, nome: true, apelido: true, matricula: true, pontos: true },
        },
        turma: true,
      },
      orderBy: { data: 'desc' },
    })
    return res.json(presencas)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar presenças da turma' })
  }
}

// 4. LISTAR ALUNOS EM RISCO
export const listarAlunosEmRisco = async (req: Request, res: Response): Promise<any> => {
  try {
    const alunos = await prisma.aluno.findMany({
      select: {
        id: true,
        nome: true,
        apelido: true,
        matricula: true,
        pontos: true,
        presencas: { orderBy: { data: 'desc' }, take: 3 },
        turma: true,
      },
    })
    const alunosEmRisco = alunos.filter(aluno => {
      const ultimas = aluno.presencas
      return ultimas.length === 3 && ultimas.every(p => p.status === 'falta')
    })
    return res.json(alunosEmRisco)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar alunos em risco' })
  }
}

// 5. ENCERRAR CHAMADA (Adicionado aqui!)
export const encerrarChamada = async (req: Request, res: Response): Promise<any> => {
  const { turmaId } = req.body;

  if (!turmaId) {
    return res.status(400).json({ erro: 'O ID da turma é obrigatório.' });
  }

  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // 1. Vai buscar todos os alunos matriculados nesta turma
    const alunosDaTurma = await prisma.aluno.findMany({
      where: { turmaId: String(turmaId) }
    });

    // 2. Vai buscar os registros de presença (ou falta) de hoje desta turma
    const presencasDeHoje = await prisma.presenca.findMany({
      where: {
        turmaId: String(turmaId),
        data: { gte: hoje }
      }
    });

    // 3. Isola apenas os IDs dos alunos que já têm registro hoje
    const idsComRegistro = presencasDeHoje.map(p => p.alunoId);

    // 4. Descobre quem são os faltosos
    const alunosFaltosos = alunosDaTurma.filter(a => !idsComRegistro.includes(a.id));

    // Se todos vieram à aula
    if (alunosFaltosos.length === 0) {
      return res.json({ message: 'Chamada encerrada. Todos os alunos estão presentes!' });
    }

    // 5. Prepara a lista de faltas para o banco de dados
    const faltasParaCriar = alunosFaltosos.map(aluno => ({
      alunoId: aluno.id,
      turmaId: String(turmaId),
      status: 'falta'
    }));

    // 6. Grava todas as faltas de uma só vez
    await prisma.presenca.createMany({
      data: faltasParaCriar
    });

    emitirEvento('chamada:encerrada', {
      turmaId,
      faltasRegistradas: alunosFaltosos.length,
      mensagem: `Foram registradas ${alunosFaltosos.length} faltas.`
    });

    return res.status(201).json({
      message: `Chamada encerrada com sucesso. Foram registradas ${alunosFaltosos.length} faltas.`
    });

  } catch (error) {
    console.error("Erro ao encerrar chamada:", error);
    return res.status(500).json({ erro: 'Erro interno ao processar as faltas.' });
  }
}
