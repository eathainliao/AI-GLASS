// Stage C: dispatch files to docx/pdf/txt/image parsers
export function useFileParser() {
  return {
    parse: (_files: File[]) => {
      throw new Error('not implemented — Stage C')
    },
  }
}
