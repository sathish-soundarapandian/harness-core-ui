/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Classes } from '@blueprintjs/core'
import { Layout, Container, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ToolbarProps } from '../MonitoredServicePage.types'
import type { ExtendedMonitoredServiceDTO } from '../components/Configurations/Configurations.utils'
import { MonitoredServiceType } from '../components/Configurations/components/Service/components/MonitoredServiceOverview/MonitoredServiceOverview.constants'

const DetailsToolbar: React.FC<ToolbarProps> = ({ loading, monitoredService, lastModifiedAt }) => {
  const { getString } = useStrings()

  const envRefList = (monitoredService as ExtendedMonitoredServiceDTO)?.environmentRefList

  if (loading) {
    return (
      <Layout.Vertical spacing="xsmall" data-testid="loading">
        <Container height={15} width={220} className={Classes.SKELETON} />
        <Container height={15} width={220} className={Classes.SKELETON} />
        <Container height={15} width={220} className={Classes.SKELETON} />
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Vertical spacing="xsmall" style={{ textAlign: 'right' }}>
      <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>{`${getString('lastUpdated')}: `}</Text>
        <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL_SEMI }} padding={{ left: 'xsmall' }}>
          {`${moment(lastModifiedAt).format('lll')}`}
        </Text>
      </Layout.Horizontal>
      {monitoredService?.type === MonitoredServiceType.INFRASTRUCTURE ? (
        <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
            {`${getString('environment')}:`}
          </Text>
          <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL_SEMI }} padding={{ left: 'xsmall' }}>
            {envRefList?.slice(0, 1).join(',')}
            {envRefList && envRefList?.length > 1 ? <span>+{envRefList.length - 1}</span> : ''}
          </Text>
        </Layout.Horizontal>
      ) : (
        <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
          <Text
            color={Color.GREY_500}
            title={monitoredService?.environmentRef}
            font={{ variation: FontVariation.SMALL }}
          >
            {`${getString('environment')}:`}
          </Text>
          <Text
            color={Color.BLACK}
            title={monitoredService?.environmentRef}
            font={{ variation: FontVariation.SMALL_SEMI }}
            padding={{ left: 'xsmall' }}
          >
            {monitoredService?.environmentRef}
          </Text>
        </Layout.Horizontal>
      )}
      <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
          {`${getString('typeLabel')}:`}
        </Text>
        <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL_SEMI }} padding={{ left: 'xsmall' }}>
          {`${monitoredService?.type}`}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default DetailsToolbar
