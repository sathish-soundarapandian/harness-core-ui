/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes } from '@blueprintjs/core'
import { Layout, Container, Text, Heading } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { TitleProps } from '../MonitoredServicePage.types'

const DetailsHeaderTitle: React.FC<TitleProps> = ({ loading, monitoredService }) => {
  const { getString } = useStrings()

  if (loading) {
    return (
      <Layout.Vertical flex spacing="small" height={45}>
        <Container height={22} width={300} className={Classes.SKELETON} />
        <Container height={15} width={300} className={Classes.SKELETON} />
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Horizontal spacing="small" height={45}>
      {/* <Icon margin={{ right: 'xsmall' }} name="infrastructure" size={40}></Icon> */}
      <Container>
        <Layout.Horizontal flex spacing="small">
          <Heading level={3} color={Color.GREY_800} font={{ variation: FontVariation.H5 }}>
            {monitoredService?.name}
          </Heading>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('idLabel', { id: monitoredService?.identifier })}
          </Text>
        </Layout.Horizontal>
        <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY }}>
          {monitoredService?.description}
        </Text>
      </Container>
    </Layout.Horizontal>
  )
}

export default DetailsHeaderTitle
