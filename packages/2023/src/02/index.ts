import fs from 'fs'
type MarbleColor = 'red' | 'green' | 'blue'

type MarbleInventory = Record<MarbleColor, number>

interface Round {
  hand: Partial<MarbleInventory>
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

const extractHand = ({ rounds }: Game): Array<Partial<MarbleInventory>> => rounds.map(({ hand }) => hand)

export const main = (): void => {
  const exampleInput = fs.readFileSync('./data/02/full.txt').toString()
  const games = parseGames(exampleInput)
  // console.log(games.map(extractHand))
  // console.log('---- AFTER ----')
  const validGames = games.filter((game) => validGame(game, MARBLE_INVENTORY))
  // console.log(games
  //   .filter((game) => validGame(game, MARBLE_INVENTORY))
  //   .map(extractHand))
  // console.log('----RESULT----')
  const result = validGames.reduce((acc, game) => acc + game.id, 0)
  console.log(`Result: ${result}`)
}
