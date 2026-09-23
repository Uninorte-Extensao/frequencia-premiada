import { Router } from 'express'

import {
  buscarAlunoPorTag,
  cadastrarAluno,
  listarAlunosPorTurma,
  loginAluno,
  obterMeuPerfil,
  rankingPorTurma,
  vincularNfc,
} from '../controllers/alunoController'
import { listarMeuHistorico } from '../controllers/historicoAlunoController'
import {
  autenticar,
  autorizarRole,
} from '../middlewares/authMiddleware'

const router = Router()

// Login público: o aluno ainda não possui token JWT.
router.post('/login', loginAluno)
router.get(
  '/me',
  autenticar,
  autorizarRole(['aluno']),
  obterMeuPerfil,
)

// Histórico pessoal: somente o próprio aluno autenticado.
router.get(
  '/me/presencas',
  autenticar,
  autorizarRole(['aluno']),
  listarMeuHistorico,
)

// Cadastro administrativo de aluno: somente professor.
router.post(
  '/',
  autenticar,
  autorizarRole(['professor']),
  cadastrarAluno,
)

// Listagem dos alunos de uma turma: somente professor.
router.get(
  '/turma/:turmaId',
  autenticar,
  autorizarRole(['professor']),
  listarAlunosPorTurma,
)

// Consulta de aluno por tag NFC ou matrícula: somente professor.
router.get(
  '/tag/:nfc_uid',
  autenticar,
  autorizarRole(['professor']),
  buscarAlunoPorTag,
)

// Ranking disponível para usuários autenticados.
router.get(
  '/ranking/:turmaId',
  autenticar,
  rankingPorTurma,
)

// Vínculo de tag física com aluno: somente professor.
router.patch(
  '/vincular-nfc',
  autenticar,
  autorizarRole(['professor']),
  vincularNfc,
)

export default router
