import "dotenv/config";
import express from "express";
import cors from "cors";
import { Document, VectorStoreIndex, SimpleDirectoryReader } from "llamaindex";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
// Middleware to use JSON body parsing
app.use(express.json());
const keys = process.env.OPENAI_API_KEY;
if (!keys) {
  throw new Error("No OpenAI API key provided");
}
async function initializeIndex() {
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: "./data",
  });
  return await VectorStoreIndex.fromDocuments(documents);
}

app.post("/query", async (req, res) => {
  try {
    const index = await initializeIndex();
    const queryEngine = index.asQueryEngine();
    // Expecting a query in the JSON body
    const query = req.body.query;
    if (!query) {
      return res.status(400).send({ error: "Query not provided" });
    }
    const response = await queryEngine.query({ query });
    res.send({ response: response.toString() });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "An error occurred while processing the query." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
