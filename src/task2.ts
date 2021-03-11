import { createBatchDocumentTranslationPathFirst as DocumentTranslation } from "@azure/ai-document-translation";
import { config } from "dotenv";

// Load environment variables from .env
config();

const endpoint = process.env["ENDPOINT"] || "";
const key = process.env["API_KEY"] || "";

async function main() {
  // 1. Create a client using Key authentication
  // Note that the creation of the client is a factory function rather than a `new` class
  const client = DocumentTranslation({ key }, endpoint);

  // 2. Get a list of the formats supported for glosary
  const glosaries = await client.path("/glossaries/formats").get();

  // Note: Before this check the type of glosaries can be either of the following
  // GetGlossaryFormats200Response | GetGlossaryFormats429Response | GetGlossaryFormats500Response | GetGlossaryFormats503Response
  // After the if block the type is narrowed down to GetGlossaryFormats200Response
  if (glosaries.status !== 200) {
    throw glosaries.body.error;
  }

  // 3. Log the formats
  for (const format of glosaries.body.value) {
    console.log(`${format.format}: ${format.fileExtensions}`);
  }
}

main().catch(console.error);
