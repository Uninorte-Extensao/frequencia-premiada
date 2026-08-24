import { Router } from 'express'
import { 
  registrarCheckin, 
  listarPresencasPorTurma, 
  listarAlunosEmRisco,
  listarTodasPresencas,
  encerrarChamada // <--IMPORTAÇÃO Encerrar chamada AQUI
} from '../controllers/checkinController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

// ... (manténs as rotas que já tens)
router.post('/', autenticar, registrarCheckin)
router.get('/', autenticar, listarTodasPresencas)
router.get('/turma/:turmaId', autenticar, listarPresencasPorTurma)
router.get('/risco', autenticar, listarAlunosEmRisco)
router.post('/encerrar', autenticar, encerrarChamada)

export default router