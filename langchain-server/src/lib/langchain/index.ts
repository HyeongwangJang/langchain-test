import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf"
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAI } from "langchain/llms/openai"
import { HuggingFaceInference } from "langchain/llms/hf"
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain, loadQARefineChain } from "langchain/chains";

/**
 * Doc loading - embedding - 벡터 스토어 생성 .... 과정을 매번 반복하고 있음.
 * 재사용 가능한 형태로 바꿀 필요...
 */
async function callLangChain(question: string) {
  console.log('Load data...')
  const loader = new DirectoryLoader(
    "public/data",
    {
      ".pdf": (path) => new PDFLoader(path)
    }
  );
  let docs = await loader.load();
  console.log('Doc length...', docs.length);

  console.log("Create embeddings...")
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  console.log("Create vector store...")
  const vectorStore = await FaissStore.fromDocuments(docs, embeddings);

  console.log("Similarity search...");
  docs = await vectorStore.similaritySearch(question)

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
    maxRetries: 1,  // 재시도 횟수. 기본값 7.
  })

  // console.log("Create prompt/query...");
  // const template = ""
  //   + "Hello"
  //   + "{context}"
  //   + "Question: {question}"
  // const prompt = new PromptTemplate({
  //   template: template,
  //   inputVariables: ["context", "question"],
  // });

  console.log("Create chain...");
  // console.log("Use RetrievalQAChain...")
  // const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  console.log("Use loadQARefineChain...")
  const chain = loadQARefineChain(model);

  console.log("Call chain & Send query....")
  const res = await chain.call({
    input_documents: docs,
    question,
  })

  return res;
}

export default callLangChain