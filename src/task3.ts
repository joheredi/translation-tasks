import {
  BatchSubmissionRequest,
  createBatchDocumentTranslationPathFirst as DocumentTranslation,
  clearTargetStorageContainer,
} from "@azure/ai-document-translation";
import { config } from "dotenv";
import { extractBatchId } from "./helpers/extractBatchId";

// Load environment variables from .env
config();

const endpoint = process.env["ENDPOINT"] || "";
const key = process.env["API_KEY"] || "<API KEY>";
const sourceUrl = process.env["SOURCE_CONTAINER"] || "";
const targetUrl = process.env["TARGET_CONTAINER"] || "";

async function main() {
  // Make sure that the target container is empty
  await clearTargetStorageContainer(targetUrl);

  const terminalStates = [
    "Succeeded",
    "Failed",
    "Cancelled",
    "ValidationFailed",
  ];

  // This is the batch request object that describes the source storage container
  // and the translation target
  const translationInput: BatchSubmissionRequest = {
    inputs: [
      {
        source: {
          sourceUrl,
        },
        targets: [{ targetUrl, language: "es", storageSource: "AzureBlob" }],
      },
    ],
  };

  // 1. Create a client using Key authentication
  // Note that users can choose to create a root client or provide a path to get a subclient
  // for example since we are cocnerned about batch we are creating a subclient for batch that we will
  // use through the task.
  const batchClient = DocumentTranslation({ key }, endpoint).path("/batches");

  // 2. Submit the translate batch job
  const batch = await batchClient.post({ body: translationInput });

  // Note: Before this check the type of glosaries can be either of the following
  // SubmitBatchRequest202Response | SubmitBatchRequest400Response | SubmitBatchRequest401Response | SubmitBatchRequest429Response | SubmitBatchRequest500Response | SubmitBatchRequest503Response
  // After the if block the type is narrowed down to SubmitBatchRequest202Response
  if (batch.status !== 202) {
    throw (
      batch.body.error ||
      new Error(
        `Failed to submit the translation batch ${JSON.stringify(batch)}`
      )
    );
  }

  // Translator batch jobs are long running operations, when the response has a 202 status it means that
  // the translation has been started. The response has a header "operation-location" that has a URL to check
  // the status of the operation. extractBatchId extracts the id from the operation-location value. The value could also
  // be used alternatively with client.pathUnchecked(batch.headers["operation-location"]).get()
  const batchJobId = extractBatchId(batch.headers["operation-location"]);
  const batchProgress = batchClient.subClient("/:id", batchJobId);

  // 3. Keep querying the job status until we get a terminal state i.e Succeeded or Failed
  let progress;
  do {
    progress = await batchProgress.get();

    if (progress.status !== 200) {
      throw (
        progress.body.error ||
        new Error(
          `Failed to submit the translation batch ${JSON.stringify(progress)}`
        )
      );
    }
  } while (!terminalStates.includes(progress.body.status));

  // Check if the terminal state was Success otherwise throw an error
  if (progress.body.status !== "Succeeded") {
    throw (
      progress.body.error ||
      new Error(`Translate batch failed\n ${JSON.stringify(progress)}`)
    );
  }

  // 4. Get the list of documents in the translated batch
  const translatedDocuments = await batchClient
    .subClient(
      "/:id/documents",
      progress.body.id // Progress contains the id for the translated batch
    )
    .get();

  if (translatedDocuments.status !== 200) {
    throw (
      translatedDocuments.body.error ||
      new Error(
        `Failed to list the translation batch documents ${JSON.stringify(
          translatedDocuments
        )}`
      )
    );
  }

  // 5. Log the document information
  for (const document of translatedDocuments.body.value) {
    console.log(document);
  }
}

main().catch(console.error);
