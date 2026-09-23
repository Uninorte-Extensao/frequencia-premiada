export const TERMOS_PRIVACIDADE = {
  versao: '1.0',
  sistema: 'EduPoints — Frequência Premiada',
  responsavel: 'Erick Saraiva',
  contato: 'juliane.oliveira.pinto@gmail.com',
  decisao: 'Li e estou ciente',
  finalidade: 'Registrar frequência escolar, apresentar histórico e pontos e permitir o exercício dos direitos do titular.',
  baseLegal: 'LGPD Art. 7º, inciso III — execução de políticas públicas.',
  dadosColetados: [
    { dado: 'Nome, apelido e matrícula', finalidade: 'Identificação do aluno no aplicativo' },
    { dado: 'Turma e registros de presença', finalidade: 'Controle e consulta da frequência escolar' },
    { dado: 'Tag NFC', finalidade: 'Identificação durante a chamada' },
    { dado: 'Pontuação', finalidade: 'Acompanhamento da experiência gamificada' },
  ],
  direitosDoTitular: [
    'Consultar os próprios dados e registros de frequência',
    'Solicitar uma cópia dos próprios dados',
    'Receber informações sobre finalidade e contato responsável',
    'Solicitar correção pelos canais responsáveis',
  ],
} as const
