import express from "express";

import { RetrievalQAChain } from "langchain/chains";
import callLangChain from "../lib/langchain";

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('GET /')
});

router.post('/chat', async (req, res, next) => {
  const { question } = req.body

  const answer = await callLangChain(question);

  console.log('answer::', answer);
  
  res.json(answer);
})

module.exports = router;
