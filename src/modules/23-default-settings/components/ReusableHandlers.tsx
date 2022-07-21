import React, { FormEvent } from 'react'
import { FormInput } from '@harness/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import type { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useStrings } from 'framework/strings'
import css from './SettingsCategorySection.module.scss'

export const DefaultSettingStringDropDown: React.FC<SettingRendererProps> = ({
  allowedValues,
  onSettingSelectionChange,
  identifier
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
        <FormInput.Select
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
  identifier
}) => {
  return (
    <>
      <FormInput.Text
        name={identifier}
        className={css.defaultSettingRenderer}
        inputGroup={{ type: 'number' }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.target.value)
        }}
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
  falseLabel,
  trueLabel,
  identifier
}) => {
  const { getString } = useStrings()

  return (
    // used blueprintjs radiogroup since uicore form input  is not getting updated with latest settingValue
    <>
      <RadioGroup
        name={identifier}
        inline={true}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.currentTarget.value)
        }}
        selectedValue={settingValue}
      >
        <Radio label={trueLabel ? getString(trueLabel) : getString('common.true')} value="true" />
        <Radio label={falseLabel ? getString(falseLabel) : getString('common.false')} value="false" />
      </RadioGroup>
    </>
  )
}
export const DefaultSettingCheckBoxWithTrueAndFalse: React.FC<DefaultSettingRadioBtnWithTrueAndFalseProps> = ({
  onSettingSelectionChange,
  settingValue,
  identifier
}) => {
  return (
    <>
      <FormInput.CheckBox
        name={identifier}
        label=""
        className={css.defaultSettingRenderer}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.currentTarget.checked ? 'true' : 'false')
        }}
        checked={settingValue === 'true'}
      />
    </>
  )
}
export const DefaultSettingTextbox: React.FC<SettingRendererProps> = ({ onSettingSelectionChange, identifier }) => {
  return (
    <>
      <FormInput.Text
        name={identifier}
        className={css.defaultSettingRenderer}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.target.value)
        }}
      />
    </>
  )
}
