import { onMounted, onUnmounted } from "vue";

type KeyHandler = (e: KeyboardEvent) => void;

interface KeyboardOptions {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  handler: KeyHandler;
}

export function useKeyboardShortcut(options: KeyboardOptions) {
  const { key, ctrl = false, meta = false, handler } = options;

  function handleKeydown(e: globalThis.KeyboardEvent) {
    const ctrlOrMeta = ctrl || meta;
    const isMatch = e.key === key;
    const modifierOk = !ctrlOrMeta || e.ctrlKey || e.metaKey;

    if (isMatch && modifierOk) {
      e.preventDefault();
      handler(e);
    }
  }

  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
}

export function useEscapeKey(handler: KeyHandler) {
  useKeyboardShortcut({ key: "Escape", handler });
}

export function useCtrlEnter(handler: KeyHandler) {
  useKeyboardShortcut({ key: "Enter", ctrl: true, handler });
}
