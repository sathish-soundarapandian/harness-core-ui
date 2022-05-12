import React, { useCallback } from 'react'
import { Checkbox, Container, Layout, MultiSelectDropDown, MultiSelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ClusterTypeFiltersForLogsProps } from './ClusterTypeFiltersForLogs.types'
import { getDropdownItems, getFilterDisplayText } from '../../DeploymentMetrics/DeploymentMetrics.utils'
import type { EventTypeFullName } from '../LogAnalysis.constants'
import { getClusterTypes } from '../LogAnalysis.utils'
import css from './ClusterTypeFiltersForLogs.module.scss'
import filterStyle from '../../DeploymentMetrics/DeploymentMetrics.module.scss'

const ClusterTypeFiltersForLogs: React.FC<ClusterTypeFiltersForLogsProps> = ({
  clusterTypeFilters,
  onFilterChange,
  selectedNodeName,
  nodeNames,
  nodeNamesLoading,
  nodeNamesError,
  handleNodeNameChange
}) => {
  const { getString } = useStrings()

  const checkboxItems = getClusterTypes(getString)

  const getFilteredText = useCallback(
    (selectedOptions: MultiSelectOption[] = [], filterText = ' '): string => {
      const baseText = getString(filterText)
      return getFilterDisplayText(selectedOptions, baseText, getString('all'))
    },
    [getString]
  )

  return (
    <Container className={css.main}>
      <Layout.Horizontal className={css.filterContainer}>
        <MultiSelectDropDown
          placeholder={getFilteredText(selectedNodeName, 'pipeline.nodesLabel')}
          value={selectedNodeName}
          className={filterStyle.filterDropdown}
          items={getDropdownItems(nodeNames?.resource as string[], nodeNamesLoading, nodeNamesError)}
          onChange={handleNodeNameChange}
          buttonTestId={'node_name_filter'}
        />
        <Layout.Horizontal margin={{ left: 'small' }} padding={{ left: 'small' }} border={{ left: true }}>
          {checkboxItems.map(item => (
            <Checkbox
              key={item.label}
              label={item.label}
              value={item.value as string}
              data-testid={item.label}
              defaultChecked={clusterTypeFilters?.includes(item.value as EventTypeFullName)}
              onChange={inputEl => {
                onFilterChange((inputEl.target as HTMLInputElement).checked, item.value as EventTypeFullName)
              }}
            />
          ))}
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default ClusterTypeFiltersForLogs
