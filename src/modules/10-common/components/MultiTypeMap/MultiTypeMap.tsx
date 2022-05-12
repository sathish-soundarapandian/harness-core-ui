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
import css from './MultiTypeMap.module.scss'

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
}

export const MultiTypeMap = (props: MultiTypeMapProps): React.ReactElement => {
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
    keyLabel,
    valueLabel,
    restrictToSingleEntry,
    ...restProps
  } = props

  const getDefaultResetValue = () => {
    return [{ id: uuid('', nameSpace()), key: '', value: '' }]
  }

  const value = get(formik?.values, name, getDefaultResetValue()) as MultiTypeMapValue

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
            render={({ push, remove }) => (
              <>
                {Array.isArray(value) &&
                  value.map(({ id }, index: number) => (
                    <div className={cx(css.group, css.withoutAligning)} key={id}>
                      <div>
                        {index === 0 && (
                          <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
                            {keyLabel ?? getString('keyLabel')}
                          </Text>
                        )}
                        <FormInput.Text name={`${name}[${index}].key`} disabled={disabled} />
                      </div>

                      <div>
                        {index === 0 && (
                          <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
                            {valueLabel ?? getString('valueLabel')}
                          </Text>
                        )}
                        <div className={cx(css.group, css.withoutAligning, css.withoutSpacing)}>
                          <FormInput.MultiTextInput
                            label=""
                            name={`${name}[${index}].value`}
                            multiTextInputProps={{
                              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                              ...valueMultiTextInputProps
                            }}
                            disabled={disabled}
                          />
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
                    </div>
                  ))}

                {restrictToSingleEntry && Array.isArray(value) && value?.length === 1 ? null : (
                  <Button
                    intent="primary"
                    minimal
                    text={getString('plusAdd')}
                    data-testid={`add-${name}`}
                    onClick={() => push({ id: uuid('', nameSpace()), key: '', value: '' })}
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

export default connect(MultiTypeMap)
