import fs from 'fs'

interface ScratchCard {
  id: number
  winningNumbers: number[]
  numbers: number[]
}

interface CardResult extends ScratchCard {
  points: number
  matches: number
}

interface RedeemedCard extends CardResult {
  amount: number
}

function redeemCards (cards: CardResult[]): RedeemedCard[] {
  const redeemed: RedeemedCard[] = [...cards.map((card) => ({ ...card, amount: 1 }))]
  let ptr = 0
  while (ptr < redeemed.length - 1) {
    const card = redeemed[ptr]
    for (let i = 0; i < card.matches; i++) { // following cards to clone
      const cardToClone = redeemed[ptr + i + 1]
      for (let j = 0; j < card.amount; j++) { // cloned j times
        if (cardToClone != null) {
          cardToClone.amount += 1
        }
      }
    }
    ptr += 1
  }
  return redeemed
}

function valueCards (cards: ScratchCard[]): CardResult[] {
  const results: CardResult[] = []
  for (const card of cards) {
    let points = 0
    let matches = 0
    for (const winningNumber of card.winningNumbers) {
      if (card.numbers.includes(winningNumber)) {
        points = points === 0
          ? 1
          : points * 2
        matches += 1
      }
    }
    results.push({
      ...card,
      points,
      matches
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
  console.log('Result pt.2: ', (() => {
    const redeemed = redeemCards(valuedCards)
    return redeemed.reduce((acc, cur) => acc + cur.amount, 0)
  })())
}
