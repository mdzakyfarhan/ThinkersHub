import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeContent(text: string): Promise<{
  summary: string;
  keyFacts: string[];
  sentiment: number;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Analyze the following content and provide a summary, key facts, and sentiment score (1-5). Return JSON in this format: { summary: string, keyFacts: string[], sentiment: number }"
      },
      {
        role: "user",
        content: text
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function matchSolutions(issueDescription: string): Promise<{
  suggestions: Array<{
    title: string;
    description: string;
    confidence: number;
  }>;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Based on the issue description, suggest potential solutions with confidence scores. Return JSON in format: { suggestions: [{ title: string, description: string, confidence: number }] }"
      },
      {
        role: "user",
        content: issueDescription
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}
