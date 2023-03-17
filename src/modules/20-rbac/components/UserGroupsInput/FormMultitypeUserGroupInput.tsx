/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { get } from 'lodash-es'
import type { FormikContextType } from 'formik'
import {
  DataTooltipInterface,
  ExpressionAndRuntimeTypeProps,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import type { ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import { InputSetFunction, parseInput } from '@common/components/ConfigureOptions/ConfigureOptionsUtils'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import type { Scope } from '@common/interfaces/SecretsInterface'
import UserGroupsInput, { FormikUserGroupsInput } from './UserGroupsInput'
import UserGroupExpressionInput from './UserGroupExpressionInput'

export interface FormMultiTypeUserGroupInputProps
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  label: string
  tooltipProps?: DataTooltipInterface
  formik?: FormikContextType<any>
  expressions?: string[]
  templateProps?: {
    isTemplatizedView: true
    templateValue: string
  }
  enableConfigureOptions?: boolean
  configureOptionsProps?: Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'>
  scopeCountMap?: Map<Scope, string[]>
}

export type Extended = FormikUserGroupsInput & FormMultiTypeUserGroupInputProps

export const FormMultiTypeUserGroupInput: React.FC<Extended> = props => {
  const {
    disabled,
    children,
    label,
    tooltipProps,
    formik,
    name,
    allowableTypes,
    templateProps,
    enableConfigureOptions = false,
    configureOptionsProps,
    scopeCountMap
  } = props

  const value = get(formik?.values, name)

  // Don't show formError if type is fixed, as that is handled inside UserGroupInput.tsx
  const [multiType, setMultiType] = useState<MultiTypeInputType>(getMultiTypeFromValue(value, allowableTypes, true))

  const identifierFilter = useMemo(() => {
    if (!templateProps?.isTemplatizedView || !templateProps.templateValue) return []
    return (
      parseInput(templateProps.templateValue)?.[InputSetFunction.ALLOWED_VALUES]?.values?.map(getIdentifierFromValue) ??
      []
    )
  }, [templateProps?.isTemplatizedView, templateProps?.templateValue])

  return (
    <MultiTypeFieldSelector
      name={name}
      label={label}
      defaultValueToReset={[]}
      onTypeChange={setMultiType}
      hideError={multiType === MultiTypeInputType.FIXED}
      skipRenderValueInExpressionLabel
      allowedTypes={allowableTypes}
      supportListOfExpressions={true}
      disableMultiSelectBtn={disabled}
      expressionRender={() => <UserGroupExpressionInput {...props} />}
      style={{ flexGrow: 1, marginBottom: 0 }}
      enableConfigureOptions={enableConfigureOptions}
      configureOptionsProps={configureOptionsProps}
    >
      <UserGroupsInput
        label=""
        tooltipProps={tooltipProps}
        name={name}
        disabled={disabled}
        identifierFilter={identifierFilter}
        scopeCountMap={scopeCountMap}
      >
        {children}
      </UserGroupsInput>
    </MultiTypeFieldSelector>
  )
}
