import { lcm } from '@/helpers'
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

interface MapInfo {
  instructions: Direction[]
  lookup: NodeLookupMap
  nodes: NetworkNode[]
}
function parseMap (input: string, directionValues: DirectionMap): MapInfo {
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
    lookup,
    nodes: nodeList
  }
}

type TraverseCallback = (
  curNode: NetworkNode,
  steps: number
) => boolean

type ParallelTraverseCallback = (
  curNodes: NetworkNode[],
  steps: number
) => boolean

function traverseMapsUntil (
  cb: ParallelTraverseCallback,
  maps: NetworkMap[]
): number {
  const initDirections = ({ instructions }: NetworkMap): Direction[] => [...instructions]
  let steps = 0
  const directions: Direction[][] = maps.map(initDirections)
  const curNodes: NetworkNode[] = maps.map(({ map }) => map)
  while (!cb(curNodes, steps)) {
    for (let i = 0; i < maps.length; i++) {
      if (curNodes[i].paths == null) throw new Error('No paths for node')
      if (directions[i].length === 0) {
        directions[i] = initDirections(maps[i])
      }
      const nextNode = curNodes[i]?.paths?.[directions[i][0]]
      if (nextNode == null) throw new Error('no next path available')
      curNodes[i] = nextNode
      directions[i].shift()
    }
    steps += 1
  }
  return steps
}

function traverseMapUntil (
  cb: TraverseCallback,
  map: NetworkMap
): number {
  return traverseMapsUntil(
    (curNodes, steps) => cb(curNodes[0], steps),
    [map]
  )
}

const DIRECTION_VALUES: DirectionMap = {
  L: Direction.Left,
  R: Direction.Right
}

export function main (): void {
  console.log('Result pt.1', (() => {
    const input = fs.readFileSync('./data/08/full.txt').toString()
    const inputs = [input]
    const maps = inputs.map((input): NetworkMap => {
      const mapInfo = parseMap(input, DIRECTION_VALUES)
      return {
        instructions: mapInfo.instructions,
        map: mapInfo.lookup.AAA
      }
    })
    const results = maps.map((map) => {
      return traverseMapUntil((curNode) => {
        return curNode.identifier === 'ZZZ'
      }, map)
    })
    return results[0]
  })())
  console.log('Result pt.2', (() => {
    const input = fs.readFileSync('./data/08/full.txt').toString()
    const mapInfo = parseMap(input, DIRECTION_VALUES)
    const startMaps: NetworkMap[] = mapInfo.nodes
      .filter((node) => node.identifier.at(-1) === 'A')
      .map((node): NetworkMap => ({
        instructions: mapInfo.instructions,
        map: node
      }))
    let prevPos: number[] = startMaps.map(() => -1)
    traverseMapsUntil((curNodes, steps): boolean => {
      // calculate number of loops per cycle
      const zNodes = curNodes.map((node) => node.identifier.at(-1) === 'Z'
        ? node
        : null)
      if (zNodes.length > 0) {
        prevPos = prevPos.map((pos, i) => zNodes[i] !== null
          ? steps
          : pos)
        return prevPos.every((pos) => pos > -1)
      }
      return false
    },
    startMaps
    )
    // calculate the number of cycles for ghosts to "match up"
    // A LOT of hints where needed for this one
    // i dont even math
    // shoop
    return lcm(prevPos)
    // da woop
  })())
}
