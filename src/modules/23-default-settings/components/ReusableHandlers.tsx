import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import type { SettingDTO } from 'services/cd-ng'
import type { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import { Checkbox, DropDown, RadioButtonGroup, TextInput } from '@harness/uicore'
import css from './SettingsCategorySection.module.scss'
import { SettingType } from '@default-settings/interfaces/SettingType'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useStrings } from 'framework/strings'
import { Radio, RadioGroup } from '@blueprintjs/core'

interface SettingsDefaultHandlerProps {
  valueType: SettingDTO['valueType']
  allowedValues: SettingDTO['allowedValues']
}

export const DefaultSettingStringDropDown: React.FC<SettingRendererProps> = ({
  allowedValues,
  onSettingSelectionChange,
  settingValue
}) => {
  if (allowedValues && allowedValues.length) {
    const options = allowedValues.map(val => {
      return {
        label: val,
        value: val
      }
    })
    return (
      <>
        <DropDown
          className={css.defaultSettingRenderer}
          items={options}
          onChange={option => {
            onSettingSelectionChange(option.value as string)
          }}
          value={settingValue}
        />
      </>
    )
  }
  return null
}

export const DefaultSettingNumberTextbox: React.FC<SettingRendererProps> = ({
  onSettingSelectionChange,
  settingValue
}) => {
  return (
    <>
      <TextInput
        className={css.defaultSettingRenderer}
        type={'number'}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.target.value)
        }}
        value={settingValue}
      />
    </>
  )
}
export interface DefaultSettingRadioBtnWithTrueAndFalseProps extends SettingRendererProps {
  trueLabel?: keyof StringsMap
  falseLabel?: keyof StringsMap
}
export const DefaultSettingRadioBtnWithTrueAndFalse: React.FC<DefaultSettingRadioBtnWithTrueAndFalseProps> = ({
  onSettingSelectionChange,
  settingValue,
  otherSettingsWhichAreChanged,
  falseLabel,
  trueLabel
}) => {
  const { getString } = useStrings()

  return (
    // used blueprintjs radiogroup since uicore radiobtngroup is not getting updated with latest settingValue
    <RadioGroup
      inline={true}
      onChange={(e: FormEvent<HTMLInputElement>) => {
        onSettingSelectionChange(e.currentTarget.value)
      }}
      selectedValue={settingValue}
    >
      <Radio label={trueLabel ? getString(trueLabel) : getString('cf.shared.true')} value="true" />
      <Radio label={falseLabel ? getString(falseLabel) : getString('cf.shared.false')} value="false" />
    </RadioGroup>
  )
}
export const DefaultSettingCheckBoxWithTrueAndFalse: React.FC<DefaultSettingRadioBtnWithTrueAndFalseProps> = ({
  onSettingSelectionChange,
  settingValue,
  otherSettingsWhichAreChanged
}) => {
  return (
    <>
      <Checkbox
        className={css.defaultSettingRenderer}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.currentTarget.checked ? 'true' : 'false')
        }}
        checked={settingValue === 'true'}
      />
    </>
  )
}
export const DefaultSettingTextbox: React.FC<SettingRendererProps> = ({
  onSettingSelectionChange,
  settingValue,
  otherSettingsWhichAreChanged
}) => {
  return (
    <>
      <TextInput
        className={css.defaultSettingRenderer}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.target.value)
        }}
        value={settingValue || ''}
      />
    </>
  )
}
