// Gemini responseSchema for structured JSON output
// Forces the model to return exactly the shape we need — more reliable than prompt-only
export const ANALYSIS_RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      text: { type: 'STRING' },
      status: {
        type: 'STRING',
        enum: ['SAFE_QUOTE', 'AI_SUSPECT', 'NORMAL'],
      },
      reason: { type: 'STRING' },
    },
    required: ['text', 'status', 'reason'],
  },
}
