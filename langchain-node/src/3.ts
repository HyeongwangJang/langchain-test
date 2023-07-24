import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer"
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf"
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAI } from "langchain/llms/openai"
import { HuggingFaceInference } from "langchain/llms/hf"
import { PromptTemplate } from "langchain/prompts";
import { LLMChain, RetrievalQAChain } from "langchain/chains";
import dotenv from "dotenv";
import PROMPT_TEMPLATE from "./lib/prompt";

(async function() {
  /**
   * 웹 문서 제공하는 경우
   * Maps JavaScript API 로드하기 문서를 주었을 때
   * query1은 문서와 관련한 질문
   * query2는 문서와 관련없는 GMP 질문
   * query3은 전혀 상관없는 질문
   */
  /**
   * 웹 문서 제공하는 경우 테스트 하려 했으나 퍼펫티어 에러로 문서 제공 없이 기존 학습된 자료로 QA 진행 테스트
   */
  dotenv.config();

  // 0. 질문
  const query1 = "사용량 조회는 어떻게 하나요?"
  const query2 = "데이터를 캐싱할 수 있나요?"
  const query3 = "캐싱 가능한 데이터는 무엇인가요?"
  const query4 = "Maps JavaScript API 버전 3.54에서는 Array.from()이 사용되나요?"
  // const query5 = "Maps JavaScript API는 어떻게 로드할 수 있나요?"
  // const query6 = "지도에 마커를 추가하고 싶어요."
  // const query7 = "오해원이 누구인가요?"

  // 1. 모델 불러오기
  // OpenAI 사용량 한도 설정 후 사용
  console.log("Load model...")
  console.log("Use OpenAI model...")
  const model = new OpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 1,
  })

  // 2. 프롬프트 생성
  console.log("Create prompt");
  const template = PROMPT_TEMPLATE.withoutDocuments;
  const prompt = new PromptTemplate({
    template: template,
    inputVariables: ["question"],
  });

  // 3. 체인 생성
  console.log("Create chain...");
  const chain = new LLMChain({ llm: model, prompt });

  // 4. 질문
  console.log("Send query...");
  const q1 = await chain.call({ question: query1 })
  const q2 = await chain.call({ question: query2 })
  const q3 = await chain.call({ question: query3 })
  const q4 = await chain.call({ question: query4 })
  // const q5 = await chain.call({ question: query5 })

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
  // console.log('[질문5]', query5)
  // console.log("[답변5]", q5);
  console.log("----------")
})()