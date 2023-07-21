import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf"
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAI } from "langchain/llms/openai"
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain, ConversationalRetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import dotenv from "dotenv";
import PROMPT_TEMPLATE from "./lib/prompt";

(async function() {
  dotenv.config();

  // 0. 질문
  const query1 = "사용량 조회는 어떻게 하나요?"
  const query2 = "데이터를 캐싱할 수 있나요?"
  const query3 = "캐싱 가능한 데이터는 무엇인가요?"
  const query4 = "Maps JavaScript API 버전 3.54에서는 Array.from()이 사용되나요?"

  // 1. 데이터 불러오기
  // csv나 pdf 선택해서 사용
  // 모두 사용 가능
  console.log('Load data...')
  const loader = new DirectoryLoader(
    "static/data",
    {
      ".pdf": (path) => new PDFLoader(path),
      // ".csv": (path) => new CSVLoader(path)
    }
  );
  let docs = await loader.load();

  // 2. Embedding
  console.log("Create embeddings...")
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  // 3. vector db 생성
  console.log("Create vector store...")
  const vectorStore = await FaissStore.fromDocuments(docs, embeddings);

  // 3-1. Similarity search
  // console.log("Similarity search...")
  // docs = await vectorStore.similaritySearch(query3);
  // console.log('docs', docs)

  // 4. 모델 불러오기
  // OpenAI 사용량 한도 설정 후 사용
  console.log("Load model...")
  console.log("Use OpenAI model...")
  const model = new OpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 1,
  })

  // 5. 프롬프트 생성
  console.log("Create prompt");
  const template = PROMPT_TEMPLATE.withDocuments
  const prompt = new PromptTemplate({
    template: template,
    inputVariables: ["context", "question"],
  });

  // 6. 체인 생성
  console.log("Create chain...");
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), { prompt });

  console.log("Send query...");
  const q1 = await chain.call({ query: query1 })
  const q2 = await chain.call({ query: query2 })
  const q3 = await chain.call({ query: query3 })
  const q4 = await chain.call({ query: query4 })

  console.log('[질문1]', query1)
  console.log("[답변1]", q1);
  console.log("----------")
  console.log('[질문2]', query2)
  console.log("[답변2]", q2);
  console.log("----------")
  console.log('[질문3]', query3)
  console.log("[답변3]", q3);
  console.log("----------")
  console.log('[질문4]', query4)
  console.log("[답변4]", q4);
  console.log("----------")
})()