import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SourceMapConsumer } from "source-map";
//# sourceMappingURL=index.js.map
export const retrieveSourceMapURL = (source: string) => {
  const fileData = fs.readFileSync(source, { encoding: "utf-8" });

  const regex = /# sourceMappingURL=(.*)$/g;
  let lastMatch, match;
  while ((match = regex.exec(fileData))) {
    lastMatch = match;
  }
  if (!lastMatch) return null;
  return lastMatch[1];
};

export const mapSourcePosition = (
  source: string,
  line: number,
  column: number
) => {
  if (source.startsWith("file:/")) {
    source = fileURLToPath(source);
    // console.log("source", source);
  }
  if (!fs.existsSync(source)) {
    return null;
  }

  const sourceMapUrl = retrieveSourceMapURL(source);

  if (sourceMapUrl) {
    const dir = path.dirname(source);
    console.log("dir", dir);
    console.log("source", source);
    const sourceMapPath = path.join(dir, sourceMapUrl);

    if (fs.existsSync(sourceMapPath)) {
      const mapContent = fs.readFileSync(sourceMapPath, "utf-8");
      const map = new SourceMapConsumer(mapContent as any);

      const result = map.originalPositionFor({
        line,
        column,
      });

      return {
        source: path.join(dir, result.source),
        line: result.line,
        column: result.column,
      };
    }
  }

  return null;
};
