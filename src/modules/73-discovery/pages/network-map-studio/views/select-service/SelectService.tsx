/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import NetworkMap from '@discovery/images/NetworkMap.svg'
import { useStrings } from 'framework/strings'
import List from '@discovery/components/List/List'
import css from './SelectService.module.scss'

const SelectService: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal width="100%" height="100%">
      <Container background={Color.PRIMARY_BG} className={css.overviewContainer}>
        LEFT SIDE
      </Container>

      <div className={css.details}>
        <Layout.Vertical width="100%" padding={{ top: 'xxlarge', left: 'xlarge', right: 'xlarge', bottom: 'xxlarge' }}>
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }} margin={{ bottom: 'large' }}>
            <Text font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>{getString('common.networkMap')}</Text>
            <Text
              font={{ variation: FontVariation.SMALL_BOLD }}
              color={Color.PRIMARY_7}
              rightIcon="main-share"
              rightIconProps={{ color: Color.PRIMARY_7, size: 10 }}
            >
              {getString('learnMore')}
            </Text>
          </Layout.Horizontal>
          <img src={NetworkMap} alt="Network Map" className={css.image} />
          <List
            title={getString('discovery.whatIsNetworkMap')}
            content={getString('discovery.networkMapDescription')}
            margin={{ top: 'medium', bottom: 'xlarge' }}
          />
          <List
            title={getString('discovery.howToCreateNetworkMap')}
            content={getString('discovery.howToCreateNetworkMapDesc')}
            margin={{ top: 'medium', bottom: 'xlarge' }}
          />
          <List
            title={getString('discovery.whatIsServiceDiscovery')}
            content={getString('discovery.whatIsServiceDiscoveryDesc')}
            margin={{ top: 'medium' }}
          />
        </Layout.Vertical>
      </div>
    </Layout.Horizontal>
  )
}

export default SelectService
