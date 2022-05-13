/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import cx from 'classnames'
import {
  Text,
  FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  MultiTextInputProps
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { FieldArray, connect, FormikContextType } from 'formik'
import { get } from 'lodash-es'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector, {
  MultiTypeFieldSelectorProps
} from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import css from './MultiTypeCustomMap.module.scss'

export type MapValue = { id?: string; key: string; value: string }[]
export type MultiTypeMapValue = MapValue | string
type MultiTypeMapConfigureOptionsOmit = 'value' | 'type' | 'variableName' | 'onChange'

interface MultiTypeMapConfigureOptionsProps extends Omit<ConfigureOptionsProps, MultiTypeMapConfigureOptionsOmit> {
  variableName?: ConfigureOptionsProps['variableName']
}

interface MultiTypeMapKey {
  label: string
  value: string
}
export interface MultiTypeCustomMapProps {
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
  restrictToSingleEntry?: boolean
  multiTypeMapKeys: MultiTypeMapKey[]
  excludeId?: boolean
}

export const MultiTypeCustomMap = (props: MultiTypeCustomMapProps): React.ReactElement => {
  const {
    name,
    multiTypeFieldSelectorProps,
    valueMultiTextInputProps = {},
    enableConfigureOptions = true,
    configureOptionsProps,
    cardStyle,
    formik,
    disabled,
    appearance = 'default',
    restrictToSingleEntry,
    multiTypeMapKeys = [],
    excludeId,
    ...restProps
  } = props

  const getDefaultResetValue = (): { [key: string]: string }[] => {
    const defaultKeys: { [key: string]: string }[] = excludeId ? [{}] : [{ id: uuid('', nameSpace()) }]
    multiTypeMapKeys.forEach((key: MultiTypeMapKey) => (defaultKeys[0][key.value] = ''))
    return defaultKeys
  }

  const value = get(formik?.values, name, ...getDefaultResetValue()) as MultiTypeMapValue
  const { getString } = useStrings()
  return (
    <div className={cx(css.group, css.withoutSpacing, appearance === 'minimal' ? css.minimalCard : '')} {...restProps}>
      {typeof value === 'string' && getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTextInput
          style={{ flexGrow: 1, marginBottom: 0 }}
          name={name}
          multiTextInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
          }}
          {...multiTypeFieldSelectorProps}
        />
      ) : (
        <MultiTypeFieldSelector
          name={name}
          defaultValueToReset={getDefaultResetValue()}
          style={{ flexGrow: 1, marginBottom: 0 }}
          {...multiTypeFieldSelectorProps}
          disableTypeSelection={multiTypeFieldSelectorProps.disableTypeSelection || disabled}
        >
          <FieldArray
            name={name}
            render={({ remove }) => (
              <>
                {Array.isArray(value) &&
                  value.map((_row, index: number) => (
                    <div className={cx(css.group)} key={index}>
                      {multiTypeMapKeys.map(({ label: keyLabel, value: keyValue }, keyIndex) => {
                        return (
                          <div key={`${index}-${keyIndex}`}>
                            {index === 0 && (
                              <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
                                {keyLabel ?? getString('keyLabel')}
                              </Text>
                            )}
                            <FormInput.MultiTextInput
                              label=""
                              name={`${name}[${index}][${keyValue}]`}
                              multiTextInputProps={{
                                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                ...valueMultiTextInputProps
                              }}
                              disabled={disabled}
                            />
                          </div>
                        )
                      })}
                      <div className={cx(css.group, css.withoutAligning, css.withoutSpacing)}>
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
                  ))}

                {restrictToSingleEntry && Array.isArray(value) && value?.length === 1 ? null : (
                  <Button
                    intent="primary"
                    minimal
                    text={getString('plusAdd')}
                    data-testid={`add-${name}`}
                    onClick={() => {
                      const currentValue = (get(formik?.values, name) as MultiTypeMapValue) || []
                      const newVal = [...currentValue, ...getDefaultResetValue()]
                      formik?.setFieldValue(name, newVal)
                    }}
                    disabled={disabled}
                    style={{ padding: 0 }}
                  />
                )}
              </>
            )}
          />
        </MultiTypeFieldSelector>
      )}
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

export default connect(MultiTypeCustomMap)
