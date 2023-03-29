/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { StringKeys, useStrings } from 'framework/strings'
import css from './InfoContainer.module.scss'

const InfoContainer: React.FC<{ label: StringKeys; labelElement?: React.ReactNode }> = ({ label, labelElement }) => {
  const { getString } = useStrings()
  return (
    <Container className={css.container} flex={{ justifyContent: 'flex-start' }}>
      <Icon name="info-message" size={23} padding={{ right: 'medium' }} />
      <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
        {labelElement || getString(label)}
      </Text>
    </Container>
  )
}

export default InfoContainer
