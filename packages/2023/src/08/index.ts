import fs from 'fs'

enum Direction {
  Left = 0,
  Right = 1
}

interface DirectionMap {
  [key: string]: Direction
}

interface NetworkNode {
  identifier: string
  paths?: Array<NetworkNode | undefined>
  pathIds: string[]
}

interface NetworkMap {
  instructions: Direction[]
  map: NetworkNode
}

interface NodeLookupMap {
  [key: string]: NetworkNode
}

function parseMap (input: string, directionValues: DirectionMap): NetworkMap {
  const [instructionNode, nodeNotes] = input.split('\n\n')
  const instructions: Direction[] = instructionNode.trim().split('')
    .map((char) => directionValues[char])
  const nodeList: NetworkNode[] = nodeNotes.split('\n')
    .map((nodeNote): NetworkNode => {
      const [idNote, directionNote] = nodeNote.split(' = ')
      const identifier = idNote.trim()
      const pathIds: string[] = directionNote.slice(1, -1).split(',')
        .map((pathNote) => pathNote.trim())
      return {
        identifier,
        pathIds
      }
    })
  const lookup: NodeLookupMap = {}
  for (const node of nodeList) {
    const paths = node.pathIds.map((pathId) => nodeList.find((node) => node.identifier === pathId))
    node.paths = paths
    lookup[node.identifier] = node
  }
  return {
    instructions,
    map: lookup.AAA
  }
}

interface TraverseResult {
  steps: number
}

type TraverseCallback = (
  curNode: NetworkNode,
  prevNode: NetworkNode,
  steps: number
) => boolean

function traverseMapUntil (
  map: NetworkMap,
  cb: TraverseCallback
): TraverseResult {
  let steps = 0
  let curNode: NetworkNode = map.map
  let prevNode: NetworkNode | null = null
  let directionsLeft = [...map.instructions]
  do {
    if (curNode.paths == null) throw new Error('No paths for node')
    if (directionsLeft.length === 0) {
      directionsLeft = [...map.instructions]
    }
    const nextNode = curNode.paths[directionsLeft[0]]
    if (nextNode == null) throw new Error('no next path available')
    curNode = nextNode
    directionsLeft.shift()
    prevNode = curNode
    steps += 1
  } while (!cb(curNode, prevNode, steps))
  return {
    steps
  }
}

const DIRECTION_VALUES: DirectionMap = {
  L: Direction.Left,
  R: Direction.Right
}

export function main (): void {
  console.log('Result pt.1', (() => {
    const input = fs.readFileSync('./data/08/full.txt').toString()
    const inputs = [input]
    const maps = inputs.map((input) => parseMap(input, DIRECTION_VALUES))
    const results = maps.map((map) => {
      return traverseMapUntil(map, (curNode, prevNode, steps) => {
        // console.log(steps, curNode.identifier, prevNode.identifier)
        return curNode.identifier === 'ZZZ'
      })
    })
    return results[0]
  })())
}
