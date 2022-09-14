import React from 'react'
import GroupedSideNav from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav'

export default function CustomMetricSideNav(): JSX.Element {
  const groupedCreatedMetrics = {
    'group 1': [
      {
        groupName: {
          label: 'group 1',
          value: 'group1'
        },
        index: 0,
        metricName: 'test metric',
        continuousVerification: true
      },
      {
        groupName: {
          label: 'group 1',
          value: 'group1'
        },
        index: 1,
        metricName: 'test metric 2',
        continuousVerification: true
      }
    ]
  }

  const groupedEntries = Object.entries(groupedCreatedMetrics)

  return (
    <GroupedSideNav
      onSelect={() => null}
      selectedItem={''}
      onRemoveItem={() => null}
      groupedSelectedAppsList={groupedEntries}
      isMetricThresholdEnabled={false}
    />
  )
}
