# langchain-test

## Requirements
- Node.js (ESM and CommonJS) - 18.x, 19.x, 20.x
- .env
- api keys
  - HuggingFaceHub
  - OpenAI

Check more here: https://js.langchain.com/docs/getting-started/install#supported-environments

## 사용방법
```
npm install
npm run dev
```

## OpenAI
OpenAI 모델 사용 시, openai api 결제수단 등록해야 함. 무료 사용량이 있다는 말이 있는 것 같은데, 정확히 확인 안 됨.
비용은 사용한 모델과 토큰 갯수로 정해지는데, api 몇 번 날려도 비용이 1달러가 안 넘었음.
하지만 인풋 데이터가 많아지면 확실히 비용이 많아짐.

대략적인 비용 예시임
```
# case 1
data 갯수: pdf 4장
쿼리 횟수: 5~10회 사이 추정
비용: 0.01 달러

# case 2
data 갯수: pdf 7장
쿼리 횟수: 4~5회 추정
비용: 0.03 달러
```
openai api pricing: https://openai.com/pricing

## Token
HugginFace(hf) 모델을 사용 시(ex. google/flan-t5-xxl) 토큰 갯수 때문에 계속 실패함
혹은 모델의 사이즈가 너무 커서 무료 플랜에서 사용 불가능
openai의 모델을 사용할 경우 토큰 갯수 때문에 실패하는 일은 없음.
중요한 건 토큰이 정확히 뭘 의미하는지 모르겠음. **토큰 갯수를 측정하는 방법을 찾지 못함.**

분명한 것은 다음과 같음.
- 모델마다 허용하는 토큰 갯수가 다르다.
- 한글은 영어보다 토큰 갯수에서 불리하다.

## Data
인풋 데이터. 모델에게 참고자료로 줄 데이터들.

## Embedding
문자를 숫자로 변환하는 것

## Vector Store

## Model(LLM)

## Prompt
프롬프트 엔지니어링

## Chain