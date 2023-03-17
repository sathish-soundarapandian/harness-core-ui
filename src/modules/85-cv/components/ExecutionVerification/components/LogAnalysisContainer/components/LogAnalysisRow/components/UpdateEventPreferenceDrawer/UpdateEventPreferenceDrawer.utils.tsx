import { isEmpty } from 'lodash-es'
import { SelectOption, Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import type { LogFeedback } from 'services/cv'
import type { UpdateEventPreferenceFormValuesType } from './UpdateEventPreferenceDrawerForm.types'

export enum FeedbackScore {
  NO_RISK_IGNORE_FREQUENCY = 'NO_RISK_IGNORE_FREQUENCY',
  NO_RISK_CONSIDER_FREQUENCY = 'NO_RISK_CONSIDER_FREQUENCY',
  MEDIUM_RISK = 'MEDIUM_RISK',
  HIGH_RISK = 'HIGH_RISK',
  DEFAULT = 'DEFAULT'
}

type EventPriorityStringKeys =
  | 'cv.logs.eventPriorityValues.notARiskIgnore'
  | 'cv.logs.eventPriorityValues.notARiskConsider'
  | 'cv.logs.eventPriorityValues.mediumRisk'
  | 'cv.logs.eventPriorityValues.highRisk'
  | 'cv.logs.eventPriorityValues.default'

const RiskItems: Record<EventPriorityStringKeys, FeedbackScore> = {
  'cv.logs.eventPriorityValues.notARiskIgnore': FeedbackScore.NO_RISK_IGNORE_FREQUENCY,
  'cv.logs.eventPriorityValues.notARiskConsider': FeedbackScore.NO_RISK_CONSIDER_FREQUENCY,
  'cv.logs.eventPriorityValues.mediumRisk': FeedbackScore.MEDIUM_RISK,
  'cv.logs.eventPriorityValues.highRisk': FeedbackScore.HIGH_RISK,
  'cv.logs.eventPriorityValues.default': FeedbackScore.DEFAULT
}

export const RiskItemDisplayName: Record<FeedbackScore, StringKeys> = {
  [FeedbackScore.NO_RISK_IGNORE_FREQUENCY]: 'cv.logs.eventPriorityValues.notARiskIgnore',
  [FeedbackScore.NO_RISK_CONSIDER_FREQUENCY]: 'cv.logs.eventPriorityValues.notARiskConsider',
  [FeedbackScore.MEDIUM_RISK]: 'cv.logs.eventPriorityValues.mediumRisk',
  [FeedbackScore.HIGH_RISK]: 'cv.logs.eventPriorityValues.highRisk',
  [FeedbackScore.DEFAULT]: 'cv.logs.eventPriorityValues.default'
}

export function getRiskItems(getString: UseStringsReturn['getString']): SelectOption[] {
  return Object.keys(RiskItems).map(riskItem => ({
    label: getString(riskItem as EventPriorityStringKeys),
    value: RiskItems[riskItem as EventPriorityStringKeys]
  }))
}

export function getRiskColor(riskType: LogFeedback['feedbackScore']): Color {
  switch (riskType) {
    case FeedbackScore.NO_RISK_IGNORE_FREQUENCY:
      return Utils.getRealCSSColor(Color.PRIMARY_3)
    case FeedbackScore.NO_RISK_CONSIDER_FREQUENCY:
      return Utils.getRealCSSColor(Color.PRIMARY_6)
    case FeedbackScore.MEDIUM_RISK:
      return Utils.getRealCSSColor(Color.ORANGE_500)
    case FeedbackScore.HIGH_RISK:
      return Utils.getRealCSSColor(Color.RED_800)
    case FeedbackScore.DEFAULT:
      return Utils.getRealCSSColor(Color.GREY_200)
    default:
      return Color.GREY_300
  }
}

export const getIsValuesUpdated = (
  formData?: UpdateEventPreferenceFormValuesType,
  feedbackData?: LogFeedback
): boolean => {
  if (isEmpty(feedbackData) || !feedbackData) {
    return true
  }

  if (isEmpty(formData) || !formData) {
    return false
  }

  const { eventPriority, reason } = formData
  const { feedbackScore, description } = feedbackData

  return eventPriority !== feedbackScore || reason !== description
}
