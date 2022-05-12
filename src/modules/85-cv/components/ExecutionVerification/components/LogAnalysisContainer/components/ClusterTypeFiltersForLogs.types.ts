import type { MultiSelectOption } from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import type { RestResponseListString } from 'services/cv'
import type { EventTypeFullName } from '../LogAnalysis.constants'
import type { ClusterTypes } from '../LogAnalysisView.container.types'

export interface ClusterTypeFiltersForLogsProps {
  clusterTypeFilters: ClusterTypes
  onFilterChange: (checked: boolean, itemName: EventTypeFullName) => void
  nodeNames: RestResponseListString | null
  selectedNodeName: MultiSelectOption[]
  handleNodeNameChange: (selectedOptions: MultiSelectOption[]) => void
  nodeNamesError: GetDataError<unknown> | null
  nodeNamesLoading: boolean
}
