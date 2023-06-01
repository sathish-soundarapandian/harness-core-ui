export const isValidJson = (jsonString?: string) => {
  if (!jsonString) {
    return false
  }

  try {
    const result = JSON.parse(jsonString)
    if (result) {
      return true
    }
  } catch {
    return false
  }
}

export const getStringifyText = (noDataText: string, data?: string): string => {
  let stringifyResponse = ''

  if (!data) {
    return noDataText
  }

  try {
    stringifyResponse = data ? JSON.stringify(JSON.parse(data), null, 4) : noDataText
  } catch (e) {
    stringifyResponse = data ?? noDataText
  }

  return stringifyResponse
}
