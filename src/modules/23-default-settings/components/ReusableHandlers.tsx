/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent } from 'react'
import { Checkbox, FormInput, FormError, Layout, MultiTypeInputType, Toggle } from '@harness/uicore'
import type { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  MultiTypeDurationProps
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import css from './SettingsCategorySection.module.scss'

export const DefaultSettingStringDropDown: React.FC<SettingRendererProps> = ({
  settingValue,
  onSettingSelectionChange,
  identifier
}) => {
  if (settingValue && settingValue.allowedValues && settingValue.allowedValues.length) {
    const options = settingValue.allowedValues.map(val => {
      return {
        label: val,
        value: val
      }
    })
    return (
      <>
        <FormInput.Select
          disabled={!settingValue.isSettingEditable}
          name={identifier}
          className={css.defaultSettingRenderer}
          items={options}
          onChange={option => {
            onSettingSelectionChange(option.value as string)
          }}
        />
      </>
    )
  }
  return null
}

export const DefaultSettingNumberTextbox: React.FC<SettingRendererProps> = ({
  onSettingSelectionChange,
  identifier,
  settingValue
}) => {
  const handleChange: MultiTypeDurationProps['onChange'] = React.useCallback(
    val => {
      onSettingSelectionChange(val)
    },
    [onSettingSelectionChange]
  )
  return (
    <FormInput.MultiTextInput
      name={identifier}
      label=""
      disabled={settingValue && !settingValue.isSettingEditable}
      multiTextInputProps={{
        textProps: {
          type: 'number'
        },
        allowableTypes: [MultiTypeInputType.FIXED]
      }}
      onChange={handleChange}
    />
  )
}
export interface DefaultSettingRadioBtnWithTrueAndFalseProps extends SettingRendererProps {
  trueLabel?: keyof StringsMap
  falseLabel?: keyof StringsMap
}
export const DefaultSettingRadioBtnWithTrueAndFalse: React.FC<DefaultSettingRadioBtnWithTrueAndFalseProps> = ({
  onSettingSelectionChange,
  settingValue,
  falseLabel,
  trueLabel,
  identifier
}) => {
  const { getString } = useStrings()
  return (
    <>
      <FormInput.RadioGroup
        inline
        radioGroup={{ inline: true }}
        name={identifier}
        disabled={settingValue && !settingValue.isSettingEditable}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.currentTarget.value)
        }}
        style={{ margin: 0 }}
        items={[
          { label: trueLabel ? getString(trueLabel) : getString('common.true'), value: 'true' },
          { label: falseLabel ? getString(falseLabel) : getString('common.false'), value: 'false' }
        ]}
      />
    </>
  )
}
export const DefaultSettingCheckBoxWithTrueAndFalse: React.FC<DefaultSettingRadioBtnWithTrueAndFalseProps> = ({
  onSettingSelectionChange,
  settingValue,
  identifier,
  errorMessage
}) => {
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }} className={css.settingCheckBoxContainer}>
      <Checkbox
        name={identifier}
        label=""
        disabled={settingValue && !settingValue.isSettingEditable}
        className={css.defaultSettingRenderer}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.currentTarget.checked ? 'true' : 'false')
        }}
        checked={settingValue?.value === 'true'}
      />
      {errorMessage ? <FormError name={identifier} errorMessage={errorMessage} /> : undefined}
    </Layout.Vertical>
  )
}
export const DefaultSettingTextbox: React.FC<SettingRendererProps> = ({
  onSettingSelectionChange,
  identifier,
  settingValue
}) => {
  const handleChange: MultiTypeDurationProps['onChange'] = React.useCallback(
    val => {
      onSettingSelectionChange(val)
    },
    [onSettingSelectionChange]
  )
  return (
    <FormInput.MultiTextInput
      name={identifier}
      label=""
      disabled={settingValue && !settingValue.isSettingEditable}
      multiTextInputProps={{
        allowableTypes: [MultiTypeInputType.FIXED]
      }}
      onChange={handleChange}
    />
  )
}

export const DefaultSettingDurationField: React.FC<SettingRendererProps> = ({
  onSettingSelectionChange,
  identifier,
  settingValue
}) => {
  const handleChange: MultiTypeDurationProps['onChange'] = React.useCallback(
    val => {
      onSettingSelectionChange(val)
    },
    [onSettingSelectionChange]
  )
  return (
    <FormMultiTypeDurationField
      name={identifier}
      label=""
      disabled={settingValue && !settingValue.isSettingEditable}
      onChange={handleChange}
      multiTypeDurationProps={{
        allowableTypes: [MultiTypeInputType.FIXED]
      }}
    />
  )
}

export const DefaultSettingsToggle: React.FC<SettingRendererProps> = ({
  onSettingSelectionChange,
  settingValue,
  identifier,
  errorMessage
}) => {
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }} className={css.settingCheckBoxContainer}>
      <Toggle
        label=""
        checked={settingValue?.value === 'true'}
        onToggle={checked => {
          onSettingSelectionChange(checked ? 'true' : 'false')
        }}
      />
      {errorMessage ? <FormError name={identifier} errorMessage={errorMessage} /> : undefined}
    </Layout.Vertical>
  )
}
