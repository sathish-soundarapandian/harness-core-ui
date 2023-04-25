import type { LogFeedback } from 'services/cv'

export const feedbackData: LogFeedback = {
  description: 'Some description',
  feedbackScore: 'HIGH_RISK',
  updatedBy: 'jane.doe@harness.io',
  updatedAt: 1677414780069,
  ticket: {
    id: '123',
    externalId: 'SRM-123',
    url: 'abc.com'
  }
}
