import fs from 'fs'
import { isNumber } from '@/helpers'

const UNDEFINED_SYMBOL = '.'

type SchematicType = 'number' | 'symbol' | 'none'

interface Coordinate {
  x: number
  y: number
}

interface SchematicNumber {
  value: number
  location: Coordinate
  length: number
}

interface SchematicSymbol {
  location: Coordinate
  value: string
}

interface SchematicPart {
  location: Coordinate
  value: number
  length: number
  symbols: SchematicSymbol[]
}

interface Schematic {
  numbers: SchematicNumber[]
  symbols: SchematicSymbol[]
}

class MatrixTraverser {
  matrix: string[]
  rowPtr: number = 0
  colPtr: number = 0

  constructor (matrix: string[]) {
    this.matrix = matrix
  }

  endOfRow (): boolean {
    const nextIndex = this.nextIndex()
    if (nextIndex == null) return true
    return nextIndex[1] === 0
  }

  nextIndex (): [row: number, col: number] | null {
    const curLen = this.matrix[this.rowPtr].length
    if (this.colPtr < curLen - 1) {
      return [this.rowPtr, this.colPtr + 1]
    } else if (this.rowPtr < this.matrix.length - 1) {
      return [this.rowPtr + 1, 0]
    } else {
      return null
    }
  }

  next (): string | null {
    const nextIndex = this.nextIndex()
    if (nextIndex == null) return null
    this.rowPtr = nextIndex[0]
    this.colPtr = nextIndex[1]
    return this.value()
  }

  index (): [row: number, col: number] {
    return [this.rowPtr, this.colPtr]
  }

  valueAt (row: number, col: number): string {
    return this.matrix[row][col]
  }

  value (): string {
    return this.valueAt(this.rowPtr, this.colPtr)
  }

  lookahead (): string | null {
    const nextIndex = this.nextIndex()
    if (nextIndex == null) return null
    return this.valueAt(...nextIndex)
  }
}

const typeOfChar = (char: string): SchematicType => {
  if (isNumber(char) === true) {
    return 'number'
  } else if (char !== UNDEFINED_SYMBOL) {
    return 'symbol'
  } else {
    return 'none'
  }
}

const partsFromSchematic = (schematic: Schematic): SchematicPart[] => {
  return schematic.numbers
    .map((number): SchematicPart => {
      const tl: Coordinate = {
        x: number.location.x - 1,
        y: number.location.y - 1
      }
      const br: Coordinate = {
        x: number.location.x + number.length + 1,
        y: number.location.y + 1
      }
      const symbolsAround = schematic.symbols
        .filter((symbol) => (
          symbol.location.x >= tl.x &&
        symbol.location.x < br.x &&
        symbol.location.y >= tl.y &&
        symbol.location.y <= br.y
        ))
      return {
        ...number,
        symbols: symbolsAround
      }
    })
    .filter((part) => part.symbols.length > 0)
}

const parseSchematic = (input: string): Schematic => {
  const lines = input.split('\n')

  const schematic: Schematic = {
    symbols: [],
    numbers: []
  }

  let memory = ''
  const trav = new MatrixTraverser(lines)
  do {
    const char = trav.value()
    const type = typeOfChar(char)

    if (type === 'none') continue

    memory = memory + char

    const nextChar = trav.lookahead()
    if (nextChar !== null) {
      const nextType = typeOfChar(nextChar)
      if (type !== nextType || trav.endOfRow()) {
        const index = trav.index()
        const x = index[1] - (memory.length - 1)
        const y = index[0]
        if (type === 'number') {
          schematic.numbers.push({
            value: Number(memory),
            location: { x, y },
            length: memory.length
          })
        } else if (type === 'symbol') {
          schematic.symbols.push({
            value: memory,
            location: { x, y }
          })
        }
        memory = ''
      }
    }
  } while (trav.next() != null)
  return schematic
}

export const main = (): void => {
  const input = fs.readFileSync('./data/03/full.txt').toString()
  const schematic = parseSchematic(input)
  const parts = partsFromSchematic(schematic)
  const result = parts.reduce((acc, cur) => acc + cur.value, 0)
  console.log('Result: ', result)
}
