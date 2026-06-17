import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/actions/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const OCR_PROMPT = `
You are an expert OCR receipt parser. Your job is to extract data from the provided receipt image.
Extract the following information and return ONLY a valid JSON object. Do not include any markdown formatting like \`\`\`json or \`\`\`.

Expected JSON schema:
{
  "amount": <number>, // The total final amount on the receipt. Do not include currency symbols. Null if not found.
  "merchant": <string>, // The name of the store or merchant. Null if not found.
  "description": <string>, // A very brief summary (e.g. "Groceries", "Uber ride", "Coffee"). Null if not found.
  "date": <string> // Date of the receipt in YYYY-MM-DD format. Null if not found.
}
`

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { imageBase64 } = await req.json()
    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.2-11b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: OCR_PROMPT },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    })

    const rawContent = response.choices[0]?.message?.content || '{}'
    
    // Clean up any potential markdown tags
    const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    let parsed
    try {
      // In case there is conversational text before/after JSON, extract the JSON block
      const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned)
    } catch (_e) {
      console.error('Failed to parse Groq response:', cleaned)
      throw new Error('Invalid JSON response from AI')
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (err: unknown) {
    console.error('[/api/ai/ocr]', err)
    return NextResponse.json({ error: (err as Error).message || 'OCR failed' }, { status: 500 })
  }
}
