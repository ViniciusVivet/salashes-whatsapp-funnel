/**
 * Combina classes condicionalmente (útil para Tailwind).
 */
export function cn(...inputs: (string | undefined | false | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}
