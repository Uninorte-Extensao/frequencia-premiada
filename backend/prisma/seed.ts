import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const senhaHash = await bcrypt.hash('123456', 10)

  await prisma.professor.upsert({
    where: { email: 'professor@escola.com' },
    update: { nome: 'Professor Demo', senha: senhaHash },
    create: {
      nome: 'Professor Demo',
      email: 'professor@escola.com',
      senha: senhaHash,
    },
  })

  const turma = await prisma.turma.findFirst({ where: { nome: 'Turma Demo' } })
  const turmaDemo = turma ?? await prisma.turma.create({ data: { nome: 'Turma Demo' } })

  await prisma.aluno.upsert({
    where: { matricula: 'ALUNO001' },
    update: {
      nome: 'Aluno Demo',
      apelido: 'Aluno Demo',
      senha: senhaHash,
      turmaId: turmaDemo.id,
    },
    create: {
      nome: 'Aluno Demo',
      apelido: 'Aluno Demo',
      matricula: 'ALUNO001',
      senha: senhaHash,
      turmaId: turmaDemo.id,
    },
  })

  console.log('Contas de demonstração criadas/atualizadas:')
  console.log('Professor: professor@escola.com / 123456')
  console.log('Aluno: ALUNO001 / 123456')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })