import fs from 'fs'
import { isNumber } from '@/helpers'

interface DigitMapping {
  [key: string]: number
}

const TEXT_DIGITS: DigitMapping = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9
}

const isReadableNumber = (line: string): boolean => TEXT_DIGITS[line] != null
const valueOfNumber = (line: string): number => TEXT_DIGITS[line]

const couldBeNumber = (characters: string): boolean => {
  const keys = Object.keys(TEXT_DIGITS)
  const matchingKey = keys.find((key) => key.slice(0, characters.length) === characters)
  console.log(matchingKey, characters)
  return matchingKey != null
}

const couldBeNumberBackwards = (characters: string): boolean => {
  const keys = Object.keys(TEXT_DIGITS)
  const matchingKey = keys.find((key) => key.slice(-characters.length) === characters)
  console.log(matchingKey, characters)
  return matchingKey != null
}
type NextFn = (ptr: number) => number
type NextFn = (ptr: number) => number
class Pointer {
  haystack: string
  ptr: number | undefined
  buffer: string = ''
  bufferPtr: number | null = null
  next: NextFn

  constructor (
    haystack: string,
    ptrStart: number,
    nextFn: NextFn
  ) {
    this.haystack = haystack
    this.next = nextFn
  }
}

const calibrationValue = (line: string): [number, number] => {
  let ptrA = 0
  let ptrB = line.length - 1

  let a: number | undefined
  let b: number | undefined

  let aBuf: string = ''
  let bBuf: string = ''

  let aBufPtr: number | null = null
  let bBufPtr: number | null = null

  while (
    (a == null || b == null) &&
    ptrA <= line.length &&
    ptrB >= 0
  ) {
    if (a == null) {
      const valA = line[ptrA]
      const valWithBuffer = aBuf + valA
      if (isNumber(valA)) {
        a = Number(valA)
      } else if (isReadableNumber(valWithBuffer)) {
        a = valueOfNumber(valWithBuffer)
      } else if (couldBeNumber(valWithBuffer)) {
        if (aBufPtr == null) { aBufPtr = ptrA }
        aBuf = valWithBuffer
      } else {
        if (aBufPtr != null) {
          ptrA = aBufPtr
          aBufPtr = null
        }
        aBuf = line[ptrA]
      }
      ptrA += 1
    }
    if (b == null) {
      const valB = line[ptrB]
      const valWithBuffer = valB + bBuf
      if (isNumber(valB)) {
        b = Number(valB)
      } else if (isReadableNumber(valWithBuffer)) {
        b = valueOfNumber(valWithBuffer)
      } else if (couldBeNumberBackwards(valWithBuffer)) {
        if (bBufPtr == null) { bBufPtr = ptrB }
        bBuf = valWithBuffer
      } else {
        if (bBufPtr != null) {
          ptrB = bBufPtr
          bBufPtr = null
        }
        bBuf = line[ptrB]
      }
      ptrB -= 1
    }
  }

  return [a, b] as [number, number]
}

export const main = (): void => {
  const exampleInput = fs.readFileSync('./data/01/full.txt').toString()
  const result = exampleInput
    .split('\n')
    .map(calibrationValue)
    .map((cns) => cns.join(''))
    .map(Number)
    .reduce((acc, cur) => acc + cur, 0)
  console.log(`Result is: ${result}`)
}
