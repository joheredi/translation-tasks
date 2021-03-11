import { createBatchDocumentTranslationVerbFirst as DocumentTranslation } from "@azure/ai-document-translation";
import { config } from "dotenv";

// Load environment variables from .env
config();

const endpoint = process.env["ENDPOINT"] || "";
const key = process.env["API_KEY"] || "";

async function main() {
  // 1. Create a client using Key authentication
  // Note that the creation of the client is a factory function rather than a `new` class
  const client = DocumentTranslation({ key }, endpoint);

  // 2. Get a list of all the formats that DocumentTranslation can translate
  const formats = await client.request("GET /documents/formats");

  // Note: Before this check the type of glosaries can be either of the following
  // GetDocumentFormats200Response | GetDocumentFormats429Response | GetDocumentFormats500Response | GetDocumentFormats503Response
  // After the if block the type is narrowed down to GetGlossaryFormats200Response
  if (formats.status !== 200) {
    throw formats.body.error;
  }

  // 3. Log the formats
  for (const format of formats.body.value) {
    console.log(`${format.format}: ${format.fileExtensions}`);
  }
}

main().catch(console.error);
