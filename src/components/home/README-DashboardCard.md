# Reusing the Dashboard Card

## How to use in another place

The **DashboardCard** component is presentational: it only needs a `card` object. You can use it anywhere without changing Home or the store.

### 1. Import the component and type

```tsx
import { DashboardCard } from "../components/home";
import type { DashboardCard as DashboardCardType } from "../types/home";
```

### 2. Option A — Use the same Zustand store (same user-created cards as Home)

If you want the **same** dashboard cards (including ones added via "Add new tab") to appear on another page:

```tsx
import { useDashboardCardsStore } from "../stores/dashboardCardsStore";
import { DashboardCard } from "../components/home";

export default function OtherPage() {
  const userCards = useDashboardCardsStore((s) => s.userCards);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {userCards.map((card) => (
        <DashboardCard key={card.id} card={card} />
      ))}
    </div>
  );
}
```

- **Will it break Home?** No. Both pages read from the same store. Adding/removing cards in the store updates both places.

### 3. Option B — Use your own data (different cards, no store)

If you want a **different** list of cards (e.g. from another API or local state):

```tsx
import { DashboardCard } from "../components/home";
import type { DashboardCard as DashboardCardType } from "../types/home";

const myCards: DashboardCardType[] = [
  { id: "1", title: "Custom", description: "From this page", value: 10 },
  { id: "2", title: "Another", description: "Local list", icon: "chart" },
];

export default function OtherPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {myCards.map((card) => (
        <DashboardCard key={card.id} card={card} />
      ))}
    </div>
  );
}
```

- **Will it break Home?** No. This page does not use the store; Home is unchanged.

### Card shape (for your data)

Each `card` must have at least:

- `id`: string (unique)
- `title`: string
- `description`: string

Optional: `value?: number`, `icon?: "document" | "chart" | "clipboard"`, `badge?: string`, `path?: string` (route for the card link).

## Summary

| Where you use it | Data source              | Effect on Home / store      |
|------------------|--------------------------|-----------------------------|
| Another page + store | `useDashboardCardsStore()` | Same cards everywhere; no break |
| Another page + local/API | Your own array          | Independent; no break       |

The component does not depend on the store or on the Home page, so reusing it elsewhere does not break existing features.
