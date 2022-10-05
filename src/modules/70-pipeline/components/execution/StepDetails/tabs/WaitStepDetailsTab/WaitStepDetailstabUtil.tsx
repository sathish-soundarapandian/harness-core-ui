export const msToTime = (ms: number | undefined) => {
  if (ms === undefined) return 0
  const seconds: number = parseInt((ms / 1000).toFixed(1))
  const minutes: number = parseInt((ms / (1000 * 60)).toFixed(1))
  const hours: number = parseInt((ms / (1000 * 60 * 60)).toFixed(1))
  const days: number = parseInt((ms / (1000 * 60 * 60 * 24)).toFixed(1))
  if (seconds < 60) {
    return seconds + ' Sec'
  } else if (minutes < 60) {
    return minutes + ' Min'
  } else if (hours < 24) {
    return hours + ' Hrs'
  } else return days + ' Days'
}
