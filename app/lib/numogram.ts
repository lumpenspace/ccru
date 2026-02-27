/**
 * Compute the digital-reduction (plex) expression for a cumulation value.
 * Returns null if cum < 10 (single digit, no reduction needed).
 * Example: plexExpr(45) => "4+5=9"
 *          plexExpr(28) => "2+8=10=1+0=1"
 */
export function plexExpr(cum: number): string | null {
  if (cum < 10) return null
  let current = cum
  let expr = ''
  let first = true
  while (current >= 10) {
    const digits = String(current).split('').map(d => Number(d))
    const sum = digits.reduce((acc, d) => acc + d, 0)
    if (first) {
      expr = `${digits.join('+')}=${sum}`
      first = false
    } else {
      expr += `=${sum}`
    }
    current = sum
  }
  return expr
}
