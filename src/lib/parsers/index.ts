import type { ParsedInput } from '../../types'
import { parseDocx } from './docx'
import { parsePdf } from './pdf'
import { parseTxt } from './txt'
import { parseImage } from './image'

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'])

// Minimum non-whitespace characters before we consider extraction successful.
const MIN_TEXT_LEN = 5

export async function parseFile(file: File): Promise<ParsedInput> {
  const name = file.name.toLowerCase()

  if (IMAGE_TYPES.has(file.type) || /\.(jpg|jpeg|png|webp|gif|heic)$/.test(name)) {
    const { base64, mimeType } = await parseImage(file)
    return { kind: 'image', base64, mimeType, filename: file.name }
  }

  if (name.endsWith('.docx')) {
    const content = await parseDocx(file)
    if (content.replace(/\s/g, '').length < MIN_TEXT_LEN) {
      throw new Error('DOCX 內容為空或無法擷取文字')
    }
    return { kind: 'text', content, filename: file.name }
  }

  if (name.endsWith('.pdf')) {
    const content = await parsePdf(file)
    if (content.replace(/\s/g, '').length < MIN_TEXT_LEN) {
      throw new Error(
        '此 PDF 沒有文字層（可能是掃描或拍照的圖片 PDF）。請改存成 JPG/PNG 上傳，或匯出含文字的 PDF'
      )
    }
    return { kind: 'text', content, filename: file.name }
  }

  // .txt and anything else — attempt as plain text
  const content = await parseTxt(file)
  if (content.replace(/\s/g, '').length < MIN_TEXT_LEN) {
    throw new Error('檔案內容為空')
  }
  return { kind: 'text', content, filename: file.name }
}
