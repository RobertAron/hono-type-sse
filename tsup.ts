import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/connectToSse.ts", "src/connectToSseNode.ts", "src/typedSSE.ts"],
  dts: true,
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
});
