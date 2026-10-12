import { Router } from 'express'
import { loginProfessor } from '../controllers/authController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

// O login permanece público.
router.post('/login', loginProfessor)
router.get('/me', autenticar, (req, res) => res.json({ usuario: req.user }))

export default router
