export const CYBER_COLORS_10 = [
  '#00f5ff', // cyan laser
  '#39ff14', // neon green
  '#ff2bd6', // magenta pulse
  '#ffe600', // electric yellow
  '#00ff9c', // mint signal
  '#ff6a00', // hot orange
  '#7df9ff', // arctic glow
  '#ff3864', // crimson neon
  '#8a2cff', // ultraviolet
  '#00b7ff', // cobalt beam
] as const

export function cyberColorAt(index: number): string {
  const i = Math.abs(index) % CYBER_COLORS_10.length
  return CYBER_COLORS_10[i]
}
