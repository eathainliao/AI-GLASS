// Gemini responseSchema for structured JSON output
// Forces the model to return exactly the shape we need — more reliable than prompt-only.
// verdict 在前：先形成整體印象，再逐句標記，補足逐句判定漏掉的整體訊號。
export const ANALYSIS_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    verdict: {
      type: 'OBJECT',
      properties: {
        aiLikelihood: {
          type: 'STRING',
          enum: ['HIGH', 'MEDIUM', 'LOW'],
        },
        summary: { type: 'STRING' },
      },
      required: ['aiLikelihood', 'summary'],
    },
    sentences: {
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
    },
  },
  required: ['verdict', 'sentences'],
}
