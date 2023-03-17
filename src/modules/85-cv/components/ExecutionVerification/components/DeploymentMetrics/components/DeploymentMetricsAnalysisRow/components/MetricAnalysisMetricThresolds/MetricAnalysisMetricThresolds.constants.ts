import type { UseStringsReturn } from 'framework/strings'

export const THRESHOLD_TYPE_MAPPING: MappingType = {
  IGNORE: 'Ignore',
  FAIL_FAST: 'Fail fast'
}

export const CRITERIA_MAPPING: MappingType = {
  RATIO: 'Percentage Deviation',
  DELTA: 'Delta',
  'ABSOLUTE-VALUE': 'Absolute'
}

export const getActionText = (
  action: string,
  getString: UseStringsReturn['getString'],
  actionableCount?: number
): string => {
  const occurrenceText = actionableCount === 1 ? 'occurrence' : 'occurrences'
  switch (action) {
    case 'FAILAFTERCONSECUTIVEOCCURRENCE':
      return getString('cv.metricsAnalysis.metricThresholds.failAfterConsecutiveOccurrence', {
        actionableCount,
        occurrenceText
      })
    case 'FAILAFTEROCCURRENCE':
      return getString('cv.metricsAnalysis.metricThresholds.failAfterOccurrence', {
        actionableCount,
        occurrenceText
      })
    case 'FAILIMMEDIATELY':
      return `Fail immediately`
    case 'IGNORE':
      return 'Ignore'
    default:
      return 'NA'
  }
}

export interface MappingType {
  [key: string]: string
}
