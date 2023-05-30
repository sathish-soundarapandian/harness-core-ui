/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import DiscoveringServices from '@discovery/images/DiscoveringServices.svg'
import css from './NetworkDiscoveryModal.module.scss'

// interface Props {
//   hideNetworkDiscoveryModal: () => void
// }

const NetworkDiscoveryModal: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      <Container width={'60%'} className={css.leftContainer}>
        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} margin={{ bottom: 'xlarge' }}>
          {getString('discovery.discoverServices')}
        </Text>
        <Text
          font={{ variation: FontVariation.H2, weight: 'semi-bold' }}
          margin={{ top: 'xlarge' }}
          color={Color.GREY_200}
        >
          {'-- %'}
        </Text>
        <img src={DiscoveringServices} alt="Discovering Service" />
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_200}>
          {getString('discovery.approxTime')} 3 min 45 sec
        </Text>
      </Container>
      <Container width={'40%'} className={css.rightContainer}>
        Right
      </Container>
    </Layout.Horizontal>
  )
}

export default NetworkDiscoveryModal
