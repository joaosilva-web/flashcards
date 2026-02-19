export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          daily_goal: number
          timezone: string
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          daily_goal?: number
          timezone?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          daily_goal?: number
          timezone?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
      decks: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          icon: string
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          deck_id: string
          front: string
          back: string
          front_html: string | null
          back_html: string | null
          tags: string[]
          position: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deck_id: string
          front: string
          back: string
          front_html?: string | null
          back_html?: string | null
          tags?: string[]
          position?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deck_id?: string
          front?: string
          back?: string
          front_html?: string | null
          back_html?: string | null
          tags?: string[]
          position?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      card_states: {
        Row: {
          id: string
          card_id: string
          user_id: string
          ease_factor: number
          interval_days: number
          repetitions: number
          state: 'new' | 'learning' | 'review' | 'relearning'
          due_date: string
          last_review_date: string | null
          total_reviews: number
          correct_reviews: number
          created_at: string
          updated_at: string
          // FSRS fields
          difficulty: number
          stability: number
          retrievability: number
        }
        Insert: {
          id?: string
          card_id: string
          user_id: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          state?: 'new' | 'learning' | 'review' | 'relearning'
          due_date?: string
          last_review_date?: string | null
          total_reviews?: number
          correct_reviews?: number
          created_at?: string
          updated_at?: string
          // FSRS fields
          difficulty?: number
          stability?: number
          retrievability?: number
        }
        Update: {
          id?: string
          card_id?: string
          user_id?: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          state?: 'new' | 'learning' | 'review' | 'relearning'
          due_date?: string
          last_review_date?: string | null
          total_reviews?: number
          correct_reviews?: number
          created_at?: string
          updated_at?: string
          // FSRS fields
          difficulty?: number
          stability?: number
          retrievability?: number
        }
      }
      review_logs: {
        Row: {
          id: string
          card_id: string
          user_id: string
          rating: number
          time_spent_ms: number | null
          previous_ease_factor: number | null
          previous_interval_days: number | null
          previous_state: string | null
          new_ease_factor: number | null
          new_interval_days: number | null
          new_state: string | null
          new_due_date: string | null
          reviewed_at: string
        }
        Insert: {
          id?: string
          card_id: string
          user_id: string
          rating: number
          time_spent_ms?: number | null
          previous_ease_factor?: number | null
          previous_interval_days?: number | null
          previous_state?: string | null
          new_ease_factor?: number | null
          new_interval_days?: number | null
          new_state?: string | null
          new_due_date?: string | null
          reviewed_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          user_id?: string
          rating?: number
          time_spent_ms?: number | null
          previous_ease_factor?: number | null
          previous_interval_days?: number | null
          previous_state?: string | null
          new_ease_factor?: number | null
          new_interval_days?: number | null
          new_state?: string | null
          new_due_date?: string | null
          reviewed_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          deck_id: string | null
          started_at: string
          ended_at: string | null
          cards_studied: number
          cards_correct: number
          total_time_ms: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          deck_id?: string | null
          started_at?: string
          ended_at?: string | null
          cards_studied?: number
          cards_correct?: number
          total_time_ms?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          deck_id?: string | null
          started_at?: string
          ended_at?: string | null
          cards_studied?: number
          cards_correct?: number
          total_time_ms?: number
          created_at?: string
        }
      }
      daily_stats: {
        Row: {
          id: string
          user_id: string
          date: string
          cards_studied: number
          cards_correct: number
          new_cards: number
          review_cards: number
          total_time_ms: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          cards_studied?: number
          cards_correct?: number
          new_cards?: number
          review_cards?: number
          total_time_ms?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          cards_studied?: number
          cards_correct?: number
          new_cards?: number
          review_cards?: number
          total_time_ms?: number
          created_at?: string
        }
      }
    }
  }
}
