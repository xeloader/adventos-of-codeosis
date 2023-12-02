import fs from 'fs'
type MarbleColor = 'red' | 'green' | 'blue'

type MarbleInventory = Record<MarbleColor, number>

type MarbleHand = Partial<MarbleInventory>

interface Round {
  hand: MarbleHand
}

interface Game {
  id: number
  rounds: Round[]
}

const MARBLE_INVENTORY: MarbleInventory = {
  red: 12,
  green: 13,
  blue: 14
}

const parseGames = (input: string): Game[] => {
  const lines = input.split('\n')
  const games = lines.map((line): Game => {
    const [gameNote, roundNotes] = line
      .split(':')
      .map((line) => line.trim())
    const gameId = Number(gameNote
      .split(' ')
      .at(-1)
    )
    const rounds = roundNotes
      .split(';')
      .map((roundNote) => roundNote.trim())
      .map((roundNote) => roundNote
        .split(',')
        .map((marbleNote) => marbleNote.trim())
        .map((marbleNote) => marbleNote.split(' '))
        .reduce((acc, [amount, marbleColor]): Round => ({
          hand: {
            ...acc.hand,
            [marbleColor]: Number(amount)
          }
        }), { hand: {} })
      )
    return {
      id: gameId,
      rounds
    }
  })
  return games
}

const validGame = (game: Game, marblesAvailable: MarbleInventory): boolean => {
  for (const round of game.rounds) {
    const marbles = Object.entries(round.hand)
    if (marbles.every(([marbleColor, amount]) => {
      const available = marblesAvailable[marbleColor as MarbleColor]
      return amount <= available
    })) {
      continue
    }
    return false
  }
  return true
}

const minimumNumberOfMarbles = (game: Game): MarbleHand => {
  const minimumNumber: MarbleHand = {}
  for (const round of game.rounds) {
    const marbles = Object.entries(round.hand)
    for (const [marbleColor, amount] of marbles) {
      const curAmount = minimumNumber?.[marbleColor as MarbleColor] ?? 0
      if (amount > curAmount) {
        minimumNumber[marbleColor as MarbleColor] = amount
      }
    }
  }
  return minimumNumber
}

const extractHand = ({ rounds }: Game): MarbleHand[] => rounds.map(({ hand }) => hand)

export const main = (): void => {
  const exampleInput = fs.readFileSync('./data/02/full.txt').toString()
  const games = parseGames(exampleInput)
  const validGames = games.filter((game) => validGame(game, MARBLE_INVENTORY))
  const resultPt1 = validGames.reduce((acc, game) => acc + game.id, 0)
  console.log(`Result Pt.1: ${resultPt1}`)

  const minimumMarblesPerGame = games.map(minimumNumberOfMarbles)
  const resultPt2 = minimumMarblesPerGame
    .map((marbles) => Object.values(marbles)
      .reduce((acc, cur) => acc * cur, 1)
    )
    .reduce((acc, cur) => acc + cur, 0)
  console.log(`Result Pt.2: ${resultPt2}`)
}
