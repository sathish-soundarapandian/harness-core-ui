export const THRESHOLD_TYPE_MAPPING: MappingType = {
  IGNORE: 'Ignore',
  FAIL_FAST: 'Fail fast'
}

export const CRITERIA_MAPPING: MappingType = {
  RATIO: 'Percentage Deviation',
  DELTA: 'Delta',
  ABSOLUTE: 'Absolute'
}

export const getActionText = (action: string, actionableCount?: number): string => {
  switch (action) {
    case 'FAILAFTERCONSECUTIVEOCCURRENCE':
      return `Fail after ${actionableCount} consecutive occurence`
    case 'FAILAFTEROCCURRENCE':
      return `Fail after ${actionableCount} occurence`
    case 'FAILIMMEDIATELY':
      return `Fail immediately`
    case 'IGNORE':
      return 'Ignore'
    default:
      return 'NA'
  }
}

export const ACTION_MAPPING: MappingType = {
  // 'Ignore' | 'FailImmediately' | 'FailAfterOccurrence' | 'FailAfterConsecutiveOccurrence'
}

export interface MappingType {
  [key: string]: string
}
