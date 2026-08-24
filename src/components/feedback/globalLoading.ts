import { computed, readonly, ref } from "vue";

type LoadingOperation = {
  id: symbol;
  message: string;
};

const MINIMUM_VISIBLE_TIME = 320;

const operations = ref<LoadingOperation[]>([]);
const visible = ref(false);
const lastMessage = ref("Processando...");

let visibleSince = 0;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

export const globalLoadingVisible = readonly(visible);
export const globalLoadingMessage = computed(
  () => operations.value.at(-1)?.message ?? lastMessage.value,
);

export function beginGlobalLoading(message = "Processando...") {
  const id = Symbol("global-loading");
  let finished = false;

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = undefined;
  }

  lastMessage.value = message;
  operations.value = [...operations.value, { id, message }];

  if (!visible.value) {
    visible.value = true;
    visibleSince = Date.now();
  }

  return () => {
    if (finished) return;
    finished = true;

    operations.value = operations.value.filter(
      (operation) => operation.id !== id,
    );

    if (operations.value.length > 0) return;

    const remainingTime = Math.max(
      0,
      MINIMUM_VISIBLE_TIME - (Date.now() - visibleSince),
    );

    hideTimer = setTimeout(() => {
      if (operations.value.length === 0) visible.value = false;
      hideTimer = undefined;
    }, remainingTime);
  };
}
