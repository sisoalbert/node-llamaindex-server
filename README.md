![](https://cdn-images-1.medium.com/max/1600/1*jMgxgS6AVUP2XgIgbpSLqw.png)

### Creating a Simple Llama Index Node.js server

Creating a Node.js server to handle text queries the `llamaindex ts`library. This step-by-step tutorial will guide you through setting up an Express server that utilizes this library along with CORS (Cross-Origin Resource Sharing) support. The server will respond to POST requests with text queries and utilize a set of documents to return a relevant response.

### Prerequisites

- Ensure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).
- Basic knowledge of JavaScript and Node.js.
- An IDE or text editor of your choice (e.g., VSCode, Sublime Text).

### Step 1: Initialize Your Project

Open your terminal or command prompt.

Create a new directory for your project and navigate into it:

- `mkdir my-query-server cd my-query-server`

Initialize a new Node.js project:

- `npm init -y`

Add `“type”: “module”` to the package.json so we can use ES6 Import statements

Install the required dependencies:

`npm install express cors dotenv _llamaindex_`

### Step 2: Create Your Server File

1.  In your project directory, create a file named `server.js`.
2.  Open `server.js` in your IDE or text editor.

### Step 3: Set Up Your Server

Copy the following code into your `server.js` file. This is your starting point, including importing necessary modules and setting up a basic server structure.

```js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { Document, VectorStoreIndex, SimpleDirectoryReader } from "llamaindex";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
// Middleware to use JSON body parsing
app.use(express.json());
```

Remember to create an openAI account.

- Log into OpenAI to get our keys.
- Enter or create your account, and then go to the [OpenAI key creation page](https://platform.openai.com/account/api-keys) and create a key.
- Copy the key
- Create a file in the main folder of the project called “.env” (note the dot at the beginning of the file name) and insert the text there:

`OPENAI_API_KEY=your_key`

Instead of “your_key,” enter the key you copied from OpenAI and save the file. Then add the following code

```js
...
const keys = process.env.OPENAI_API_KEY;
if (!keys) {
 throw new Error("No OpenAI API key provided");
}
...
```

### Step 4: Initialize the Index

Add the asynchronous function `initializeIndex` to load and index your documents. This assumes you have a directory `./data` with your documents.

```js
async function initializeIndex() {
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: "./data",
  });
  return await VectorStoreIndex.fromDocuments(documents);
}
```

### Step 5: Create a Route to Handle Queries

Extend your `server.js` by adding a POST route that will process the queries.

```js
app.post("/query", async (req, res) => {
  try {
    const index = await initializeIndex();
    const queryEngine = index.asQueryEngine();
    const query = req.body.query; // Expecting a query in the JSON body
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
```

### Step 6: Start Your Server

Finalize your `server.js` by adding the code to start the Express server.

```js
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### Step 7: Running Your Server

In your terminal, run the server with the following command:

- `node server.js`

Your server is now running on `http://localhost:3000` (or another port if you’ve configured it differently).

### Step 8: Testing Your Server

To test your server, you can use a tool like Postman or a simple `curl` command in the terminal:

`curl -X POST http://localhost:3000/query -H "Content-Type: application/json" -d "{\"query\":\"What did the author do in college?\"}"`

Postman:

URL POST: `[http://localhost:3000/query](http://localhost:3000/query) `. Body: JSON `{ “query”: “What did the author do in college?” }`

### Conclusion

You’ve now created a basic server capable of handling text queries against a set of documents, utilizing the Express framework and handling CORS requests. This setup is quite flexible and can be adapted to various applications, such as a search engine or a FAQ bot.

Application:

![](https://cdn-images-1.medium.com/max/1600/1*nT_9s_j0MZOWYxrf5D6TqQ.png)

Here is a simple react web app using this server to answer questions based on the doc in the server.
