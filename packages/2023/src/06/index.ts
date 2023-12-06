import { hasFraction } from '@/helpers'
import fs from 'fs'

interface Race {
  duration: number
  longestDistance: number
}

function parseRaces (input: string): Race[] {
  const [durationNote, distanceNote] = input.split('\n')
  const durations: number[] = durationNote.split(' ').slice(1).filter((str) => str.trim() !== '').map(Number)
  const distances: number[] = distanceNote.split(' ').slice(1).filter((str) => str.trim() !== '').map(Number)
  const races = durations.map((duration, i): Race => ({
    duration,
    longestDistance: distances[i]
  }))
  return races
}

function calculateDistance (chargeTime: number, raceDuration: number): number {
  const travelTime = raceDuration - chargeTime
  return chargeTime * travelTime
}

function waysToWin (race: Race): number {
  const startIndex = getStartIndex(race.duration)

  const winningCharges: number[] = []
  let ptrLeft = startIndex[0]
  let ptrRight = startIndex[1] != null
    ? startIndex[1]
    : startIndex[0]
  while (ptrLeft >= 0 && ptrRight <= race.duration) {
    const distanceL = calculateDistance(ptrLeft, race.duration)
    const distanceR = calculateDistance(ptrRight, race.duration)
    if (distanceL > race.longestDistance) {
      winningCharges.push(distanceL)
    }
    if (distanceR > race.longestDistance) {
      winningCharges.push(distanceR)
    }
    if (ptrLeft === ptrRight) {
      winningCharges.pop() // remove one of the results as they check the same chargeTime
    }
    if (distanceR <= race.longestDistance && distanceL <= race.longestDistance) {
      break
    }
    ptrLeft -= 1
    ptrRight += 1
  }
  return winningCharges.length
}

function getStartIndex (n: number): [number, number] | [number] {
  const mid = n / 2
  if (hasFraction(mid) === true) {
    return [Math.floor(mid), Math.ceil(mid)]
  } else {
    return [mid]
  }
}

function concatRaces (races: Race[]): Race {
  const concatRace = races
    .reduce((acc, race) => ({
      duration: acc.duration + race.duration.toString(),
      longestDistance: acc.longestDistance + race.longestDistance.toString()
    }), { duration: '', longestDistance: '' })
  return {
    duration: Number(concatRace.duration),
    longestDistance: Number(concatRace.longestDistance)
  }
}

export function main (): void {
  const input = fs.readFileSync('./data/06/full.txt').toString()
  const races = parseRaces(input)
  console.log(races)
  const winCounts = races.map(waysToWin)
  console.log('Result pt.1: ', (() => {
    return winCounts.reduce((acc, cur) => acc * cur, 1)
  })())
  console.log('Result pt.2: ', (() => {
    const race = concatRaces(races)
    return waysToWin(race)
  })())
}
