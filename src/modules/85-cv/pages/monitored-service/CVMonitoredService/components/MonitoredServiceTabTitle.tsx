import React from 'react'
import { Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

export default function MonitoredServiceTabTitle({
  title,
  isTabDisabled
}: {
  title: string
  isTabDisabled?: boolean
}): JSX.Element {
  const { getString } = useStrings()

  const tooltipText = isTabDisabled ? getString('cv.monitoredServices.monitoredServiceTabs.disabledText') : ''

  return (
    <Text tooltip={tooltipText} font={{ variation: FontVariation.LEAD }}>
      {title}
    </Text>
  )
}
