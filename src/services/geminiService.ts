import type { DisasterType, PriorityLabel } from '../types/report'
import {
  calculatePriorityScore,
  getPriorityLabel,
  inferDisasterType,
  buildRecommendation,
  buildPriorityExplanation,
} from '../utils/reportUtils'

const extractPeopleCount = (text: string): number => {
  if (!text) return 1;

  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
};

/* ─── Types ─── */
export interface GeminiAnalysisResult {
  priorityScore: number
  priorityLabel: PriorityLabel
  disasterType: DisasterType
  recommendedAction: string
  priorityExplanation: string
  peopleAffected: number
}

/* ─── Gemini API Config ─── */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

/* ─── Prompt ─── */
const buildPrompt = (
  message: string,
  location: string,
  disasterType: string,
  peopleAffected: number,
  language: string,
): string => `
You are an expert disaster response AI triage system. Analyze this distress report carefully and return a severity assessment.

DISTRESS REPORT:
- Description: "${message}"
- Location: "${location}"
- Reported disaster type: "${disasterType}"
- People affected (user reported): ${peopleAffected}

INSTRUCTIONS:
1. Assign a priority score from 0 to 100 based on the criticality of the situation.
   - Consider: immediate danger to life, number of people, vulnerability (children, elderly),
     infrastructure damage, accessibility, and escalation potential.
2. Assign a priority label based on the score:
   - "Critical" = 85-100 (life-threatening, immediate action needed)
   - "High" = 65-84 (serious danger, urgent response)
   - "Medium" = 50-64 (moderate risk, response needed)
   - "Low" = 0-49 (minor situation, monitoring needed)
3. Determine the actual disaster type from ONLY these options: Flood, Fire, Earthquake, Storm, Landslide, Medical.
4. ESTIMATE the number of people affected from the description.
   - If the user mentions numbers (e.g. "18 residents", "family of 5", "about 30 people"), extract that number.
   - If no number is mentioned, estimate based on context (e.g. "apartment building" = ~20, "single house" = ~4).
   - Minimum value: 1.
5. Provide a recommended emergency response action (1-2 sentences).
6. Provide a brief explanation of why you assigned this score (1-2 sentences).
7. IMPORTANT: Write the "recommendedAction" and "priorityExplanation" fields natively in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}, but strictly keep all JSON keys and the "priorityLabel" / "disasterType" as exact English strings.

RESPOND WITH ONLY THIS JSON — no markdown, no code fences, no extra text:
{
  "priorityScore": <number 0-100>,
  "priorityLabel": "<Critical|High|Medium|Low>",
  "disasterType": "<Flood|Fire|Earthquake|Storm|Landslide|Medical>",
  "peopleAffected": <number>,
  "recommendedAction": "<string>",
  "priorityExplanation": "<string>"
}
`

/* ─── Parse + Validate ─── */
const VALID_LABELS = new Set<string>(['Critical', 'High', 'Medium', 'Low'])
const VALID_TYPES = new Set<string>(['Flood', 'Fire', 'Earthquake', 'Storm', 'Landslide', 'Medical'])

function parseGeminiResponse(raw: string): GeminiAnalysisResult | null {
  try {
    // Strip code fences if present
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()

    console.log('[GeminiService] 🔍 Parsing cleaned response:', cleaned)

    const data = JSON.parse(cleaned)

    const score = Number(data.priorityScore)
    if (Number.isNaN(score) || score < 0 || score > 100) {
      console.error('[GeminiService] ❌ Invalid priorityScore:', data.priorityScore)
      return null
    }
    if (!VALID_LABELS.has(data.priorityLabel)) {
      console.error('[GeminiService] ❌ Invalid priorityLabel:', data.priorityLabel)
      return null
    }
    if (!VALID_TYPES.has(data.disasterType)) {
      console.error('[GeminiService] ❌ Invalid disasterType:', data.disasterType)
      return null
    }
    if (typeof data.recommendedAction !== 'string') {
      console.error('[GeminiService] ❌ Invalid recommendedAction:', data.recommendedAction)
      return null
    }
    if (typeof data.priorityExplanation !== 'string') {
      console.error('[GeminiService] ❌ Invalid priorityExplanation:', data.priorityExplanation)
      return null
    }

    const people = Number(data.peopleAffected)
    const validPeople = Number.isNaN(people) || people < 1 ? 1 : Math.round(people)

    return {
      priorityScore: Math.round(score),
      priorityLabel: data.priorityLabel as PriorityLabel,
      disasterType: data.disasterType as DisasterType,
      peopleAffected: validPeople,
      recommendedAction: data.recommendedAction,
      priorityExplanation: data.priorityExplanation,
    }
  } catch (err) {
    console.warn('[GeminiService] ❌ Failed to parse response:', raw, err)
    return null
  }
}

