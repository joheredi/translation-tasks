const { isReturnStatement } = require("typescript");

module.exports = {
  wait: (ms = 5000) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
        isReturnStatement;
      }, ms);
    });
  },
};
