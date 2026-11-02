import { ref, type Ref } from "vue";

export type Toast = {
  id: number,
  text: string,
  undo?: () => void,
};

const TOAST_DURATION_MS = 6000;

const toast = ref<Toast | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;
let nextId = 0;

export type UseToastReturn = {
  toast: Ref<Toast | null>,
  showToast: (text: string, undo?: () => void) => void,
  hideToast: () => void,
};

export function useToast(): UseToastReturn {
  const hideToast = (): void => {
    if (timer) clearTimeout(timer);
    toast.value = null;
  };

  const showToast = (text: string, undo?: () => void): void => {
    hideToast();
    toast.value = { id: ++nextId, text, undo };
    timer = setTimeout(hideToast, TOAST_DURATION_MS);
  };

  return { toast, showToast, hideToast };
}
