/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Layout, SelectOption, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Position } from '@blueprintjs/core'
import { StringKeys, useStrings } from 'framework/strings'
import css from './CustomVariables.module.scss'

export enum VariableType {
  String = 'String',
  Secret = 'Secret',
  Number = 'Number',
  Connector = 'Connector'
}

export const labelStringMap: Record<VariableType, StringKeys> = {
  [VariableType.String]: 'string',
  [VariableType.Secret]: 'secretType',
  [VariableType.Number]: 'number',
  [VariableType.Connector]: 'connector'
}

export const getVaribaleTypeOptions = (
  allowedVarialblesTypes: VariableType[] | undefined,
  getString: (key: StringKeys) => string
): SelectOption[] =>
  defaultTo(allowedVarialblesTypes, [VariableType.String, VariableType.Secret, VariableType.Number]).map(type => ({
    label: getString(labelStringMap[type]),
    value: type
  }))

export function NameTypeRequiredColumn(props: { children: React.ReactNode }): React.ReactElement {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      {props.children}
      <Text
        icon="asterisk"
        iconProps={{ size: 12, color: Color.RED_500 }}
        padding={{ left: 'small' }}
        tooltip={getString('pipeline.required')}
        tooltipProps={{ position: Position.RIGHT, isDark: true }}
      />
    </Layout.Horizontal>
  )
}

export function NameTypeColumn(props: { name: string; type: string }): React.ReactElement {
  const { name, type } = props
  return (
    <Layout.Vertical className={css.nameTypeColumn}>
      <Text font={{ variation: FontVariation.SMALL_BOLD, size: 'normal' }} color={Color.BLACK} lineClamp={1}>
        {name}
      </Text>
      <Text font={{ size: 'small' }} color={Color.GREY_600}>
        {type}
      </Text>
    </Layout.Vertical>
  )
}
