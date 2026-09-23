import { Router } from 'express'
import { exportarDadosAluno, anonimizarAluno, listarConsentimentos, registrarCienciaPrimeiroAcesso } from '../controllers/lgpdController'
import { autenticar, autorizarRole } from '../middlewares/authMiddleware'

const router = Router()

router.get('/info', listarConsentimentos)
router.post('/primeiro-acesso/ciencia', autenticar, autorizarRole(['aluno']), registrarCienciaPrimeiroAcesso)
router.get('/alunos/:id/dados', autenticar, exportarDadosAluno)
router.delete('/alunos/:id', autenticar, autorizarRole(['professor']), anonimizarAluno)

export default router
