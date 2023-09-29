/**
 * Change the namespace to the namespace on Pinecone you'd like to store your embeddings.
 */


console.log(process.env.PINECONE_INDEX_NAME);
// if (!process.env.PINECONE_INDEX_NAME) {
//   throw new Error('Missing Pinecone index name in .env file');
// }

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

const PINECONE_NAME_SPACE_VIS = 'visdocs'; //namespace is optional for your vectors
const PINECONE_NAME_SPACE_PACRA = 'pacradocs';
const PINECONE_NAME_SPACE_MOODYS = 'moodysdocs';
const PINECONE_NAME_SPACE_ALL = 'alldocs';
export { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE_PACRA,PINECONE_NAME_SPACE_VIS,PINECONE_NAME_SPACE_ALL,PINECONE_NAME_SPACE_MOODYS };
