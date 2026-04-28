import type { ResolvedConfig } from "./types.js";
import { recommended } from "./presets/recommended.js";

export const defaultConfig: ResolvedConfig = {
  rules: { ...recommended },
  ignore: ["node_modules", ".git", "dist", "build"],
};
