export const isNumber = (character: string): boolean => character <= '9' && character >= '0'

export const hasFraction = (n: number): boolean => (n - Math.floor(n)) !== 0
