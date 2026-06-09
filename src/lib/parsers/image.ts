export function parseImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // dataUrl format: "data:<mimeType>;base64,<data>"
      const [header, data] = dataUrl.split(',')
      const mimeType = header.replace('data:', '').replace(';base64', '')
      resolve({ base64: data, mimeType })
    }
    reader.onerror = () => reject(new Error(`Failed to read image: ${file.name}`))
    reader.readAsDataURL(file)
  })
}
