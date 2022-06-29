/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import cx from 'classnames'
import {
  Text,
  //   FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  MultiTextInputProps
} from '@harness/uicore'
import { FormGroup, Intent } from '@blueprintjs/core'
import { FieldArray, connect, FormikContextType } from 'formik'
import { get, isPlainObject } from 'lodash-es'
import { useStrings } from 'framework/strings'

import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector, {
  MultiTypeFieldSelectorProps
} from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import FileStoreSelectField from '@filestore/components/FileStoreSelectField/FileStoreSelectField'

import FileSelectField from './EncryptedSelect/FileSelectField'

import css from './MultiConfigSelectField.module.scss'

export type MapValue = { id: string; key: string; value: string }[]
export type MultiTypeMapValue = MapValue | string

interface MultiTypeMapConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeMapProps {
  name: string
  multiTypeFieldSelectorProps: Omit<MultiTypeFieldSelectorProps, 'name' | 'defaultValueToReset' | 'children'>
  valueMultiTextInputProps?: Omit<MultiTextInputProps, 'name'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeMapConfigureOptionsProps
  formik?: FormikContextType<any>
  style?: React.CSSProperties
  cardStyle?: React.CSSProperties
  disabled?: boolean
  appearance?: 'default' | 'minimal'
  keyLabel?: string
  valueLabel?: string
  restrictToSingleEntry?: boolean
  fileType: string
}

export function MultiConfigSelectField(props: MultiTypeMapProps): React.ReactElement {
  const {
    name,
    multiTypeFieldSelectorProps,
    // valueMultiTextInputProps = {},
    enableConfigureOptions = true,
    configureOptionsProps,
    cardStyle,
    formik,
    disabled,
    appearance = 'default',
    keyLabel,
    valueLabel,
    restrictToSingleEntry,
    fileType,
    ...restProps
  } = props

  const getDefaultResetValue = () => {
    return [{}]
  }

  const value = get(formik?.values, name, getDefaultResetValue()) as MultiTypeMapValue

  const { getString } = useStrings()

  const errorCheck = (index: number): boolean =>
    (formik?.submitCount &&
      formik?.submitCount > 0 &&
      get(formik?.errors, `${name}[${index}].path`) &&
      isPlainObject(get(formik?.errors, `${name}[${index}]`))) as boolean

  React.useEffect(() => {
    console.log('err', get(formik?.errors, `${name}[0]`))
  }, [formik?.errors])

  return (
    <div className={cx(css.group, css.withoutSpacing, appearance === 'minimal' ? css.minimalCard : '')} {...restProps}>
      <MultiTypeFieldSelector
        name={name}
        defaultValueToReset={getDefaultResetValue()}
        style={{ flexGrow: 1, marginBottom: 0 }}
        {...multiTypeFieldSelectorProps}
        disableTypeSelection={multiTypeFieldSelectorProps.disableTypeSelection || disabled}
        onTypeChange={e => {
          console.log('e', e)
        }}
      >
        <FieldArray
          name={name}
          render={({ push, remove, replace }) => {
            return (
              <>
                {Array.isArray(value) &&
                  value.map((field: any, index: number) => {
                    const { ...restValue } = field
                    return (
                      <div className={cx(css.group, css.withoutAligning)} key={index}>
                        <FormGroup
                          helperText={errorCheck(index) ? get(formik?.errors, `${name}[${index}].path`) : null}
                          intent={errorCheck(index) ? Intent.DANGER : Intent.NONE}
                          style={{ width: '100%' }}
                        >
                          <Text margin={{ right: 'small' }}>{index}.</Text>
                          <div className={css.multiSelectField}>
                            <div className={cx(css.group, css.withoutAligning, css.withoutSpacing)}>
                              {fileType === FILE_TYPE_VALUES.ENCRYPTED ? (
                                <FileSelectField
                                  index={index}
                                  name={`${name}[${index}]`}
                                  formik={formik}
                                  onChange={(newValue, i) => {
                                    replace(i, {
                                      ...restValue,
                                      value: newValue
                                    })
                                  }}
                                  field={field}
                                />
                              ) : (
                                <div className={css.fieldWrapper}>
                                  <FileStoreSelectField name={`${name}[${index}]`} />
                                </div>
                              )}

                              <Button
                                icon="main-trash"
                                iconProps={{ size: 20 }}
                                minimal
                                data-testid={`remove-${name}-[${index}]`}
                                onClick={() => remove(index)}
                                disabled={disabled}
                              />
                            </div>
                          </div>
                        </FormGroup>
                      </div>
                    )
                  })}

                {restrictToSingleEntry && Array.isArray(value) && value?.length === 1 ? null : (
                  <Button
                    intent="primary"
                    minimal
                    text={getString('plusAdd')}
                    data-testid={`add-${name}`}
                    onClick={() => {
                      push({})
                    }}
                    disabled={disabled}
                    style={{ padding: 0 }}
                  />
                )}
              </>
            )
          }}
        />
      </MultiTypeFieldSelector>

      {enableConfigureOptions &&
        typeof value === 'string' &&
        getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ marginTop: 11 }}
            value={value}
            type={getString('map')}
            variableName={name}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={val => formik?.setFieldValue(name, val)}
            {...configureOptionsProps}
            isReadonly={props.disabled}
          />
        )}
    </div>
  )
}

export default connect(MultiConfigSelectField)
