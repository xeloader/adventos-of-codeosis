import fs from 'fs'

type CardType = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A'
type HandType = 'five-of-a-kind'
| 'four-of-a-kind'
| 'full-house'
| 'three-of-a-kind'
| 'two-pair'
| 'one-pair'
| 'high-card'

interface Card {
  identifier: CardType
  value: number
}

interface CardCollection extends Card {
  amount: number
}

interface Hand {
  cards: Card[]
  bid: number
}

interface GameHand extends Hand {
  collections: CardCollection[]
  type: HandType
  typeValue: number
  cardValue: number
}

interface RankHand extends GameHand {
  rank: number
}

type CardValueMap = {
  [key in CardType]?: number
}

type HandValueMap = {
  [key in HandType]: number
}

const HAND_VALUES: HandValueMap = {
  'five-of-a-kind': 100,
  'four-of-a-kind': 90,
  'full-house': 80,
  'three-of-a-kind': 70,
  'two-pair': 60,
  'one-pair': 50,
  'high-card': 40
}

const CARD_VALUES: CardValueMap = {
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14
}

function valueOfCard (
  type: CardType,
  cardValues: CardValueMap
): number {
  const definedCardValue = cardValues[type]
  if (definedCardValue == null) {
    if (isNaN(Number(type))) throw new Error('Undefined card value for a non-numeric value')
  }
  return definedCardValue != null
    ? definedCardValue
    : Number(type)
}

function groupCards (cards: Card[]): CardCollection[] {
  const grouped: CardCollection[] = []
  for (const card of cards) {
    const groupIdx = grouped.findIndex((col) => col.identifier === card.identifier)
    if (groupIdx > -1) {
      grouped[groupIdx].amount += 1
    } else {
      grouped.push({
        ...card,
        amount: 1
      })
    }
  }
  return grouped
}

function hasCollection (
  collections: CardCollection[],
  lookingFor: number[]
): boolean {
  let amounts = collections.map(({ amount }) => amount)
  const needles = [...lookingFor]
  while (needles.length > 0) {
    const needle = needles[0]
    const index = amounts.findIndex((amount) => amount === needle)
    if (index === -1) {
      return false
    }
    amounts = amounts.filter((_, i) => i !== index) // remove found collection
    needles.shift()
  }
  return true
}

function valueCards (cards: Card[]): number {
  const GRANULARITY = 3
  let value = 0
  let i = 0
  while (i < cards.length) {
    const multipler = cards.length - i
    const score = cards[i].value * Math.pow(10, multipler * GRANULARITY)
    value += score
    i += 1
  }
  return value
}

function valueHand (
  hand: Hand,
  handValues: HandValueMap
): GameHand {
  const collections = groupCards(hand.cards)
  let handType: HandType
  if (collections.length === 5) {
    handType = 'high-card'
  } else if (collections.length === 4) {
    handType = 'one-pair'
  } else if (hasCollection(collections, [3, 2])) {
    handType = 'full-house'
  } else if (hasCollection(collections, [2, 2, 1])) {
    handType = 'two-pair'
  } else if (hasCollection(collections, [3])) {
    handType = 'three-of-a-kind'
  } else if (collections.length === 2) {
    handType = 'four-of-a-kind'
  } else if (collections.length === 1) {
    handType = 'five-of-a-kind'
  } else {
    console.log(hand.cards, collections)
    throw new Error('Could not find type for hand')
  }
  return {
    ...hand,
    collections,
    type: handType,
    typeValue: handValues[handType],
    cardValue: valueCards(hand.cards)
  }
}

function rankHands (
  hands: GameHand[]
): RankHand[] {
  const sortedHands = [...hands].sort((handA, handB) => {
    const typeDiff = handA.typeValue - handB.typeValue
    const cardDiff = handA.cardValue - handB.cardValue
    if (typeDiff === 0) return cardDiff
    return typeDiff
  })
  return sortedHands.map<RankHand>((hand, i) => ({
    ...hand,
    rank: i + 1
  }))
}

function valueHands (
  hands: Hand[],
  handValues: HandValueMap
): GameHand[] {
  return hands.map((hand) => valueHand(hand, handValues))
}

function parseHands (
  input: string,
  cardValues: CardValueMap = {}
): Hand[] {
  const lines = input.split('\n')
  const hands = lines.map((handNote): Hand => {
    const [cardNote, bidNote] = handNote.split(' ')
      .filter((note) => note.trim() !== '')
    const cards = cardNote.split('')
      .map((cardType) => cardType as CardType)
      .map((cardType): Card => {
        return {
          identifier: cardType,
          value: valueOfCard(cardType, cardValues)
        }
      })
    return {
      cards,
      bid: Number(bidNote)
    }
  })

  return hands
}

export function main (): void {
  const input = fs.readFileSync('./data/07/full.txt').toString()
  const hands = parseHands(input, CARD_VALUES)
  const gameHands = valueHands(hands, HAND_VALUES)
  const rankedHands = rankHands(gameHands)
  console.log(rankedHands.map(({ rank, type, cards }) => [rank, type, cards.map(({ identifier }) => identifier)]))
  console.log('Result pt.1', (() => {
    return rankedHands.reduce((acc, hand) => acc + (hand.bid * hand.rank), 0)
  })())
}
