import { HfInference } from '@huggingface/inference';
import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { config } from '@/lib/config';

const Hf = new HfInference(config.huggingFace.apiKey);

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Format messages for Llama chat
  const formattedMessages = messages.map((m: any) => 
    `${m.role === 'user' ? 'User: ' : 'Assistant: '}${m.content}`
  ).join('\n');
  
  const prompt = `${formattedMessages}\nAssistant: `;

  const response = await Hf.textGenerationStream({
    model: config.huggingFace.modelId,
    inputs: prompt,
    parameters: {
      max_new_tokens: 1000,
      temperature: 0.7,
      top_p: 0.95,
      repetition_penalty: 1.1,
      stream: true,
      stop: ["User:", "\nUser:", "Assistant:", "\nAssistant:"],
      do_sample: true,
    },
  });

  const stream = HuggingFaceStream(response);
  return new StreamingTextResponse(stream);
} 