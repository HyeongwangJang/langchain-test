import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

function App() {
  
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState<any[]>([])

  async function handleButton() {
    const params = {
      question: question,
    }
    const res = await axios.post('http://localhost:8080/chat', params);
    setHistory([
      ...history,
      {
        question: question,
        answer: res.data.text,
      }
    ])
  }

  return (
    <div>
      <h1>LangChain Test</h1>
      <div>
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <input type="button" value='전송' onClick={handleButton} />
      </div>

      <ul>
        {history.map((history, i) => (
          <li key={i}>
            <span>질문: {history.question}</span>
            <br />
            <span>대답: {history.answer}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
