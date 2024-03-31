import { js_beautify as format } from "js-beautify";
import registerWebworker from "webworker-promise/lib/register";

registerWebworker(async (message: string) => format(message));
