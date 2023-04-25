import type { InitialDrawerValuesType } from './LogAnalysisRow.types'

export const initialValuesForDrawerState: InitialDrawerValuesType = {
  showDrawer: false,
  selectedRowData: null,
  isFetchUpdatedData: false,
  isOpenedViaLogsDrawer: false
}

export const jiraFormInitialValues = {
  projectKey: '',
  title: '',
  description: '',
  issueType: '',
  identifiers: [],
  priority: ''
}
