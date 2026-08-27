import { getInputElement } from "../input-element";
import { onKeyup } from "../handlers/keyup";
import { onKeydown } from "../handlers/keydown";
import {
  depressedKeys,
  isKeybrActive,
  setDepressedKeys,
} from "../../states/keybr";

const inputEl = getInputElement();

inputEl.addEventListener("keyup", async (event) => {
  if (isKeybrActive()) {
    const k = event.key.toLowerCase();
    setDepressedKeys(
      depressedKeys().filter((x) => x !== k && x !== event.code),
    );
  }

  console.debug("wordsInput event keyup", {
    event,
    key: event.key,
    code: event.code,
  });

  await onKeyup(event);
});

inputEl.addEventListener("keydown", async (event) => {
  if (isKeybrActive()) {
    const k = event.key.toLowerCase();
    if (!depressedKeys().includes(k)) {
      setDepressedKeys([...depressedKeys(), k]);
    }
  }

  console.debug("wordsInput event keydown", {
    event,
    key: event.key,
    code: event.code,
  });

  await onKeydown(event);
});
