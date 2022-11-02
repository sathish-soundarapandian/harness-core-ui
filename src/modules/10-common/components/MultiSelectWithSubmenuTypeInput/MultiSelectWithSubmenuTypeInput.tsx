/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { connect, FormikContextType } from 'formik'
import React from 'react'
import { get } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@wings-software/uicore'
import type { FormSelectWithSubmenuTypeInputProps } from '@wings-software/uicore/dist/components/FormikForm/FormikForm'
import { Container } from '@harness/uicore'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'

export interface MultiSelectWithSubmenuTypeInputProps extends FormSelectWithSubmenuTypeInputProps {
  className?: string
  formik?: FormikContextType<any>
  enableConfigureOptions?: boolean
  configureOptionsProps?: Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'>
}

export function MultiSelectWithSubmenuTypeInput(props: MultiSelectWithSubmenuTypeInputProps): React.ReactElement {
  const { className, formik, enableConfigureOptions = true, configureOptionsProps, ...rest } = props
  const { name, disabled } = rest

  const value = get(formik?.values, name, '')

  return (
    <Container className={className}>
      <Layout.Horizontal spacing={'medium'}>
        <FormInput.SelectWithSubmenuTypeInput {...rest} />
        {enableConfigureOptions && getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={value}
            type="String"
            variableName={name}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            style={{ marginTop: 'var(--spacing-4)' }}
            onChange={val => formik?.setFieldValue(name, val)}
            isReadonly={disabled}
          />
        )}
      </Layout.Horizontal>
    </Container>
  )
}

export const MultiSelectWithSubmenuTypeInputField = connect(MultiSelectWithSubmenuTypeInput)
