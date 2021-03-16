module.exports = {
  extractBatchId,
};

function extractBatchId(batchUrl = "") {
  const parts = batchUrl.split("/");

  return parts[parts.length - 1];
}
