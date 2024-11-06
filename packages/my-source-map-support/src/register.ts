import { mapSourcePosition, retrieveSourceMapURL } from "./utils.js";

Error.prepareStackTrace = (error, stack) => {
  const name = error.name || "Error";
  const message = error.message || "";
  const errorString = name + ": " + message;

  const processedStack = [];

  for (let i = stack.length - 1; i >= 0; i--) {
    processedStack.push("\n    atat " + wrapCallSite(stack[i]));
  }

  return errorString + processedStack.reverse().join("");
};
const wrapCallSite = (frame: NodeJS.CallSite) => {
  const source = frame.getFileName();
  if (source) {
    let position: Record<string, any> | null = {
      source: frame.getFileName(),
      line: frame.getLineNumber(),
      column: frame.getColumnNumber(),
    };
    if (source.startsWith("file:/")) {
      position = mapSourcePosition(
        source,
        frame.getLineNumber()!,
        frame.getColumnNumber()!
      );
    }

    const newFrame: Record<string, any> = {};
    newFrame.getFunctionName = function () {
      return frame.getFunctionName();
    };
    newFrame.getFileName = function () {
      return position?.source;
    };
    newFrame.getLineNumber = function () {
      return position?.line;
    };
    newFrame.getColumnNumber = function () {
      return frame.getColumnNumber();
    };
    newFrame.toString = function () {
      return (
        this.getFunctionName() +
        " (" +
        this.getFileName() +
        ":" +
        this.getLineNumber() +
        ":" +
        this.getColumnNumber() +
        ")"
      );
    };

    return newFrame;
  }
  return frame;
};
