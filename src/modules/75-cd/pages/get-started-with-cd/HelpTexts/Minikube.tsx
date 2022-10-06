/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from '../GetStartedWithCD.module.scss'

export const Minikube = (): JSX.Element => {
  const { getString } = useStrings()
  return (
    <ol className={css.listItemCss}>
      <li>
        <Text className={css.listContainerCss} font={{ weight: 'semi-bold' }}>
          {getString('cd.miniKube')}
        </Text>
        <Container background={Color.WHITE} padding={{ left: 'medium', top: 'small', bottom: 'small' }}>
          <Text className={css.containerItemCss} font={{ variation: FontVariation.SMALL }}>
            {getString('cd.miniKubeCmd1')}
          </Text>
          <Text className={css.containerItemCss} font={{ variation: FontVariation.SMALL }}>
            {getString('cd.miniKubeCmd2')}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }}>{getString('cd.miniKubeCmd3')}</Text>
        </Container>
      </li>
      <li>
        <Text className={css.listContainerCss} font={{ weight: 'semi-bold' }}>
          {getString('cd.clusterVerify')}
        </Text>
        <Container background={Color.WHITE} padding={{ left: 'medium', top: 'small', bottom: 'small' }}>
          <Text font={{ variation: FontVariation.SMALL }}>{getString('cd.miniKubeCmd4')}</Text>
        </Container>
      </li>
    </ol>
  )
}
