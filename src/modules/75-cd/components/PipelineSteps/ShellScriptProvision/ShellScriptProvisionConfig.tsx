/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  ExpressionInput,
  EXPRESSION_INPUT_PLACEHOLDER,
  FormError,
  Layout
} from '@harness/uicore'

import { connect } from 'formik'
import { FormGroup, Intent } from '@blueprintjs/core'
import { get, isPlainObject } from 'lodash-es'
import { useStrings } from 'framework/strings'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import FileStoreSelectField from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'
import type {
  MultiTypeMapProps,
  MultiTypeMapValue
} from '../AzureWebAppServiceSpec/AzureWebAppStartupScriptSelection/MultiConfigSelectField'
import MultiTypeConfigFileSelect from '../AzureWebAppServiceSpec/AzureWebAppStartupScriptSelection/MultiTypeConfigFileSelect'
import css from './ShellScriptProvision.module.scss'

export function ShellScriptProvisionConfig(props: MultiTypeMapProps): React.ReactElement {
  const { name, configureOptionsProps, formik, expressions, multiTypeFieldSelectorProps } = props

  const value = get(formik?.values, name, '') as MultiTypeMapValue

  const { getString } = useStrings()
  const errorCheck = /* istanbul ignore next */ (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  return (
    <Layout.Horizontal className={css.alignStyles}>
      <MultiTypeConfigFileSelect
        name={name}
        defaultValueToReset={''}
        hideError={true}
        formClass={css.formStyle}
        disableTypeSelection={false}
        style={{ marginBottom: 4, marginTop: 4 }}
        supportListOfExpressions={true}
        allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]}
        {...multiTypeFieldSelectorProps}
        defaultType={getMultiTypeFromValue(
          get(formik?.values, name),
          [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME],
          true
        )}
        expressionRender={() => {
          return (
            <FormGroup
              helperText={errorCheck() ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null}
              intent={errorCheck() ? Intent.DANGER : Intent.NONE}
              style={{ width: '100%' }}
            >
              <ExpressionInput
                name={name}
                value={get(formik?.values, name)}
                disabled={false}
                inputProps={{ placeholder: EXPRESSION_INPUT_PLACEHOLDER }}
                items={expressions}
                onChange={val => formik?.setFieldValue(name, val)}
              />
            </FormGroup>
          )
        }}
      >
        <div className={css.fieldWrapper}>
          <FileStoreSelectField
            name={name}
            onChange={
              /* istanbul ignore next */ newValue => {
                formik?.setFieldValue(name, newValue)
              }
            }
          />
        </div>
      </MultiTypeConfigFileSelect>
      {typeof value === 'string' && getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
        <ConfigureOptions
          value={value}
          style={{ marginTop: 32 }}
          type={getString('map')}
          variableName={name}
          showRequiredField={false}
          showDefaultField={false}
          showAdvanced={true}
          onChange={/* istanbul ignore next */ val => formik?.setFieldValue(name, val)}
          {...configureOptionsProps}
          isReadonly={props.disabled}
        />
      )}
    </Layout.Horizontal>
  )
}

export default connect(ShellScriptProvisionConfig)
