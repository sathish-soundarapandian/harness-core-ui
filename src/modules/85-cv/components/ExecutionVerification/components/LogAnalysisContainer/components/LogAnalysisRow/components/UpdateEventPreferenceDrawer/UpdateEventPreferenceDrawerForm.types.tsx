import type { LogFeedback } from 'services/cv'

export interface UpdateEventPreferenceFormValuesType {
  eventPriority: LogFeedback['feedbackScore']
  reason: LogFeedback['description']
}
