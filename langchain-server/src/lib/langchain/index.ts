import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf"
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAI } from "langchain/llms/openai"
import { HuggingFaceInference } from "langchain/llms/hf"
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain, loadQARefineChain } from "langchain/chains";
import PROMPT_TEMPLATE from "../prompt";

/**
 * Doc loading - embedding - 벡터 스토어 생성 .... 과정을 매번 반복하고 있음.
 * 재사용 가능한 형태로 바꿀 필요...
 */
async function callLangChain(question: string) {
  console.log('Load data...')
  const loader = new DirectoryLoader(
    "public/data",
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
  const res = await chain.call({ query: question })

  return res;
}

export default callLangChain