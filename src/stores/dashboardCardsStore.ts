import { create } from "zustand";
import type { DashboardCard } from "../types/home";

export interface DashboardCardFilters {
  job?: string;
  dueDate?: string;
  status?: string;
  roles?: string;
}

/** User-created dashboard card (extends base with optional filters) */
export interface UserDashboardCard extends DashboardCard {
  filters?: DashboardCardFilters;
}

interface DashboardCardsState {
  /** User-created cards (from "Add new tab" form) */
  userCards: UserDashboardCard[];
  /** Add a new card and return it */
  addCard: (card: Omit<UserDashboardCard, "id">) => UserDashboardCard;
  /** Remove a card by id */
  removeCard: (id: string) => void;
  /** Update an existing card */
  updateCard: (id: string, updates: Partial<UserDashboardCard>) => void;
}

function generateCardId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useDashboardCardsStore = create<DashboardCardsState>((set) => ({
  userCards: [],

  addCard: (card) => {
    const newCard: UserDashboardCard = {
      ...card,
      id: generateCardId(),
    };
    set((state) => ({
      userCards: [...state.userCards, newCard],
    }));
    return newCard;
  },

  removeCard: (id) => {
    set((state) => ({
      userCards: state.userCards.filter((c) => c.id !== id),
    }));
  },

  updateCard: (id, updates) => {
    set((state) => ({
      userCards: state.userCards.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },
}));
