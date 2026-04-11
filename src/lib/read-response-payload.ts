export async function readResponsePayload(res: Response) {
  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return res.json()
  }

  const text = await res.text()
  return text ? { error: text } : {}
}
