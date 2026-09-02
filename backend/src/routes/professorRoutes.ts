import { Router } from 'express'
import { cadastrarProfessor, loginProfessor } from '../controllers/authController'

const router = Router()

// Rota pública para o login do professor
router.post('/login', loginProfessor)

// Rota para cadastrar novos professores (pode ser protegida depois se necessário)
router.post('/', cadastrarProfessor)

export default router
