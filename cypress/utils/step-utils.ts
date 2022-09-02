export const getRuntimeInputKeys = (object: object): string[] => {
  const arrayOfPaths = []
  const objectEntries = Object.entries(object)
  objectEntries.forEach(([key, value]) => {
    if (typeof value === 'object') {
      arrayOfPaths.push(...getRuntimeInputKeys(value))
    } else if (typeof value === 'string' && value?.includes('<+input>')) {
      arrayOfPaths.push(key)
    }
  })
  return arrayOfPaths
}
