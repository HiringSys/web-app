import { ref } from "vue";

const isNavOpen = ref(true);

export function useNavbar() {
  return { isNavOpen };
}