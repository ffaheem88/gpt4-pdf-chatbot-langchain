import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE_VIS,PINECONE_NAME_SPACE_PACRA,PINECONE_NAME_SPACE_ALL,PINECONE_NAME_SPACE_MOODYS } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

/* Name of directory to retrieve your files from 
   Make sure to add your PDF files inside the 'docs' folder
*/
const filePath = 'moodyprs';

export const run = async () => {
  try {
    console.log("Getting PDFS...");
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new PDFLoader(path),
      
    });
    console.log("Loading PDFS...");
console.log(directoryLoader);
    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load();
    console.log("Splitting PDFS...");
    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 100,
    });


    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE_ALL,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
