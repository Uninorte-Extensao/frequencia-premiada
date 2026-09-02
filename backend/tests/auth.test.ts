import request from 'supertest'
import { app } from '../src/app'
import { describe, it, expect } from '@jest/globals' // Isso ensina ao TypeScript as palavras do Jest


describe('POST /auth/login', () => {

  it('CT01 — Login válido retorna 200 e token', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'professor@escola.com', senha: '123456' })

    expect(response.status).toBe(200)
    expect(response.body.token).toBeTruthy()
    expect(response.body.professor.email).toBe('professor@escola.com')
  })

  it('CT02 — Senha incorreta retorna 401', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'professor@escola.com', senha: 'senhaerrada' })

    expect(response.status).toBe(401)
    expect(response.body.erro).toBe('Email ou senha inválidos')
  })

  it('CT03 — Usuário inexistente retorna 401', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'naoexiste@escola.com', senha: '123456' })

    expect(response.status).toBe(401)
  })

  it('CT04 — Campos vazios retorna erro', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: '', senha: '' })

    expect(response.status).toBe(400)
  })

  it('CT05 — SQL Injection não compromete o sistema', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: "' OR 1=1 --", senha: 'qualquer' })

    expect(response.status).toBe(401)
  })

})
