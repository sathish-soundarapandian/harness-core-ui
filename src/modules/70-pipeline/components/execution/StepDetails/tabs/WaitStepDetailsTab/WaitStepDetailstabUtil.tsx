export const msToTime = (ms: number | undefined) => {
  if (ms === undefined) return 0
  const seconds: number = parseInt((ms / 1000).toFixed(1))
  const minutes: number = parseInt((ms / (1000 * 60)).toFixed(1))
  const hours: number = parseInt((ms / (1000 * 60 * 60)).toFixed(1))
  const days: number = parseInt((ms / (1000 * 60 * 60 * 24)).toFixed(1))
  const daysString = days > 1 ? 'Days' : 'Day'
  const hrsString = hours > 1 ? 'Hrs' : 'Hr'
  const minString = minutes > 1 ? 'Minutes' : 'Minute'
  const secString = seconds > 1 ? 'Seconds' : 'Second'
  const hrValue = hours - days * 24
  const minValue = minutes - hours * 60
  const secValue = seconds - minutes * 60
  if (seconds < 60) {
    return seconds + ' ' + secString
  } else if (minutes < 60) {
    return minutes + ' ' + minString + ' ' + secValue + ' ' + secString
  } else if (hours < 24) {
    return hours + ' ' + hrsString + ' ' + minValue + ' ' + minString
  } else return days + ' ' + daysString + ' ' + hrValue + ' ' + hrsString
}
