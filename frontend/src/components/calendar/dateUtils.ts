export function toIsoDate(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function buildMonthGrid(monthDate: Date): Date[] {
  const ano = monthDate.getFullYear();
  const mes = monthDate.getMonth();

  const primeiroDiaDoMes = new Date(ano, mes, 1);
  const inicio = new Date(primeiroDiaDoMes);
  inicio.setDate(inicio.getDate() - inicio.getDay());

  const dias: Date[] = [];
  const cursor = new Date(inicio);
  for (let i = 0; i < 42; i++) {
    dias.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

export const MESES_LABEL = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const DIAS_SEMANA_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
