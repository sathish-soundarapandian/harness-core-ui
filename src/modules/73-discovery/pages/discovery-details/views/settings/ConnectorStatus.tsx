import React from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { ConnectorConnectivityDetails } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ConnectorStatus } from '@connectors/constants'

interface RenderConnectorStatus {
  status: ConnectorConnectivityDetails['status']
}

export const RenderConnectorStatus: React.FC<RenderConnectorStatus> = ({ status }) => {
  const { getString } = useStrings()

  if (status !== 'SUCCESS' && status !== 'FAILURE') {
    return (
      <Text inline={true} font={{ size: 'medium' }}>
        {getString('na')}
      </Text>
    )
  }
  return (
    <Layout.Horizontal flex={{ alignItems: 'center' }}>
      <Icon
        name={status === 'SUCCESS' ? 'deployment-success-new' : 'warning-sign'}
        size={10}
        color={status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}
      ></Icon>
      <Text
        font={{ size: 'small' }}
        padding={{ left: 'xsmall' }}
        color={status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}
      >
        {status === ConnectorStatus.FAILURE ? getString('failed') : getString('success')}
      </Text>
    </Layout.Horizontal>
  )
}
