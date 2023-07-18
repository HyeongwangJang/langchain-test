# langchain-test
테스트용. 서버-클라이언트는 server-client 쓰세요.

## 1. 테스트 준비

### 데이터 로딩
```ts
const loader = new DirectoryLoader(
  "static/data",
  {
    ".pdf": (path) => new PDFLoader(path),
    // ".csv": (path) => new CSVLoader(path)
  }
);
let docs = await loader.load();
```

### 임베딩
```ts
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
});
```
### 벡터 db
```ts
const vectorStore = await FaissStore.fromDocuments(docs, embeddings);
```

### 모델 설정
```ts
const model = new OpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.5,
  openAIApiKey: process.env.OPENAI_API_KEY,
  maxRetries: 1,
})
```

### 프롬프트 설정
```ts
// Prompt 1
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

// Prompt 2
const template = ""
  + "You are an AI assistant for answering questions about the Google Maps Platform."
  + "Answer the question in Korean."
  + "And be sure to put '감사합니다' at the end of your answer."
  + "If you don't know the answer, just say '잘 모르겠네요.'. Don't try to make up an answer."
  + "Question: {question}"
const prompt = new PromptTemplate({
  template: template,
  inputVariables: ["context", "question"],
});
```

## 2. 테스트
### 테스트 1-1
테스트 조건
- pdf 데이터
- OpenAI 모델
- 프롬프트1
---
문서 형태 예시
```
Document {
  pageContent: '사\n' +
    '용\n' +
    '량\n' +
    ' \n' +
    '조\n' +
    '회\n' +
    '는\n' +
    ' \n' +
    '어\n' +
    '디\n' +
    '서\n' +
    ' \n' +
    '하\n' +
    '나\n' +
    '요\n' +
    '?\n' +
    '1\n' +
    '사\n' +
    '용\n' +
    '량\n' +
    ' \n' +
    '조\n' +
    '회\n' +
    '는\n' +
    ' \n' +
    '어\n' +
    '디\n' +
    '서\n' +
    ' \n' +
    '하\n' +
    '나\n' +
    '요\n' +
    '?\n' +
    'SPH\n' +
    '에\n' +
    '서\n' +
    '는\n' +
    ' \n' +
    '고\n' +
    '객\n' +
    '분\n' +
    '들\n' +
    '이\n' +
    ' \n' +
    '사\n' +
    '용\n' +
    '량\n' +
    ' \n' +
    '조\n' +
    '회\n' +
    '를\n' +
    ' \n' +
    '간\n' +
    '편\n' +
    '하\n' +
    '게\n' +
    ' \n' +
    '할\n' +
    ' \n' +
    '수\n' +
    ' \n' +
    '있\n' +
    '도\n' +
    '록\n' +
    ' \n' +
    '별\n' +
    '도\n' +
    '의\n' +
    ' \n' +
    '서\n' +
    '비\n' +
    '스\n' +
    '인\n' +
    ' \n' +
    'GMP(Google Maps Platform) Usage Report\n' +
    '를\n' +
    ' \n' +
    '운\n' +
    '영\n' +
    '하\n' +
    '고\n' +
    ' \n' +
    '있\n' +
    '습\n' +
    '니\n' +
    '다\n' +
    '.\n' +
    'GMP Usage Report \n' +
    '도\n' +
    // ... +
    '.',
  metadata: {
    source: 'C:\\hgjang_workspace\\langchain\\langchain-node\\static\\data\\fd0d8989-7126-4147-bf3b-54e31c12322f_사용량_조회는_어디서_하나요.pdf',
    pdf: [Object],
    loc: [Object]
  }
},
```
---
```
// 질문
캐싱 가능한 데이터는 무엇인가요?
// 답변
캐싱 가능한 데이터는 Google Maps Platform의 여러 기능을 통해 제공되는 지도 데이터, 장소 데이터, 경로 데이터 등을 말합니다. 이러한 데이터는 일정 시간 동안 캐시에 저장되어 반복적인 요청에 대한  응답 속도를 향상시키고, 네트워크 부하를 줄일 수 있습니다. 예를 들어, 지도 이미지, 장소 세부 정보, 경로 정보 등이 캐싱 가능한 데이터입니다. 감사합니다.
```

### 테스트 1-2
테스트 조건
- pdf 데이터
- OpenAI 모델
- 프롬프트 2
---
문서 형태: 상동

