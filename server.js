// Import required dependencies an
import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  VectorStoreIndex,
  SimpleDirectoryReader,
  RouterQueryEngine,
  OpenAIAgent,
  QueryEngineTool,
  FunctionTool,
} from "llamaindex";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
// Middleware to use JSON body parsing
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    return res.send("Welcome to the Llama Server!");
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred." });
  }
});

// load the API key
const keys = process.env.OPENAI_API_KEY;
if (!keys) {
  throw new Error("No OpenAI API key provided");
}

// Let's create 2 different data sources that answer different types of questions:

// The first is about Zig Jackson - Wikipedia
// The second is the Francis Scott key Bridge collapse

async function initializeIndex() {
  // entertainment doc
  const documents1 = await new SimpleDirectoryReader().loadData({
    directoryPath: "./data/entertainment",
  });
  const index1 = await VectorStoreIndex.fromDocuments(documents1);
  const queryEngine1 = index1.asQueryEngine();

  const documents2 = await new SimpleDirectoryReader().loadData({
    directoryPath: "./data/news",
  });
  const index2 = await VectorStoreIndex.fromDocuments(documents2);
  const queryEngine2 = index2.asQueryEngine();

  const queryEngine = RouterQueryEngine.fromDefaults({
    queryEngineTools: [
      {
        queryEngine: queryEngine1,
        description: "Useful for questions about  Zig Jackson",
      },
      {
        queryEngine: queryEngine2,
        description:
          "Useful for questions about the Francis Scott key Bridge collapse",
      },
    ],
  });

  // How many Francis Scott Key Bridge collapse casualities indian nationals?, what are the casuality nationalities
  //What awards did Zig get?
  return { queryEngine2, queryEngine1, queryEngine };
}

const initializeFunctionTool = async (queryEngine) => {
  // Define a simple function
  function sumNumbers({ a, b }) {
    return a + b;
  }

  // Explain the function in a JSON structure
  const sumJSON = {
    type: "object",
    properties: {
      a: {
        type: "number",
        description: "The first number",
      },
      b: {
        type: "number",
        description: "The second number",
      },
    },
    required: ["a", "b"],
  };

  // Make the new function into a tool
  const sumFunctionTool = new FunctionTool(sumNumbers, {
    name: "sumNumbers",
    description: "Use this function to sum two numbers",
    parameters: sumJSON,
  });

  const documents1Title = "Zig Jackson - Wikipedia";
  const documents2Title = "The Francis Scott key Bridge collapse";

  const name = "zig_jackson_and_francis_scott_key_bridge_collapse";
  const description = `A tool that can answer questions about ${documents1Title} and ${documents2Title}`;

  // Make the router query engine into a tool
  const queryEngineTool = new QueryEngineTool({
    queryEngine: queryEngine,
    metadata: {
      name,
      description,
    },
  });

  return { queryEngineTool, sumFunctionTool };
};

app.post("/query", async (req, res) => {
  try {
    const { queryEngine } = await initializeIndex();
    const { queryEngineTool, sumFunctionTool } = await initializeFunctionTool(
      queryEngine
    );

    const agent = new OpenAIAgent({
      tools: [queryEngineTool, sumFunctionTool],
      verbose: true,
    });
    // Expecting a query in the JSON body
    const query = req.body.query;
    if (!query) {
      return res.status(400).send({ error: "Query not provided" });
    }
    // const response = await queryEngine.query({ query });
    const response = await agent.chat({ message: `${query} Use a tool.` });
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
