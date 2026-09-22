import { Router } from 'express'
import { exportarDadosAluno, anonimizarAluno, listarConsentimentos } from '../controllers/lgpdController'
import { autenticar, autorizarRole } from '../middlewares/authMiddleware'

const router = Router()

router.get('/info', listarConsentimentos)
router.get('/alunos/:id/dados', autenticar, exportarDadosAluno)
router.delete('/alunos/:id', autenticar, autorizarRole(['professor']), anonimizarAluno)

export default router
