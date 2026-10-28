export const servicos = [
  { id: '1', titulo: 'Limpeza residencial', categoria: 'Limpeza', profissional: 'Dani Oliveira', cidade: 'São Paulo, SP', preco: 'A partir de R$ 90', avaliacao: '4,9', descricao: 'Casa, apartamento e organização para deixar tudo em ordem.' },
  { id: '2', titulo: 'Montagem de móveis', categoria: 'Montagem', profissional: 'Rafael Montador', cidade: 'São Paulo, SP', preco: 'A partir de R$ 75', avaliacao: '4,8', descricao: 'Montagem rápida de guarda-roupas, mesas e estantes.' },
  { id: '3', titulo: 'Manutenção elétrica', categoria: 'Elétrica', profissional: 'Luz & Cia', cidade: 'Osasco, SP', preco: 'A partir de R$ 110', avaliacao: '4,9', descricao: 'Tomadas, luminárias, chuveiros e pequenos reparos.' },
  { id: '4', titulo: 'Conserto hidráulico', categoria: 'Hidráulica', profissional: 'Carlos Encanador', cidade: 'Guarulhos, SP', preco: 'A partir de R$ 95', avaliacao: '4,7', descricao: 'Vazamentos, torneiras, sifões e registros.' },
  { id: '5', titulo: 'Aulas de reforço', categoria: 'Aulas', profissional: 'Marina Souza', cidade: 'São Paulo, SP', preco: 'R$ 60 por hora', avaliacao: '5,0', descricao: 'Matemática e português para ensino fundamental.' },
  { id: '6', titulo: 'Cuidados com pets', categoria: 'Pets', profissional: 'Bia Pet Sitter', cidade: 'São Paulo, SP', preco: 'A partir de R$ 50', avaliacao: '4,9', descricao: 'Passeios, visitas e companhia para seu melhor amigo.' },
  { id: '7', titulo: 'Pintura de ambientes', categoria: 'Pintura', profissional: 'Pinta Fácil', cidade: 'Santo André, SP', preco: 'A partir de R$ 180', avaliacao: '4,8', descricao: 'Paredes, tetos e retoques com acabamento caprichado.' },
  { id: '8', titulo: 'Instalação de prateleiras', categoria: 'Marcenaria', profissional: 'João na Parede', cidade: 'São Paulo, SP', preco: 'A partir de R$ 65', avaliacao: '4,8', descricao: 'Instalação segura de prateleiras, quadros e suportes.' },
];

export function ampliarServicos(pagina) {
  return servicos.map((servico, indice) => ({
    ...servico,
    id: `${servico.id}-${pagina}`,
    profissional: `${servico.profissional} ${pagina}`,
    avaliacao: indice % 3 === 0 ? '4,9' : servico.avaliacao,
  }));
}
