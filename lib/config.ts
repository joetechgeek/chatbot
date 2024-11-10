if (!process.env.HUGGING_FACE_API_KEY) {
  throw new Error('Missing HUGGING_FACE_API_KEY environment variable');
}

if (!process.env.HUGGING_FACE_MODEL_ID) {
  throw new Error('Missing HUGGING_FACE_MODEL_ID environment variable');
}

export const config = {
  huggingFace: {
    apiKey: process.env.HUGGING_FACE_API_KEY,
    modelId: process.env.HUGGING_FACE_MODEL_ID,
  },
} as const; 