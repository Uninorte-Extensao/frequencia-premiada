import { Router } from 'express'
import { 
  editarPresenca, 
  lancarFaltaJustificada, 
  listarAuditoria, 
  registrarPresenca,
  listarPresencas 
} from '../controllers/presencaController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

// Rota que o App Mobile chama (GET /presencas)
router.get('/', autenticar, listarPresencas) 

router.post('/', autenticar, registrarPresenca)
router.put('/:id', autenticar, editarPresenca)
router.post('/justificada', autenticar, lancarFaltaJustificada)
router.get('/auditoria', autenticar, listarAuditoria)

export default router