import { Router } from 'express'
import { 
  registrarCheckin,
  registrarCheckinTerminal,
  listarPresencasPorTurma, 
  listarAlunosEmRisco,
  listarTodasPresencas,
  encerrarChamada // <--IMPORTAÇÃO Encerrar chamada AQUI
} from '../controllers/checkinController'
import { autenticar, autorizarRole } from '../middlewares/authMiddleware'

const router = Router()

// ... (manténs as rotas que já tens)
router.post('/', autenticar, autorizarRole(['professor']), registrarCheckin)
router.post('/terminal', autenticar, autorizarRole(['professor']), registrarCheckinTerminal)
router.get('/', autenticar, autorizarRole(['professor']), listarTodasPresencas)
router.get('/turma/:turmaId', autenticar, autorizarRole(['professor']), listarPresencasPorTurma)
router.get('/risco', autenticar, autorizarRole(['professor']), listarAlunosEmRisco)
router.post('/encerrar', autenticar, autorizarRole(['professor']), encerrarChamada)

export default router
