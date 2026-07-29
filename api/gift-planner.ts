import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  }

  if (req.method === 'OPTIONS') {
    if (res.status) {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    if (res.status) {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    let data = req.body;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) {}
    }
    if (!data || typeof data !== 'object') {
      data = {};
    }

    const { age, relationship, budget, interests, occasion, style } = data;

    if (!age || !relationship || !budget || !interests) {
      const errorMsg = 'Missing required fields: age, relationship, budget, interests';
      if (res.status) {
        return res.status(400).json({ error: errorMsg });
      }
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: errorMsg }));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const errorMsg = 'GEMINI_API_KEY environment variable is missing on Vercel. Please set GEMINI_API_KEY in your Vercel Project Settings -> Environment Variables.';
      if (res.status) {
        return res.status(500).json({ error: errorMsg });
      }
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: errorMsg }));
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are an expert personalized gift planner AI. Recommend thoughtful, specific, and creative gift ideas based on the following recipient details:
- Recipient Age: ${age}
- Relationship: ${relationship}
- Budget: ₹${budget} (in Indian Rupees, INR)
- Interests / Hobbies: ${interests}
${occasion ? `- Occasion: ${occasion}` : ''}
${style ? `- Gift Style/Vibe: ${style}` : ''}

Provide a well-structured response with:
1. Top 4-5 curated gift recommendations. For each gift, include:
   - **Gift Name**: Clear specific product or experience name
   - **Estimated Price**: Approx cost in ₹ (INR, within budget)
   - **Why It's Perfect**: Concise explanation matching their interests
   - **Where to Find / Key Feature**: Quick tip on sourcing or customizing in India
2. Practical presentation or personalization ideas.
3. Creative experience or DIY alternative.

Format the response clearly using clean Markdown formatting with headings (###), bullet points, and **bold text**.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    if (res.status) {
      return res.status(200).json({ result: response.text });
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ result: response.text }));
  } catch (err: any) {
    console.error('API Error:', err);
    const errorMsg = err.message || 'Failed to generate gift recommendations';
    if (res.status) {
      return res.status(500).json({ error: errorMsg });
    }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: errorMsg }));
  }
}
