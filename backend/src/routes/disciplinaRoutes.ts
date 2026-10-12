import { Router } from 'express'
import { cadastrarDisciplina, listarDisciplinas } from '../controllers/disciplinaController'
import { autenticar, autorizarRole } from '../middlewares/authMiddleware'

const router = Router()

router.post('/', autenticar, autorizarRole(['professor']), cadastrarDisciplina)
router.get('/', autenticar, autorizarRole(['professor']), listarDisciplinas)

export default router
