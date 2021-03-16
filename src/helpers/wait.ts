const { isReturnStatement } = require("typescript");

export const wait = (ms: number = 5000) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
      isReturnStatement;
    }, ms);
  });
};
