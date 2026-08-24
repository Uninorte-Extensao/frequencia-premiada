import { Router } from 'express'
import { 
  cadastrarAluno, 
  loginAluno,          
  listarAlunosPorTurma, 
  buscarAlunoPorTag, 
  rankingPorTurma,
  vincularNfc 
} from '../controllers/alunoController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

// 1. ROTA PÚBLICA: Login do Aluno no App Mobile
// Não usa o middleware 'autenticar' porque o aluno ainda não tem o Token JWT
router.post('/login', loginAluno)

// 2. ROTAS PROTEGIDAS (Exigem Token de autenticação)

// Cadastro inicial do aluno (via painel web do professor/admin)
router.post('/', autenticar, cadastrarAluno)

// Listagem da turma (para o app/painel do professor)
router.get('/turma/:turmaId', autenticar, listarAlunosPorTurma)

// O "Bip" da tag NFC
router.get('/tag/:nfc_uid', autenticar, buscarAlunoPorTag)

// Gamificação - Ranking público da turma
router.get('/ranking/:turmaId', autenticar, rankingPorTurma)

// "Batismo" da Tag - Associa a tag física a um aluno já matriculado
router.patch('/vincular-nfc', autenticar, vincularNfc)

export default router