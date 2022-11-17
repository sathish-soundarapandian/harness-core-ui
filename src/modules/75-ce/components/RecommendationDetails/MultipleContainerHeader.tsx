/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Layout, Text, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import { useStrings } from 'framework/strings'

import css from './RecommendationDetails.module.scss'

interface Props {
  currentContainer: number
  totalContainers: number
  containerName: string
  containerVisible: boolean
  toggleContainerVisble: () => void
}

const MultipleContainerHeader: React.FC<Props> = ({
  containerName,
  currentContainer,
  totalContainers,
  containerVisible,
  toggleContainerVisble
}) => {
  const { getString } = useStrings()

  if (totalContainers > 1) {
    return (
      <Layout.Horizontal padding="medium" background={Color.PRIMARY_1} className={css.containerNameCard}>
        <Container>
          <Text inline color={Color.GREY_800} font={{ variation: FontVariation.BODY2 }}>
            {getString('ce.recommendation.detailsPage.containerHeader', { currentContainer, totalContainers })}
          </Text>
          <Text inline color={Color.GREY_800} font={{ variation: FontVariation.BODY }}>
            {containerName}
          </Text>
        </Container>
        <Icon
          name={containerVisible ? 'caret-up' : 'caret-down'}
          size={18}
          color={Color.PRIMARY_5}
          onClick={toggleContainerVisble}
          className={css.toggleContainerIcon}
        />
      </Layout.Horizontal>
    )
  } else {
    return null
  }
}

export default MultipleContainerHeader
