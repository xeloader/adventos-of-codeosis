import fs from 'fs'

const isNumber = (character: string) => character <= '9' && character >= '0'

const calibrationValue = (line: string): [number, number] => {
  let ptrA = 0
  let ptrB = line.length - 1
  let a: number | undefined
  let b: number | undefined
  while (
    (a == null || b == null) &&
    ptrA <= line.length &&
    ptrB >= 0
  ) {
    
    if (a == null) {
      const valA = line[ptrA]
      if (isNumber(valA)){
        a = Number(valA)
      } else {
        ptrA += 1
      }
    }
    if (b == null) {
      const valB = line[ptrB]
      if (isNumber(valB)) {
        b = Number(valB)
      } else {
        ptrB -= 1
      }
    }
  }
  return [a, b] as [number, number]
}

export const main = () => {
  const exampleInput = fs.readFileSync('./data/01/full.txt').toString()
  const result = exampleInput
    .split('\n')
    .map(calibrationValue)
    .map((cns) => cns.join(''))
    .map(Number)
    .reduce((acc, cur) => acc + cur, 0)
  console.log(`Result is: ${result}`)
}


