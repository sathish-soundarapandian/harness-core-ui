/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes } from '@blueprintjs/core'
import { Container, Heading, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { HeaderTitleProps } from '@cv/pages/slos/CVSLODetailsPage/CVSLODetailsPage.types'

const HeaderTitle: React.FC<HeaderTitleProps> = ({ loading, title, description }) => {
  const { getString } = useStrings()

  if (loading) {
    return (
      <Layout.Vertical flex spacing="small" height={45}>
        <Container height={24} width={300} className={Classes.SKELETON} />
        <Container height={15} width={300} className={Classes.SKELETON} />
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Vertical flex={{ justifyContent: 'space-evenly', alignItems: 'flex-start' }} height={45}>
      <Heading level={3} color={Color.GREY_800} font={{ variation: FontVariation.H5 }}>
        {getString('cv.SLOWithName', { name: title })}
      </Heading>
      <Text color={Color.GREY_600} font={{ variation: FontVariation.BODY2 }}>
        {description}
      </Text>
    </Layout.Vertical>
  )
}

export default HeaderTitle
