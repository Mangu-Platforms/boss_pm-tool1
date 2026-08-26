export type Favorite = {
  id: string;
  user_id: string;
  item_type: "issue" | "product" | "milestone" | "sprint" | "view";
  item_id: string;
  item_title: string;
  created_at: string;
};

const store: Favorite[] = [];

export function listFavorites(userId: string): Favorite[] {
  return store.filter((f) => f.user_id === userId).reverse();
}

export function addFavorite(userId: string, itemType: Favorite["item_type"], itemId: string, itemTitle: string): Favorite {
  const existing = store.find((f) => f.user_id === userId && f.item_id === itemId);
  if (existing) return existing;
  const fav: Favorite = {
    id: crypto.randomUUID(),
    user_id: userId,
    item_type: itemType,
    item_id: itemId,
    item_title: itemTitle,
    created_at: new Date().toISOString(),
  };
  store.push(fav);
  return fav;
}

export function removeFavorite(userId: string, itemId: string): boolean {
  const idx = store.findIndex((f) => f.user_id === userId && f.item_id === itemId);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function isFavorite(userId: string, itemId: string): boolean {
  return store.some((f) => f.user_id === userId && f.item_id === itemId);
}
