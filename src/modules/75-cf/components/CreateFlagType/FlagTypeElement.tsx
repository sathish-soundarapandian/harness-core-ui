/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import css from './FlagTypeElement.module.scss'

interface TypeFlagProps {
  type: string
  text: string
  textDesc: string
  typeOfFlagFnc: (typeOfFlag: boolean, type: string) => void
  children: React.ReactNode
}

const TypeFlag: React.FC<TypeFlagProps> = ({ type, text, textDesc, typeOfFlagFnc, children }) => {
  const onTypeOfFlagFnc = (): void => {
    typeOfFlagFnc(true, type)
  }

  return (
    <Container>
      <div onClick={onTypeOfFlagFnc} className={css.typeFlag}>
        {children}
        <Text margin={{ top: 'small', bottom: 'small' }} color={Color.BLACK} font={{ weight: 'bold', size: 'medium' }}>
          {text}
        </Text>
        <Text font="xsmall" color={Color.GREY_400}>
          {textDesc}
        </Text>
      </div>
    </Container>
  )
}

export default TypeFlag
