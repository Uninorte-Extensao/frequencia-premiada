import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import request from 'supertest'

jest.mock('../src/prisma', () => ({
  prisma: {
    aluno: {
      update: jest.fn(),
    },
  },
}))

import { prisma } from '../src/prisma'
import { app } from '../src/server'

const update = prisma.aluno.update as jest.MockedFunction<typeof prisma.aluno.update>
const token = (role: 'aluno' | 'professor') => jwt.sign({ id: `${role}-1`, role }, process.env.JWT_SECRET as string)

describe('FREQ-014 — primeiro acesso e termos', () => {
  beforeEach(() => update.mockReset())

  it('publica versão, finalidade e contato responsável', async () => {
    const response = await request(app).get('/lgpd/info')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({
      versao: '1.0',
      responsavel: 'Erick Saraiva',
      contato: 'juliane.oliveira.pinto@gmail.com',
      finalidade: expect.any(String),
    }))
  })

  it('exige token de aluno para registrar a ciência', async () => {
    const semToken = await request(app).post('/lgpd/primeiro-acesso/ciencia').send({ ciente: true, versao: '1.0' })
    const professor = await request(app).post('/lgpd/primeiro-acesso/ciencia').set('Authorization', `Bearer ${token('professor')}`).send({ ciente: true, versao: '1.0' })

    expect(semToken.status).toBe(401)
    expect(professor.status).toBe(403)
    expect(update).not.toHaveBeenCalled()
  })

  it('rejeita versão antiga sem desbloquear o primeiro acesso', async () => {
    const response = await request(app)
      .post('/lgpd/primeiro-acesso/ciencia')
      .set('Authorization', `Bearer ${token('aluno')}`)
      .send({ ciente: true, versao: '0.9' })

    expect(response.status).toBe(409)
    expect(update).not.toHaveBeenCalled()
  })

  it('persiste a ciência no servidor e libera a navegação', async () => {
    update.mockResolvedValue({
      id: 'aluno-1', nome: 'Aluno', apelido: null, matricula: '2026001', turmaId: 'turma-1', pontos: 10,
      primeiro_acesso: false, termo_versao: '1.0', termo_ciente_em: new Date(), turma: { id: 'turma-1', nome: 'Turma A' },
    } as never)

    const response = await request(app)
      .post('/lgpd/primeiro-acesso/ciencia')
      .set('Authorization', `Bearer ${token('aluno')}`)
      .send({ ciente: true, versao: '1.0' })

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'aluno-1' },
      data: expect.objectContaining({ primeiro_acesso: false, termo_versao: '1.0' }),
    }))
    expect(response.body.aluno.primeiro_acesso).toBe(false)
  })
})
