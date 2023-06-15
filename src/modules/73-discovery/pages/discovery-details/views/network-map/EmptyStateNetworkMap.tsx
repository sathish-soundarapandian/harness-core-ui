/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Icon, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import CELogo from '@discovery/images/chaos-engineering-logo.svg'
import Services from '@discovery/images/service-settings.svg'
import Relations from '@discovery/images/related-networks.svg'
import NetworkMapVisual from '@discovery/images/network-map-visual.svg'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import css from './NetworkMapTable.module.scss'

const EmptyStateNetworkMap: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()

  return (
    <Layout.Horizontal className={css.noNetworkMapDiv} width={'80%'}>
      <Layout.Vertical spacing={'xxxlarge'} width={'60%'} style={{ margin: 'auto', paddingRight: '20px' }}>
        <img src={CELogo} width="140px" />
        <Text font={{ variation: FontVariation.H2 }}>
          {getString('discovery.discoveryDetails.networkMaps.noNetworkMapHeader')}
        </Text>
        <Text>{getString('discovery.discoveryDetails.networkMaps.noNetworkMapDesc')}</Text>
        <Layout.Horizontal spacing={'medium'} width={'350px'} flex={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={Services} />
            <Text margin={{ left: 'xsmall' }}>
              {getString('discovery.discoveryDetails.networkMaps.noNetworkMapChooseService')}
            </Text>
          </div>
          <Icon name="arrow-right" />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={Relations} />
            <Text margin={{ left: 'xsmall' }}>{getString('discovery.tabs.configureRelations')}</Text>
          </div>
        </Layout.Horizontal>
        <Button
          width={'220px'}
          text="Create New Network Map"
          variation={ButtonVariation.PRIMARY}
          onClick={() => {
            history.push({
              pathname: routes.toCreateNetworkMap({
                dAgentId: dAgentId,
                accountId,
                orgIdentifier,
                projectIdentifier
              })
            })
          }}
        />
      </Layout.Vertical>
      <Layout.Vertical width={'40%'}>
        <img src={NetworkMapVisual} style={{ marginTop: '50px' }} />
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default EmptyStateNetworkMap
