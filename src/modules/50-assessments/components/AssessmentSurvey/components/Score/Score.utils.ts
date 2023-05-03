export function getScoreMappings(userScore: number): {
  isUserScoreLow: boolean
  isUserScoreMedium: boolean
  isUserScoreHigh: boolean
} {
  const isUserScoreLow = 0 <= userScore && userScore <= 3
  const isUserScoreMedium = 4 <= userScore && userScore <= 7
  const isUserScoreHigh = 8 <= userScore && userScore <= 10
  return { isUserScoreLow, isUserScoreMedium, isUserScoreHigh }
}
