import fs from 'fs'

function parseValues (input: string): number[][] {
  return input.split('\n')
    .map((line) => line.split(' '))
    .map((ns) => ns.map(Number))
}

function predictNextValue (values: number[]): number {
  let prevRow = [...values]
  const lastValuePerRow = [prevRow.at(-1)]
  let tmpRow = []
  let ptr = 0
  while (ptr < prevRow.length) {
    const diff = prevRow[ptr + 1] - prevRow[ptr]
    tmpRow.push(diff)
    ptr += 1
    if (ptr === prevRow.length - 1) {
      if (tmpRow.every((n) => n === 0)) {
        break
      }
      prevRow = [...tmpRow]
      lastValuePerRow.push(diff)
      tmpRow = []
      ptr = 0
    }
  }

  let rest = 0
  const stack = [...lastValuePerRow]
  while (stack.length > 0) {
    const value = stack.pop()
    if (value == null || isNaN(value)) throw new Error('value of last value is null or NaN')
    rest = value + rest
  }

  return rest
}

export function main (): void {
  const input = fs.readFileSync('./data/09/full.txt').toString()
  const values = parseValues(input)
  const predictions = values.map(predictNextValue)
  console.log('Result pt.1', predictions.reduce((acc, cur) => acc + cur, 0))
}
