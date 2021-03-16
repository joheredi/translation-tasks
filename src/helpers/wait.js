const { isReturnStatement } = require("typescript");

module.exports = {
  wait: (ms = 30000) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
        isReturnStatement;
      }, ms);
    });
  },
};
