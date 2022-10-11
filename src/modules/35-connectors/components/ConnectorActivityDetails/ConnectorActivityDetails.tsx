/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// This is used in ConnectorView for connector details page
import React from 'react'
import { Layout, Container, Icon, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { StringUtils } from '@common/exports'
import type { ConnectorInfoDTO, ConnectorConnectivityDetails, ConnectorResponse } from 'services/cd-ng'
import TestConnection from '@connectors/components/TestConnection/TestConnection'
import { useStrings } from 'framework/strings'
import { ConnectorStatus } from '@connectors/constants'
import { getReadableDateTime } from '@common/utils/dateUtils'
import { getUrlValueByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import css from './ConnectorActivityDetails.module.scss'

interface ConnectorActivityDetailsProp {
  responsedata: ConnectorResponse
  refetchConnector: () => Promise<void>
}

const ConnectorActivityDetails: React.FC<ConnectorActivityDetailsProp> = activityDetailsProp => {
  const { getString } = useStrings()
  const connector = activityDetailsProp.responsedata.connector as ConnectorInfoDTO
  const connectorStatus = activityDetailsProp.responsedata?.status as ConnectorConnectivityDetails
  const lastTestedAt = getReadableDateTime(connectorStatus?.testedAt, StringUtils.DEFAULT_DATE_FORMAT)
  const lastConnectedAt = getReadableDateTime(connectorStatus?.lastConnectedAt, StringUtils.DEFAULT_DATE_FORMAT)

  const RenderConnectorStatus = (status: ConnectorConnectivityDetails['status']): React.ReactElement => {
    if (status !== 'SUCCESS' && status !== 'FAILURE') {
      return (
        <Text inline={true} font={{ size: 'medium' }}>
          {getString('na')}
        </Text>
      )
    }
    return (
      <>
        <Icon
          inline={true}
          name={status === 'SUCCESS' ? 'deployment-success-new' : 'warning-sign'}
          size={16}
          padding={{ left: 'medium', top: 'xsmall' }}
          color={status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}
        ></Icon>
        <Text inline={true} font={{ size: 'medium' }} color={status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}>
          {status === ConnectorStatus.FAILURE ? getString('failed') : getString('success')}
        </Text>
      </>
    )
  }

  return (
    <Layout.Vertical className={css.activityContainer}>
      <Container className={css.activitySummary}>
        <Layout.Horizontal spacing="small">
          <Text font={{ weight: 'bold', size: 'medium' }} inline={true} color={Color.GREY_800}>
            {getString('connectivityStatus')}
          </Text>
          {RenderConnectorStatus(connectorStatus?.status)}
        </Layout.Horizontal>
        <Text margin={{ top: 'small', bottom: 'small' }}>
          {getString('lastStatusCheckAt')} {lastTestedAt ? `${lastTestedAt}` : getString('na')}
        </Text>
        <Text margin={{ top: 'small', bottom: 'medium' }}>
          {getString('lastSuccessfulStatusCheckAt')} {lastConnectedAt ? `${lastConnectedAt}` : getString('na')}
        </Text>
        <TestConnection
          connector={connector}
          gitDetails={activityDetailsProp?.responsedata?.gitDetails}
          /* Todo  delegateName={connector?.spec?.credential?.spec?.delegateName || ''} */
          testUrl={getUrlValueByType(connector?.type || '', connector)}
          refetchConnector={activityDetailsProp.refetchConnector}
        />
      </Container>
      <Container>
        <Text
          font={{ weight: 'bold', size: 'medium' }}
          margin={{ top: 'large', bottom: 'large' }}
          color={Color.GREY_800}
        >
          {getString('changeHistory')}
        </Text>
        <Text color={Color.GREY_800}>{getString('lastUpdated')}</Text>
        <Text margin={{ top: 'small', bottom: 'small' }}>
          {getReadableDateTime(activityDetailsProp.responsedata.lastModifiedAt, StringUtils.DEFAULT_DATE_FORMAT)}
        </Text>
        <Text color={Color.GREY_800}>{getString('connectorCreated')}</Text>
        <Text margin={{ top: 'small', bottom: 'medium' }}>
          {getReadableDateTime(activityDetailsProp.responsedata.createdAt, StringUtils.DEFAULT_DATE_FORMAT)}
        </Text>
      </Container>
    </Layout.Vertical>
  )
}

export default ConnectorActivityDetails
