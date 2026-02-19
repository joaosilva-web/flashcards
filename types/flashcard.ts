import { Database } from './database'

export type Deck = Database['public']['Tables']['decks']['Row']
export type Card = Database['public']['Tables']['cards']['Row']
export type CardState = Database['public']['Tables']['card_states']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export interface DeckWithCards extends Deck {
  cards: Card[]
}

export interface CardWithState extends Card {
  card_state: CardState
}
