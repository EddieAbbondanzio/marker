import { Command } from "./types";

/**
 * Resize global navigation width.
 * @param newWidth New width string ex: '120px'
 */
const resizeWidth: Command<string> = async ({ commit, state }, newWidth) => {
  if (newWidth == null) {
    throw Error();
  }

  state.globalNavigation.width = newWidth;
  await commit(state);
  console.log("set width: ", newWidth);
};

/**
 * Update the current scroll position.
 * @param newScroll The new scroll position.
 */
const updateScroll: Command<number> = async ({ commit, state }, newScroll) => {
  if (newScroll == null) {
    throw Error();
  }

  if (newScroll < 0) {
    throw Error(`Invalid scroll position. Scroll was negative: ${newScroll}`);
  }

  state.globalNavigation.scroll = newScroll;
  await commit(state);
};

const scrollDown: Command<number> = async (
  { commit, state },
  increment = 30
) => {
  state.globalNavigation.scroll += increment;
  await commit(state);
  console.log(
    "SCROLL DOWN!",
    state.globalNavigation.scroll,
    " inc:",
    increment
  );
};

const scrollUp: Command<number> = async ({ commit, state }, increment = 30) => {
  state.globalNavigation.scroll -= increment;
  await commit(state);
};

export const GLOBAL_NAVIGATION_REGISTRY = {
  resizeWidth,
  updateScroll,
  scrollDown,
  scrollUp,
};
