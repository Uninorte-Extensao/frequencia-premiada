import { Request, Response } from 'express'
import { prisma } from '../prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// 1. Cadastrar aluno (Atualizado para receber Senha e Apelido)
export const cadastrarAluno = async (req: Request, res: Response) => {
  // Agora recebemos senha e apelido
  const { nome, apelido, matricula, senha, nfc_uid, turmaId } = req.body

  if (!senha) {
    return res.status(400).json({ erro: 'A senha é obrigatória para o acesso ao App' })
  }

  try {
    // 1. Verifica se a matrícula já existe
    const matriculaExiste = await prisma.aluno.findUnique({
      where: { matricula },
    })

    if (matriculaExiste) {
      return res.status(400).json({ erro: 'Esta matrícula já está cadastrada' })
    }

    // 2. Verifica se a tag NFC já está em uso
    if (nfc_uid) {
      const tagExiste = await prisma.aluno.findUnique({
        where: { nfc_uid },
      })

      if (tagExiste) {
        return res.status(400).json({ erro: 'Essa tag NFC já está vinculada a outro aluno' })
      }
    }

    // 3. Criptografando a senha (Regra de Negócio: Segurança/LGPD)
    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash(senha, salt)

    // 4. Cria o aluno
    const aluno = await prisma.aluno.create({
      data: { 
        nome, 
        apelido, 
        matricula, 
        senha: senhaHash, // Salvando a senha embaralhada no banco
        nfc_uid, 
        turmaId 
      },
    })

    // Retorna os dados sem expor a senha criptografada
    const { senha: _, ...alunoSemSenha } = aluno

    return res.status(201).json({
      message: 'Aluno cadastrado com sucesso!',
      aluno: alunoSemSenha,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: 'Erro interno do servidor ao cadastrar aluno' })
  }
}

// 2. NOVO: Login do Aluno no App (Autenticação JWT)
export const loginAluno = async (req: Request, res: Response) => {
  const { matricula, senha } = req.body

  try {
    // Busca o aluno no banco
    const aluno = await prisma.aluno.findUnique({ where: { matricula } })

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' })
    }

    // Verifica se a senha bate com o hash salvo no banco
    const senhaValida = await bcrypt.compare(senha, aluno.senha)
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' })
    }

    // Gera o Token JWT para o App (Dura 7 dias)
    const token = jwt.sign(
      { id: aluno.id, matricula: aluno.matricula, turmaId: aluno.turmaId },
      process.env.JWT_SECRET || 'segredo_padrao_edupoints',
      { expiresIn: '7d' }
    )

    const { senha: _, ...dadosAluno } = aluno

    return res.json({
      token,
      aluno: dadosAluno
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: 'Erro interno ao fazer login' })
  }
}

// 3. Listar alunos por turma
export const listarAlunosPorTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params

  try {
    const alunos = await prisma.aluno.findMany({
      where: { turmaId: String(turmaId) },
      orderBy: { nome: 'asc' },
      select: { // Exclui a senha da listagem para segurança
        id: true, nome: true, apelido: true, matricula: true, nfc_uid: true, pontos: true
      }
    })

    return res.json(alunos)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor ao listar alunos' })
  }
}

// 4. Buscar aluno por tag NFC ou matrícula (O "Bip" da chamada)
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

    // Retira a senha do retorno
    const { senha: _, ...alunoSemSenha } = aluno
    return res.json(alunoSemSenha)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor ao buscar tag' })
  }
}

// 5. Ranking de pontos por turma (Gamificação)
export const rankingPorTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params

  try {
    const alunos = await prisma.aluno.findMany({
      where: { turmaId: String(turmaId) },
      orderBy: { pontos: 'desc' },
      select: {
        id: true,
        nome: true,
        apelido: true, // App do aluno usará o apelido no lugar do nome completo (LGPD)
        pontos: true,
      }
    })

    return res.json(alunos)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor ao gerar ranking' })
  }
}

// 6. BÔNUS: Rota para vincular a tag depois (Batismo)
export const vincularNfc = async (req: Request, res: Response) => {
  const { matricula, nfc_uid } = req.body;

  try {
    const aluno = await prisma.aluno.update({
      where: { matricula: matricula },
      data: { nfc_uid: nfc_uid },
    });

    const { senha: _, ...alunoSemSenha } = aluno
    return res.status(200).json({ message: 'Tag vinculada com sucesso!', aluno: alunoSemSenha });
  } catch (error) {
    return res.status(400).json({ erro: "Erro ao vincular. Matrícula não encontrada ou tag em uso." });
  }
};