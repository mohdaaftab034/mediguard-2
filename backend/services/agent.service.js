import axios from 'axios'
import { fetchImageAsBase64 } from './groq.service.js' // We need to export fetchImageAsBase64 from groq.service.js

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_VISION_MODEL = 'meta-llama/llama-3.2-11b-vision-preview' // Using the current vision model or fallback
const GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile'

export const visionAnalysis = async (imageUrl) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) throw new Error('Groq API key is missing')

  const { base64Data, mimeType } = await fetchImageAsBase64(imageUrl)
  const dataUrl = `data:${mimeType};base64,${base64Data}`

  const prompt = `Analyze this pharmaceutical packaging image for authenticity.
Extract: Brand Name, Generic Name, Batch Number, Manufacturing Date, and Expiry Date.
Check Integrity: Are there any spelling mistakes (e.g., 'Paracetemol' instead of 'Paracetamol')? Is the logo blurry compared to the rest of the text?
Format: Return ONLY a JSON object with the fields extracted_data, visual_anomalies (list), and a confidence_score (0-1). Do not include markdown formatting or extra text.`

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: GROQ_VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    },
    {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 60000
    }
  )

  const text = response?.data?.choices?.[0]?.message?.content || '{}'
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error("Failed to parse JSON from vision model:", text)
    // fallback
    return {
      extracted_data: {},
      visual_anomalies: [],
      confidence_score: 0
    }
  }
}

export const batchVerification = async (medicineName, scannedBatch, scannedExpiry, dbData) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) throw new Error('Groq API key is missing')

  const prompt = `I have scanned a box of ${medicineName || 'Medicine'}.
Scanned Batch ID: ${scannedBatch || 'Unknown'}
Scanned Expiry: ${scannedExpiry || 'Unknown'}
Database Record: ${dbData ? JSON.stringify(dbData) : 'None'}

Evaluate if these match. If the ID exists but the Expiry dates differ, explain that this is a common sign of 'Batch Re-labeling' fraud. Draft a 2-sentence warning for the user.`

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: GROQ_CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    },
    {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }
    }
  )

  return response?.data?.choices?.[0]?.message?.content || ''
}

export const generateReport = async (evidence, location, severity) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) throw new Error('Groq API key is missing')

  const prompt = `Draft an official incident report for the Drug Controller General of India (DCGI) based on a detected counterfeit.
Include:
Evidence: ${evidence}
Location: ${location || 'Unknown'}
Severity: ${severity}

Use a formal, legal tone. Do not include user personal data, only the drug's forensic details.`

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: GROQ_CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1000
    },
    {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }
    }
  )

  return response?.data?.choices?.[0]?.message?.content || ''
}
