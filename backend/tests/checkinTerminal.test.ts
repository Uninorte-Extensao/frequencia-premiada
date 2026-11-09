import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import request from 'supertest'

jest.mock('../src/prisma', () => ({
  prisma: {
    aluno: { findUnique: jest.fn(), update: jest.fn() },
    presenca: { findFirst: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  },
}))

import { prisma } from '../src/prisma'
import { app } from '../src/server'

const buscarTag = jest.mocked(prisma.aluno.findUnique)
const buscarPresenca = jest.mocked(prisma.presenca.findFirst)
const atualizarAluno = jest.mocked(prisma.aluno.update)
const criarPresenca = jest.mocked(prisma.presenca.create)
const transacao = jest.mocked(prisma.$transaction)
const vinculo = { id: 'aluno-1', nome: 'Aluno Teste', turmaId: 'ads', turma: { professorId: 'prof-ads' } }
const antiga = 'A1B2C3D4'
const nova = '04B79696CA2A81'

const token = (id = 'prof-ads', role = 'professor') =>
  jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: '5m' })

const terminal = (nfc_uid: string, turmaId = 'ads', id = 'prof-ads') =>
  request(app).post('/checkin/terminal').set('Authorization', `Bearer ${token(id)}`)
    .send({ nfc_uid, turmaId })

beforeEach(() => {
  jest.resetAllMocks()
  buscarTag.mockResolvedValue(vinculo as never)
  buscarPresenca.mockResolvedValue(null)
  transacao.mockResolvedValue([
    { id: 'p1', alunoId: 'aluno-1', turmaId: 'ads', status: 'presente', data: new Date() },
    { pontos: 10 },
  ] as never)
})

describe('Check-in NFC do terminal', () => {
  it('reconhece o vínculo atual depois de uma substituição no app', async () => {
    let tagSalva = antiga
    atualizarAluno.mockImplementation(({ data }) => {
      if (typeof data.nfc_uid === 'string') tagSalva = data.nfc_uid
      return Promise.resolve({ ...vinculo, nfc_uid: tagSalva } as never) as never
    })
    buscarTag.mockImplementation(({ where }) =>
      Promise.resolve(where.nfc_uid === tagSalva ? vinculo : null) as never)

    const cadastro = await request(app).patch('/alunos/vincular-nfc')
      .set('Authorization', `Bearer ${token()}`)
      .send({ matricula: 'ALUNO001', nfc_uid: nova })
    expect(cadastro.status).toBe(200)

    const cartaoAntigo = await terminal(antiga)
    expect(cartaoAntigo.status).toBe(404)
    expect(cartaoAntigo.body.codigo).toBe('TAG_NAO_VINCULADA')
    expect(transacao).not.toHaveBeenCalled()

    const cartaoNovo = await terminal(nova)
    expect(cartaoNovo.status).toBe(201)
    expect(cartaoNovo.body.pontos).toBe(10)
    expect(criarPresenca).toHaveBeenCalledWith({ data: {
      alunoId: 'aluno-1', turmaId: 'ads', status: 'presente',
    } })
    expect(atualizarAluno).toHaveBeenLastCalledWith({
      where: { id: 'aluno-1' }, data: { pontos: { increment: 10 } },
    })
  })

  it('recusa o professor de outra turma, inclusive pela rota do app', async () => {
    const outraConta = await terminal(nova, 'ads', 'prof-outra')
    const appAntigo = await request(app).post('/checkin')
      .set('Authorization', `Bearer ${token('prof-outra')}`).send({ tag_nfc: nova })
    for (const resposta of [outraConta, appAntigo]) {
      expect(resposta.status).toBe(403)
      expect(resposta.body.codigo).toBe('TURMA_NAO_AUTORIZADA')
    }
    expect(buscarPresenca).not.toHaveBeenCalled()
    expect(transacao).not.toHaveBeenCalled()
  })

  it('não registra em outra turma mesmo com o professor correto', async () => {
    const resposta = await terminal(nova, 'outra-turma')
    expect(resposta.status).toBe(403)
    expect(transacao).not.toHaveBeenCalled()
  })

  it('não registra nem pontua novamente quando a presença já existe', async () => {
    buscarPresenca.mockResolvedValue({ id: 'p1' } as never)
    const resposta = await terminal(nova)
    expect(resposta.status).toBe(400)
    expect(resposta.body.codigo).toBe('PRESENCA_JA_REGISTRADA')
    expect(transacao).not.toHaveBeenCalled()
  })

  it('exige autenticação, perfil de professor e turma do terminal', async () => {
    const semLogin = await request(app).post('/checkin/terminal').send({ nfc_uid: nova, turmaId: 'ads' })
    const aluno = await request(app).post('/checkin/terminal')
      .set('Authorization', `Bearer ${token('aluno-1', 'aluno')}`)
      .send({ nfc_uid: nova, turmaId: 'ads' })
    const semTurma = await request(app).post('/checkin/terminal')
      .set('Authorization', `Bearer ${token()}`).send({ nfc_uid: nova })
    expect([semLogin.status, aluno.status, semTurma.status]).toEqual([401, 403, 400])
    expect(buscarTag).not.toHaveBeenCalled()
  })
})
