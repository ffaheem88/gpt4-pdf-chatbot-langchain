import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE_VIS,PINECONE_NAME_SPACE_PACRA,PINECONE_NAME_SPACE_MOODYS, PINECONE_NAME_SPACE_ALL } from '@/config/pinecone';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  console.log('question', question);
  console.log('history', history);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  let sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: req.body.namespace || PINECONE_NAME_SPACE_ALL, //namespace comes from your config folder
      },
    );

    //create chain
    const chain = makeChain(vectorStore);
    let historychat = "";
    const pastMessages = history.map((message: string, i: number) => {
      if (i % 2 === 0) {
        historychat += "Human: " + message + "\n";
        return new HumanMessage(message);
      } else {
        historychat += "AI: " + message + "\n";
        return new AIMessage(message);
      }
    });

    //Ask a question using chat history

    sanitizedQuestion += historychat + "Human: " + sanitizedQuestion + "\nAI:";
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: []
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}