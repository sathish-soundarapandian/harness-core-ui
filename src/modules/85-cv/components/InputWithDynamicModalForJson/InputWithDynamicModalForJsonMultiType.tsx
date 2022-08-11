/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, ExpressionAndRuntimeType, AllowedTypes, MultiTypeInputType } from '@wings-software/uicore'
import { isMultiTypeRuntime } from '@common/utils/utils'
import type { InputWithDynamicModalForJsonProps } from './InputWithDynamicModalForJson.types'
import { InputWithDynamicModalForJson } from './InputWithDynamicModalForJson'
import css from './InputWithDynamicModalForJson.module.scss'

export const InputWithDynamicModalForJsonMultiType = (
  props: InputWithDynamicModalForJsonProps & { isMultiType?: boolean } & { allowableTypes?: AllowedTypes } & {
    expressions?: string[]
  }
): JSX.Element => {
  const { isMultiType, allowableTypes, expressions, ...rest } = props
  return isMultiType ? (
    <>
      <Layout.Vertical
        className={css.fixedItemMultiType}
        spacing={'small'}
        style={{ marginBottom: 'var(--spacing-medium)' }}
      >
        <Text style={{ fontSize: 13, fontWeight: 'normal' }} tooltipProps={{ dataTooltipId: props.dataTooltipId }}>
          {props.inputLabel}
        </Text>
        <ExpressionAndRuntimeType
          name={props.inputName}
          value={props.fieldValue}
          allowableTypes={allowableTypes}
          expressions={expressions}
          onChange={(key, value, valueType): void => {
            if (isMultiTypeRuntime(valueType) || valueType === MultiTypeInputType.EXPRESSION) {
              props.onChange(props.inputName as string, key as string)
            } else if (valueType === MultiTypeInputType.FIXED) {
              props.onChange(props.inputName as string, value as string)
            }
          }}
          fixedTypeComponentProps={{
            ...rest,
            isMultiType
          }}
          fixedTypeComponent={InputWithDynamicModalForJson}
        />
      </Layout.Vertical>
    </>
  ) : (
    <InputWithDynamicModalForJson {...rest} isMultiType={false} />
  )
}
