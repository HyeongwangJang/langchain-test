import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf"
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAI } from "langchain/llms/openai"
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain } from "langchain/chains";
import dotenv from "dotenv";

(async function() {
  dotenv.config();

  console.log('Load data...')
  const loader = new DirectoryLoader(
    "static/data",
    {
      ".pdf": (path) => new PDFLoader(path)
    }
  );
  let docs = await loader.load();
  console.log(docs.length);

  console.log("Create embeddings...")
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  console.log("Create vector store...")
  const vectorStore = await FaissStore.fromDocuments(docs, embeddings);

  console.log("Similarity search...")
  docs = await vectorStore.similaritySearch("사용량 조회를 할 수 있나요?");

  console.log("Load model...")
  // console.log("Use HF model...")
  // const model = new HuggingFaceInference({
  //   model: "google/flan-t5-xxl",
  //   apiKey: process.env.HUGGINGFACE_API_KEY,
  //   temperature: 0.5,
  //   maxRetries: 1,
  // });
  console.log("Use OpenAI model...")
  const model = new OpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 1,
  })

  console.log("Create prompt/query...");
  const template = ""
    + "Hello"
    + "{context}"
    + "Question: {question}"
  const prompt = new PromptTemplate({
    template: template,
    inputVariables: ["context", "question"],
  });

  console.log("Create chain...");
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
  // const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
  // const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), { prompt });

  console.log("Send prompt/query...");
  const q1 = await chain.call({ query: "사용량 조회를 할 수 있나요?" })
  const q2 = await chain.call({ query: "데이터를 캐싱할 수 있나요?" })
  // const res = await chain.run(docs);

  console.log("[query1]", q1);
  console.log("----------")
  console.log("[query2]", q2);
})()