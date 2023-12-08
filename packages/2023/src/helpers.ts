export const isNumber = (character: string): boolean => character <= '9' && character >= '0'

export const hasFraction = (n: number): boolean => (n - Math.floor(n)) !== 0

// greatest common factor, ty gpt
export function gcf (a: number, b: number): number {
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

// ty gpt 2
export function lcm (numbers: number[]): number {
  return numbers.reduce((acc, n) => {
    return (n * acc) / gcf(n, acc)
  }, 1)
}
