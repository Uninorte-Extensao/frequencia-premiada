import { Router } from 'express'
import { cadastrarTurma, listarTurmas, rankingTurmas } from '../controllers/turmaController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

router.post('/', autenticar, cadastrarTurma)
router.get('/ranking', autenticar, rankingTurmas)
router.get('/', autenticar, listarTurmas)

export default router
