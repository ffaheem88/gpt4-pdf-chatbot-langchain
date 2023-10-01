import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE_VIS,PINECONE_NAME_SPACE_PACRA,PINECONE_NAME_SPACE_MOODYS, PINECONE_NAME_SPACE_ALL } from '@/config/pinecone';
import { defer } from "@defer/client"


async function longRunning(sanitizedQuestion: string, history: string[],req: { body: { namespace: any; }; }) {
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
      chat_history: []//pastMessages
    });

    return response;

    console.log('response', response);
  }


  export default longRunning;

