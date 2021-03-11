export function extractBatchId(batchUrl: string = "") {
  const parts = batchUrl.split("/");

  return parts[parts.length - 1];
}
