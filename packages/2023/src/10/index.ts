import fs from 'fs'

// grid starts from top-left corner, at x: 0 and y: 0
type PipeType = 'F' | '7' | 'J' | 'L' | '|' | '-' | 'S'

enum Direction {
  North = -1,
  South = 1,
  West = -1,
  East = 1
}

type PipeDirection = [
  x: Direction[] | null,
  y: Direction[] | null
]

type PipeMap = {
  [key in PipeType]?: PipeDirection
}

interface Coordinate {
  x: number
  y: number
}

type PipeGrid = String[][]

interface AnimalGrid {
  grid: PipeGrid
  startIdentifier: PipeType
  startPos: Coordinate
}

function positionFor (grid: PipeGrid, identifier: PipeType): Coordinate {
  for (let ri = 0; ri < grid.length; ri++) {
    for (let ci = 0; ci < grid[ri].length; ci++) {
      if (grid[ri][ci] === identifier) return { x: ci, y: ri }
    }
  }
  throw new Error('Did not find position for type')
}

function parsePipes (
  input: string,
  startType: PipeType
): AnimalGrid {
  const grid: string[][] = input.split('\n')
    .map((row) => row.split(''))
  const startPos = positionFor(grid, startType)
  return {
    startIdentifier: startType,
    startPos,
    grid
  }
}

function nextStep (coordinate: Coordinate, direction: PipeDirection, directionId: number): Coordinate {
  let curId = 0
  if (direction[0] != null) {
    for (const x of direction[0]) {
      if (curId === directionId) return { x: coordinate.x + x, y: coordinate.y }
      curId += 1
    }
  }
  if (direction[1] != null) {
    for (const y of direction[1]) {
      if (curId === directionId) return { x: coordinate.x, y: coordinate.y + y }
      curId += 1
    }
  }
}

function pipeConnectedTo (
  direction: PipeDirection,
  coordinate: Coordinate,
  toCoordinate: Coordinate
): boolean {
  // console.log(coordinate.x, ',', coordinate.y, direction[0], ':', direction[1], '->', toCoordinate.x, ',', toCoordinate.y)
  if (direction[0] != null) {
    for (const x of direction[0]) {
      const landX = coordinate.x + x
      if (landX === toCoordinate.x && toCoordinate.y === coordinate.y) {
        return true
      }
    }
  }
  if (direction[1] != null) {
    for (const y of direction[1]) {
      if (coordinate.y + y === toCoordinate.y && toCoordinate.x === coordinate.x) {
        return true
      }
    }
  }
  return false
}

function typeOfPipe (
  grid: AnimalGrid,
  map: PipeMap,
  coord: Coordinate
): PipeType {
  const { x, y } = coord
  const tl = { x: x - 1, y: y - 1 }
  const br = { x: x + 1, y: y + 1 }
  const connectedPipes: Coordinate[] = []
  for (let ri = tl.y; ri < br.y + 1; ri++) {
    for (let ci = tl.x; ci < br.x + 1; ci++) {
      const current: PipeType = grid.grid[ri][ci] as PipeType
      if (current == null) continue
      const direction = map[current]
      const pipeCoord = { x: ci, y: ri }
      if (direction != null && pipeConnectedTo(direction, pipeCoord, grid.startPos)) {
        connectedPipes.push(pipeCoord)
      }
    }
  }
  if (connectedPipes.length < 2) throw new Error('did not find two connecting pipes to start pos')
  const pipe = Object.entries(map)
    .find(([_, direction]: [string, PipeDirection]) => {
      return connectedPipes.every((pipeCoord) => {
        return pipeConnectedTo(direction, grid.startPos, pipeCoord)
      })
    })
  if (pipe == null) throw new Error('Couldnt find correct starting pipe')
  return pipe[0] as PipeType
}

function traversePipes (
  grid: AnimalGrid,
  map: PipeMap
): number {
  const createId = (x: number, y: number): string => `${x}:${y}`
  const coordToId = (coord: Coordinate): string => createId(coord.x, coord.y)
  const start = grid.startPos
  const ns = typeOfPipe(grid, map, start)
  let directions = map[ns]
  let traverseLength = 0
  if (directions != null) {
    const traversed = { [coordToId(start)]: true }
    let directionId = 0
    let pos = start
    while (directions != null) {
      const next = nextStep(pos, directions, directionId)
      if (next == null) break
      const nextId = coordToId(next)
      const pipe = grid.grid[next.y][next.x] as PipeType
      if (traversed[nextId]) {
        directionId = (directionId + 1)
      } else if (traversed[nextId] == null) {
        console.log(traverseLength, nextId, pos.x, pos.y, pipe)
        traversed[nextId] = true
        pos = next
        directions = map[pipe]
        directionId = 0
        traverseLength += 1
      }
    }
  }
  return traverseLength
}

export function main (): void {
  const input = fs.readFileSync('./data/10/full.txt').toString()
  const grid = parsePipes(input, 'S')
  const result = traversePipes(grid, {
    '|': [null, [Direction.North, Direction.South]],
    '-': [[Direction.West, Direction.East], null],
    L: [[Direction.East], [Direction.North]],
    J: [[Direction.West], [Direction.North]],
    7: [[Direction.West], [Direction.South]],
    F: [[Direction.East], [Direction.South]]
  })
  console.log('res', Math.ceil((result / 2)))
}
