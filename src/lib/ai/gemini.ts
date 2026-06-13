const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function groqChat(prompt: string): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Groq API error: ${response.status} - ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

export async function generateRoadmap(skill: string) {
  const prompt = `You are an expert learning roadmap creator. Generate a comprehensive, structured learning roadmap for: "${skill}"

Return ONLY valid JSON (no markdown, no code fences, no extra text) in this exact structure:
{
  "title": "${skill}",
  "description": "Brief description of what this roadmap covers",
  "children": [
    {
      "id": "unique-kebab-case-id",
      "title": "Node Title",
      "description": "Brief description of this topic",
      "children": [],
      "optional": false,
      "choices": []
    }
  ]
}

Rules:
- Create 3-5 main branches (children of root)
- Each branch should have 3-6 sub-nodes
- For nodes with multiple equivalent options (e.g., React vs Vue vs Angular), set optional=true and fill choices=["Option1","Option2","Option3"]
- Use descriptive kebab-case IDs like "html-basics", "css-flexbox", "react-fundamentals"
- Keep descriptions concise (1 sentence)
- Order nodes from beginner to advanced
- Be realistic - only include topics that are genuinely needed
- Ensure the roadmap follows current industry best practices
- Return ONLY the JSON object, nothing else`;

  const text = await groqChat(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse roadmap JSON from AI response");
  }
  return JSON.parse(jsonMatch[0]);
}

export async function generateNodeResources(
  nodeTitle: string,
  nodeDescription: string
) {
  const prompt = `Generate learning resources for: "${nodeTitle}" - ${nodeDescription}

Return ONLY valid JSON (no markdown, no code fences, no extra text) in this exact structure:
{
  "summary": "2-3 sentence explanation of what this topic is and why it matters",
  "theoretical": [
    { "title": "Resource Title", "url": "https://example.com/resource", "type": "article|docs|tutorial" }
  ],
  "practical": [
    { "title": "Video Title", "url": "https://youtube.com/watch?v=xxxxx", "type": "short|long|playlist" }
  ],
  "practice": [
    { "title": "Platform Name", "url": "https://example.com", "type": "exercises|project|challenge" }
  ]
}

Rules:
- Provide exactly 3-4 resources per category
- Use REAL, well-known URLs (MDN, freeCodeCamp, official docs, popular YouTube channels)
- For theoretical: mix official docs, beginner tutorials, and detailed guides
- For practical: 1 short video (~5-15 min), 1 long video (~1hr+), 1 playlist
- For practice: use known platforms like LeetCode, Codecademy, freeCodeCamp, HackerRank
- All URLs must be valid and current
- Return ONLY the JSON object, nothing else`;

  const text = await groqChat(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse resources JSON from AI response");
  }
  return JSON.parse(jsonMatch[0]);
}
