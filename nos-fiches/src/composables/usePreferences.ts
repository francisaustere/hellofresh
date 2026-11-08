import type { Ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { DEFAULT_SERVINGS } from "@/engine/quantity.utils";

// Per-device choices: servings, the recipes in the basket, ticked shopping lines.
const servings = useLocalStorage<number>("servings", DEFAULT_SERVINGS);
const cart = useLocalStorage<string[]>("cart", []);
const checked = useLocalStorage<Record<string, boolean>>("checked", {});

export type UsePreferencesReturn = {
  servings: Ref<number>,
  cart: Ref<string[]>,
  checked: Ref<Record<string, boolean>>,
  isInCart: (id: string) => boolean,
  toggleCart: (id: string) => void,
  removeFromCart: (id: string) => void,
  pruneCart: (exists: (id: string) => boolean) => void,
  setChecked: (key: string, isChecked: boolean) => void,
  clearCart: () => () => void,
};

export function usePreferences(): UsePreferencesReturn {
  const isInCart = (id: string): boolean => cart.value.includes(id);

  const toggleCart = (id: string): void => {
    cart.value = isInCart(id) ? cart.value.filter((cartId) => cartId !== id) : [...cart.value, id];
  };

  const removeFromCart = (id: string): void => {
    cart.value = cart.value.filter((cartId) => cartId !== id);
  };

  /** Drops basket entries whose recipe no longer exists in the data. */
  const pruneCart = (exists: (id: string) => boolean): void => {
    cart.value = cart.value.filter(exists);
  };

  const setChecked = (key: string, isChecked: boolean): void => {
    checked.value = { ...checked.value, [key]: isChecked };
  };

  /** Empties the basket and its ticks; returns a function that puts them back (for the undo toast). */
  const clearCart = (): (() => void) => {
    const previous = { cart: cart.value, checked: checked.value };
    cart.value = [];
    checked.value = {};
    return () => {
      cart.value = previous.cart;
      checked.value = previous.checked;
    };
  };

  return { servings, cart, checked, isInCart, toggleCart, removeFromCart, pruneCart, setChecked, clearCart };
}