/* ─── Fallback (old formula) ─── */
function fallbackAnalysis(
  message: string,
  peopleAffected: number,
): GeminiAnalysisResult {
  console.log('[GeminiService] ⚠️ Using FALLBACK formula (no Gemini API)')
  console.log('[GeminiService] ⚠️ Input message:', message)
  console.log('[GeminiService] ⚠️ Input peopleAffected:', peopleAffected)

  const disasterType = inferDisasterType(message)
  const priorityScore = calculatePriorityScore(message, peopleAffected, disasterType)
  const priorityLabel = getPriorityLabel(priorityScore)

  const result = {
    priorityScore,
    priorityLabel,
    disasterType,
    peopleAffected,
    recommendedAction: buildRecommendation(disasterType, priorityLabel),
    priorityExplanation: buildPriorityExplanation(priorityScore, peopleAffected, disasterType, message),
  }

  console.log('[GeminiService] ⚠️ Fallback result:', JSON.stringify(result, null, 2))
  return result
}

/* ─── Main API Call ─── */
export async function analyzeDisasterReport(
  message: string,
  location: string,
  disasterType: string,
  peopleAffectedInput?: number,
  language: string = 'en'
): Promise<GeminiAnalysisResult>{
   let peopleAffected = peopleAffectedInput ?? 1
  console.log('\n╔══════════════════════════════════════════════════════╗')
  console.log('║        🤖 GEMINI AI SEVERITY ANALYSIS START         ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('[GeminiService] 📝 Input message:', message)
  console.log('[GeminiService] 📍 Location:', location)
  console.log('[GeminiService] 🔥 Disaster type:', disasterType)
  console.log('[GeminiService] 👥 People affected (user input):', peopleAffected)
  // ✅ FIX: Extract correct people count from message
const extractedPeople = extractPeopleCount(message);

// Override wrong input (like 1)
peopleAffected =
  !peopleAffected || peopleAffected === 1
    ? extractedPeople
    : peopleAffected;

console.log('[GeminiService] ✅ Final peopleAffected used:', peopleAffected);

  // If no API key, fall back to formula
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('[GeminiService] ⚠️ No API key configured — using fallback formula')
    console.warn('[GeminiService] ⚠️ Set VITE_GEMINI_API_KEY in .env to enable AI scoring')
    return fallbackAnalysis(message, peopleAffected)
  }

  const prompt = buildPrompt(message, location, disasterType, peopleAffected, language)

  console.log('[GeminiService] 📤 Sending request to Gemini API...')
  console.log('[GeminiService] 📤 API URL:', GEMINI_API_URL)
  console.log('[GeminiService] 📤 Prompt:\n', prompt)

  try {
    const startTime = performance.now()

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512,
        },
      }),
    })

    const elapsed = Math.round(performance.now() - startTime)
    console.log(`[GeminiService] ⏱️ API response received in ${elapsed}ms`)
    console.log(`[GeminiService] 📥 Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[GeminiService] ❌ API error:', response.status, errorText)
      console.warn('[GeminiService] ⚠️ Falling back to formula')
      return fallbackAnalysis(message, peopleAffected)
    }

    const data = await response.json()

    // Extract text from Gemini response
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) {
      console.error('[GeminiService] ❌ No text in API response:', JSON.stringify(data, null, 2))
      return fallbackAnalysis(message, peopleAffected)
    }

    console.log('[GeminiService] 📥 Raw AI response:', rawText)

    const parsed = parseGeminiResponse(rawText)
    if (!parsed) {
      console.error('[GeminiService] ❌ Failed to parse valid result')
      return fallbackAnalysis(message, peopleAffected)
    }

    console.log('\n╔══════════════════════════════════════════════════════╗')
    console.log('║         ✅ GEMINI AI ANALYSIS COMPLETE               ║')
    console.log('╚══════════════════════════════════════════════════════╝')
    console.log('[GeminiService] 🎯 Priority Score:', parsed.priorityScore, '/ 100')
    console.log('[GeminiService] 🏷️  Priority Label:', parsed.priorityLabel)
    console.log('[GeminiService] 🔥 Disaster Type:', parsed.disasterType)
    console.log('[GeminiService] 👥 People Affected (AI estimated):', parsed.peopleAffected)
    console.log('[GeminiService] 🚑 Recommended Action:', parsed.recommendedAction)
    console.log('[GeminiService] 📊 Explanation:', parsed.priorityExplanation)
    console.log('[GeminiService] ⏱️  Total time:', elapsed, 'ms')

    return parsed

  } catch (err) {
    console.error('[GeminiService] ❌ Network/fetch error:', err)
    console.warn('[GeminiService] ⚠️ Falling back to formula')
    return fallbackAnalysis(message, peopleAffected)
  }
}

/* ─── Chatbot API Call ─── */
const getLanguageName = (code: string): string => {
  switch (code) {
    case 'hi': return 'Hindi'
    case 'bn': return 'Bengali'
    default:   return 'English'
  }
}

const CHATBOT_SYSTEM_PROMPT = (language: string) => `
You are a friendly and knowledgeable Disaster Safety Assistant for the ResQAI platform.

YOUR ROLE:
- Help citizens with disaster preparedness, safety precautions, and emergency guidance.
- Cover earthquakes, floods, fires, cyclones, landslides, and medical emergencies.

RESPONSE RULES:
1. Keep answers short, clear, and easy to understand for common people.
2. Use numbered steps when giving instructions.
3. If the user asks about a specific disaster, structure your answer into:
   **Before** — preparation steps
   **During** — immediate actions
   **After** — recovery steps
4. If the user asks for emergency numbers, provide India's key numbers:
   - Police: 100
   - Fire: 101
   - Ambulance: 102
   - Disaster Management: 108
   - National Emergency: 112
   - Women Helpline: 1091
5. If the user asks a general question, give a concise helpful answer related to safety.
6. ALWAYS respond in ${getLanguageName(language)}.
7. Do NOT use markdown code fences. Use plain text with numbered lists and bold markers like **Before**, **During**, **After**.
8. Be empathetic and reassuring in your tone.
`

export async function chatWithDisasterAI(
  userMessage: string,
  language: string = 'en'
): Promise<string> {
  console.log('[GeminiChat] 💬 User message:', userMessage)
  console.log('[GeminiChat] 🌐 Language:', language)

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('[GeminiChat] ⚠️ No API key configured')
    return 'I am currently unavailable. Please check back later or call the emergency helpline at 112.'
  }

  const systemPrompt = CHATBOT_SYSTEM_PROMPT(language)

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser question: ${userMessage}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[GeminiChat] ❌ API error:', response.status, errorText)
      return 'Sorry, I encountered an error. Please try again in a moment.'
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error('[GeminiChat] ❌ No text in response')
      return 'Sorry, I could not generate a response. Please try again.'
    }

    console.log('[GeminiChat] ✅ AI response received')
    return text.trim()

  } catch (err) {
    console.error('[GeminiChat] ❌ Network error:', err)
    return 'Sorry, there was a connection error. Please check your internet and try again.'
  }
}