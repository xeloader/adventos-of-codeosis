import fs from 'fs'

type MapCategory = 'seed' | 'soil' | 'fertilizer' | 'water' | 'light' | 'temperature' | 'humidity' | 'location'
interface Range {
  sourceStart: number
  destinationStart: number
  length: number
}
interface SeedRange {
  start: number
  length: number
}

interface Map {
  destination: MapCategory
  source: MapCategory
  ranges: Range[]
}

interface Almanac {
  seeds: number[]
  maps: Map[]
}

interface AlmanacRange {
  seeds: SeedRange[]
  maps: Map[]
}

function translateMap (
  value: number,
  source: MapCategory,
  destination: MapCategory,
  map: Map
): number {
  const range = map.ranges.find(({ sourceStart, length }) => {
    return value >= sourceStart && value < sourceStart + length
  })
  if (range == null) return value
  return value - range.sourceStart + range.destinationStart
}

function translate (
  value: number,
  source: MapCategory,
  destination: MapCategory,
  almanac: Almanac
): number {
  const paths = pathsFor(source, destination)
  let inputValue = value
  let pathsToGo = [...paths]
  while (pathsToGo.length > 1) {
    const [source, destination] = pathsToGo
    const map = almanac.maps.find((map) => map.source === source && map.destination === destination)
    if (map == null) throw new Error('Couldnt find map')
    inputValue = translateMap(inputValue, source, destination, map)
    pathsToGo = pathsToGo.slice(1)
  }
  return inputValue
}

function reducePath (
  range: SeedRange,
  source: MapCategory,
  destination: MapCategory,
  almanac: Almanac,
  cb: (acc: number, cur: number) => number,
  init: number = 0
): number {
  let acc = init
  for (let i = 0; i < range.length - 1; i++) {
    const value = range.start + i
    const result = translate(value, source, destination, almanac)
    acc = cb(acc, result)
  }
  return acc
}

function pathsFor (
  source: MapCategory,
  destination: MapCategory
): MapCategory[] {
  const fullPath: MapCategory[] = ['seed', 'soil', 'fertilizer', 'water', 'light', 'temperature', 'humidity', 'location']
  const startIdx = fullPath.findIndex((cat) => cat === source)
  const endIdx = fullPath.findIndex((cat) => cat === destination)
  if (startIdx == null || endIdx == null) throw new Error('couldnt find full path')
  return fullPath.slice(startIdx, endIdx + 1)
}

function parseMap (mapNote: string): Map {
  const [header, ...mapNotes] = mapNote.split('\n')
  const [source, destination] = header.split(' ')[0].split('-to-')
  const ranges = mapNotes.map((mapNote): Range => {
    const [destinationStart, sourceStart, length] = mapNote
      .split(' ')
      .map((str) => str.trim())
      .filter((str) => str !== '')
      .map(Number)
    return {
      sourceStart,
      destinationStart,
      length
    }
  })
  return {
    source: source as MapCategory,
    destination: destination as MapCategory,
    ranges
  }
}

function toRangedAlmanac (almanac: Almanac): AlmanacRange {
  let ptr = 0
  const rangedSeeds: SeedRange[] = []
  while (ptr < almanac.seeds.length) {
    const seed = almanac.seeds[ptr]
    const length = almanac.seeds[ptr + 1]
    rangedSeeds.push({
      start: seed,
      length
    })
    ptr += 2
  }
  return {
    ...almanac,
    seeds: rangedSeeds
  }
}

function parseAlmanac (input: string): Almanac {
  const [seedNote, ...mapNotes] = input.split('\n\n')
  const maps = mapNotes.map(parseMap)
  const seedNumbers = seedNote
    .split(':')
    .at(-1)
  if (seedNumbers == null) throw new Error('No seeds available')

  const seeds = seedNumbers.split(' ')
    .map((str) => str.trim())
    .filter((str) => str !== '')
    .map(Number)

  return {
    seeds,
    maps
  }
}

export function main (): void {
  const input = fs.readFileSync('./data/05/example.txt').toString()
  const almanac = parseAlmanac(input)
  console.log('Result pt.1: ', (() => {
    const nearestLocation = almanac.seeds
      .reduce((acc, seed) => Math.min(acc, translate(seed, 'seed', 'location', almanac)), Number.POSITIVE_INFINITY)
    return nearestLocation
  })())
  console.log('Result pt.2: ', (() => { // this one runs for about... 20 mins lol
    const rangedAlmanac = toRangedAlmanac(almanac)
    let result = Number.POSITIVE_INFINITY
    for (const range of rangedAlmanac.seeds) {
      console.log('Checking range', range.start, '=>', range.start + range.length)
      const shortestPath = reducePath(range, 'seed', 'location', almanac,
        (acc, length) => {
          return length < acc
            ? length
            : acc
        }, Number.POSITIVE_INFINITY)
      result = shortestPath < result
        ? shortestPath
        : result
    }
    return result
  })())
}
