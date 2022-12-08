import { getIsValuePresent } from '../licenseBannerUtils'

describe('CV License banner utils', () => {
  test('getIsValuePresent should return true if the value is not undefined', () => {
    expect(getIsValuePresent('')).toBe(true)
    expect(getIsValuePresent(' ')).toBe(true)
    expect(getIsValuePresent('a')).toBe(true)
    expect(getIsValuePresent(123)).toBe(true)
    expect(getIsValuePresent(0)).toBe(true)
    expect(getIsValuePresent({})).toBe(true)
    expect(getIsValuePresent([])).toBe(true)
  })

  test('getIsValuePresent should return false if the value is undefined', () => {
    expect(getIsValuePresent(undefined)).toBe(false)
  })
})
