import fs from 'fs'

interface ScratchCard {
  id: number
  winningNumbers: number[]
  numbers: number[]
}

interface CardResult extends ScratchCard {
  points: number
}

function valueCards (cards: ScratchCard[]): CardResult[] {
  const results: CardResult[] = []
  for (const card of cards) {
    let points = 0
    for (const winningNumber of card.winningNumbers) {
      if (card.numbers.includes(winningNumber)) {
        points = points === 0
          ? 1
          : points * 2
      }
    }
    results.push({
      ...card,
      points
    })
  }
  return results
}

function parseNumberNote (numberNote: string): number[] {
  return numberNote.split(' ')
    .filter((number) => number.trim() !== '')
    .map(Number)
}

function parseCards (input: string): ScratchCard[] {
  const cards = input.split('\n')
    .map((line) => line.split(':'))
    .map(([cardNote, gameNote]) => {
      const id = Number(cardNote.split(' ').at(-1))
      const [winningNote, numberNote] = gameNote.split('|')
      const winningNumbers = parseNumberNote(winningNote)
      const numbers = parseNumberNote(numberNote)
      return {
        id,
        winningNumbers,
        numbers
      }
    })
  return cards
}

export function main (): void {
  const input = fs.readFileSync('./data/04/full.txt').toString()
  const cards = parseCards(input)
  const valuedCards = valueCards(cards)
  console.log('Result: ', (() => {
    return valuedCards.reduce((acc, cur) => acc + cur.points, 0)
  })())
}
