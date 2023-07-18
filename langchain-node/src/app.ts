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
  // HF 모델 무료 사용은 토큰 사이즈 제약으로 에러 발생
  // OpenAI 사용량 한도 설정 후 사용
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

  // 5. 프롬프트 생성
  // 질문 구조화
  // context는 제공한 데이터가 들어감
  console.log("Create prompt");
  const template = ""
    + "You are an AI assistant for answering questions about the Google Maps Platform."
    + "Answer the question in Korean using given context."
    + "And be sure to put '감사합니다' at the end of your answer."
    + "If you don't know the answer, just say '잘 모르겠네요.'. Don't try to make up an answer."
    + "{context}"
    + "Question: {question}"
  const prompt = new PromptTemplate({
    template: template,
    inputVariables: ["context", "question"],
  });

  console.log("Create chain...");
  // const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
  // const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), { prompt });

  console.log("Send query...");
  const q1 = await chain.call({ query: query1 })

  console.log('[질문]', query1)
  console.log("[답변]", q1);
  // console.log("----------")
  // console.log("[query2]", q3);
})()