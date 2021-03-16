import { createBatchDocumentTranslationPathFirst } from "@azure/ai-document-translation";
import { config } from "dotenv";

// Load environment variables from .env
config();

const endpoint = process.env["ENDPOINT"] || "";
const key = process.env["API_KEY"] || "";

async function main() {
  // 1. Create a client using Key authentication
  // [REMOVE] Note that the creation of the client is a factory function rather than a `new` class
  const client = createBatchDocumentTranslationPathFirst(endpoint, { key });

  // 2. Get a list of the formats supported for glosary
  const glosaries = await client.path("/glossaries/formats").get();

  // [REMOVE] Note: Before this check the type of glosaries can be either of the following
  // [REMOVE] GetGlossaryFormats200Response | GetGlossaryFormats429Response | GetGlossaryFormats500Response | GetGlossaryFormats503Response
  // [REMOVE] After the if block the type is narrowed down to GetGlossaryFormats200Response
  if (glosaries.status !== 200) {
    throw glosaries.body.error;
  }

  // 3. Log the formats
  for (const format of glosaries.body.value) {
    console.log(`${format.format}: ${format.fileExtensions}`);
  }
}

main().catch(console.error);
