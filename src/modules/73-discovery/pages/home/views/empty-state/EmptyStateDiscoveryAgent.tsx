/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Text, Button, ButtonVariation, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import { Link } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import addDiscoveryAgent from '@discovery/images/create-discovery-agent.svg'
import type { DrawerProps } from '../create-discovery-agent/CreateDAgent'

const EmptyStateDiscoveryAgent: React.FC<DrawerProps> = ({ setDrawerOpen }) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="large" style={{ margin: 'auto' }} flex={{ alignItems: 'center' }}>
      <img src={addDiscoveryAgent} width="210px" height="140px" />
      <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
        {getString('discovery.homepage.noDiscoveryAgent')}
      </Text>
      <Text width={600} style={{ textAlign: 'center' }}>
        {getString('discovery.homepage.discoveryAgentDesc')}
      </Text>
      <Button
        onClick={() => setDrawerOpen(true)}
        text={getString('discovery.homepage.newDiscoveryAgentBtn')}
        icon="plus"
        variation={ButtonVariation.PRIMARY}
      />
      <Link to={'#'} target="_blank">
        <Text inline color={Color.PRIMARY_7} margin={{ right: 'xsmall' }}>
          {getString('common.learnMore')}
        </Text>
        <Icon color={Color.PRIMARY_7} name="launch" size={12} />
      </Link>
    </Layout.Vertical>
  )
}

export default EmptyStateDiscoveryAgent
