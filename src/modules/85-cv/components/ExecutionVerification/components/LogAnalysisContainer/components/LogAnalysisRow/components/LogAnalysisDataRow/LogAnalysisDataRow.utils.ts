import { isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { LogAnalysisRowData } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import type { LogAnalysisDataRowProps } from '../../LogAnalysisRow.types'
import { getJiraDrawerButtonTitle } from '../JiraCreationDrawer/JiraCreationDrawer.utils'
import type { LogAnalysisRowContextMenuItemType } from './components/LogAnalysisDataRow.types'

export const getDisplayMessage = (message: string, isErrorTracking?: boolean): string =>
  isErrorTracking ? message.split('|').slice(0, 4).join('|') : message

export const getContextMenuItems = ({
  getString,
  onLogDetailsOpen,
  onUpdateEventPreferenceDrawer,
  onJiraModalOpen,
  isLogFeedbackEnabled,
  isJiraCreationEnabled,
  feedbackApplied,
  feedback,
  selectedIndex
}: {
  getString: UseStringsReturn['getString']
  onLogDetailsOpen: LogAnalysisDataRowProps['onDrawOpen']
  onUpdateEventPreferenceDrawer: LogAnalysisDataRowProps['onUpdateEventPreferenceDrawer']
  onJiraModalOpen: LogAnalysisDataRowProps['onJiraModalOpen']
  isLogFeedbackEnabled: boolean
  isJiraCreationEnabled: boolean
  feedbackApplied: LogAnalysisRowData['feedbackApplied']
  feedback: LogAnalysisRowData['feedback']
  selectedIndex: number
}): LogAnalysisRowContextMenuItemType[] => {
  const contextMenuItems: LogAnalysisRowContextMenuItemType[] = [
    {
      displayText: getString('cv.logs.viewEventDetails'),
      onClick: () => onLogDetailsOpen(selectedIndex)
    }
  ]

  if (isLogFeedbackEnabled) {
    contextMenuItems.push({
      displayText: getString('pipeline.verification.logs.updateEventPreference'),
      onClick: () => onUpdateEventPreferenceDrawer({ selectedIndex })
    })
  }

  if (isJiraCreationEnabled) {
    const jiraDrawerButtonTitle = getJiraDrawerButtonTitle(getString, feedback?.ticket?.id)
    contextMenuItems.push({
      displayText: jiraDrawerButtonTitle,
      onClick: () => onJiraModalOpen({ selectedIndex }),
      disabled: isEmpty(feedbackApplied) && isEmpty(feedback)
    })
  }

  return contextMenuItems
}