---
```
// 질문
캐싱 가능한 데이터는 무엇인가요?
// 답변
Google Maps API에서 제공되는 데이터 중 Place ID는 캐싱 가능한 데이터입니다. 하지만 지도 이미지 등은 Google Maps 정책 상 캐싱이 불가합니다. Google Maps API에서 제공되는 각각의 데이터에 대해 캐 싱 가능 여부는 기술 지원 팀에서 ToS(Team of Service) 해석 권한이 없어 명확하게 알기는 어렵습니다. 문의 사항이 있으시면 SPH 메일(helper@sphinfo.co.kr) 또는 포털로 언제든지 문의 부탁드립니다. 감사합니다
```

### 테스트 2-1
테스트 조건
- csv 데이터
- OpenAI 모델
- 프롬프트 1
---
문서 형태 예시
```
docs [
  Document {
    pageContent: 'No: 5\n' +
      'product: Google Maps Platform\n' +
      'category: common\n' +
      'sub_category: common\n' +
      'keywords: qps\n' +
      'related_question: \n' +
      'question: API QPS 상한선 조정은 어떻게 하나요?\n' +
      'answer: QPS 상한선은 API별로 상이합니다.\n' +
      '구글맵을 사용하면서 QPS 초과 에러가 자주 발생한다면 해당 API의 QPS 상한선을 조정해야 합니다.\n' +
      '\n' +

      // ... +

      '\n' +
      '만일 QPS 초과 에러가 일시적으로 발생한 것이고 상한 조정을 신청한 시기에 안정화가 되었다면 구글에서 QPS 상한선 조정을 거부할 수 있습니다. 또한 QPS는 어뷰징 방지를 위한 수단이기 때문에 과도하게 상한선을 늘릴 경우 어뷰징 공격에 취약해지는 점을 꼭 참고하세요.\n' +
      'asked_date: \n' +
      'answer_date: ',
    metadata: {
      source: 'C:\\hgjang_workspace\\langchain\\langchain-node\\static\\data\\qnas.csv',
      line: 5
    }
  },
]
```
---
```
// 질문
캐싱 가능한 데이터는 무엇인가요?
// 답변
캐싱 가능한 데이터에는 지오코딩 결과, 지도 이미지, 루트 및 방향, 거리 행렬, 타임존 정보 등이 포함됩니다. 이러한 데이터는 일정 기간 동안 캐시에 저장되어 다시 요청할 때 서버에 다시 액세스하지 않고 반환될 수 있습니다. 감사합니다.
```

### 테스트 2-2
테스트 조건
- csv 데이터
- OpenAI 모델
- 프롬프트 2
---
문서 형태 예시: 상동

---
```
// 질문
캐싱 가능한 데이터는 무엇인가요?
// 답변
'구글 맵 플랫폼에서 캐싱 가능한 데이터는 다음과 같습니다:\n' +
'- 지도 이미지: 사용자가 이전에 요청한 지도 이미지는 캐시에 저장되어 다음에 동일한 요청이 있을 경우 캐시된 이미지를 반환합니다.\n' +
'- 지오코딩 결과: 이전에 요청한 주소나 장소의 지오코딩 결과는 캐시에 저장되어 다음에 동일한 요청이 있을 경우 캐시된 결과를 반환합니다.\n' +
'- 경로 및 방향 결과: 이전에 요청한 경로 또는 방향 결과는 캐시에 저장되어 다음에 동일한 요청이 있을 경우 캐시된 결과를 반환합니다.\n' +
'\n' +
'캐싱은 네트워크 트래픽을 줄이고 응답 시간을 개선하는데 도움을 줍니다. 그러나 캐싱된 데이터는 일정 기간 동안 유효하며, 만약 데이터가 업데이트되었다면 새로운 요청을 보내야 합니다.\n' +
'\n' +
'감사합니다.'
```

### 3. 결과
1. 문서(pdf, csv 등 여러 형태)를 로드하면 chunk로 나누게 되어있는데, csv로 제공했을 때보다 pdf로 제공했을 때 chunk 

### 4. 챗봇 구현 가능한가?
- 수준을 제하고 봤을 때 구현만을 논한다면 가능
- 답변 생성 방법, 토큰, 청크, 문서 형태 등등의 개념은 쉽게 알기 어려울 듯. 인공지능 개발의 영역으로 들어가야 함