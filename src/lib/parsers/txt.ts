export function parseTxt(file: File): Promise<string> {
  return file.text()
}
