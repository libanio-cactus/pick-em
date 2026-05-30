const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(value: number): string {
  return brl.format(value);
}

export function odds(value: number): string {
  return value.toFixed(2);
}

export function percent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function multiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}
