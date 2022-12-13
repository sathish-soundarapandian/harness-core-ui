export const getIsValuePresent = <T>(value: T): value is NonNullable<T> => {
  return typeof value !== 'undefined'
}
