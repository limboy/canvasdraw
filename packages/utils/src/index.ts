import noise from "./noise";
import type { Noise } from "./noise";
import { drawText, splitText, getTextHeight } from "./text";

type Util = {
  noise: Noise,
  text: { drawText: typeof drawText, splitText: typeof splitText, getTextHeight: typeof getTextHeight }
}

const util: Util = { noise: noise(), text: { drawText, splitText, getTextHeight } };

export default util;