/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import type { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './EnvToolTipDisplay.module.scss'

export interface ToolTipProps {
  type?: string
  environmentRef?: string
  envRefList?: string[]
  color: Color
  font: any
  shouldAddEnvPrefix?: boolean
}
export const EnvironmentToolTipDisplay = ({
  type,
  environmentRef,
  envRefList,
  color,
  font,
  shouldAddEnvPrefix
}: ToolTipProps): JSX.Element => {
  const { getString } = useStrings()
  return (
    <>
      {type === 'Infrastructure' ? (
        <Text
          color={color}
          font={font}
          className={css.envName}
          tooltip={
            <Container className={css.popOverClass} padding="small" border={{ radius: 5 }} background="black">
              {envRefList?.map(i => (
                <p key={i}>{i}</p>
              ))}
            </Container>
          }
        >
          {`${shouldAddEnvPrefix ? getString('environment') + ': ' : ''}${envRefList?.slice(0, 1).join(',')}`}
          {envRefList && envRefList?.length > 1 ? <span className={css.envToolTip}>+{envRefList.length - 1}</span> : ''}
        </Text>
      ) : (
        <Text color={color} className={css.envName} title={environmentRef} font={font}>
          {`${shouldAddEnvPrefix ? getString('environment') + ': ' : ''}${environmentRef}`}
        </Text>
      )}
    </>
  )
}
