import React from 'react'
import type { SettingType } from '@default-settings/interfaces/SettingType'

import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingRequestDTO, SettingResponseDTO } from 'services/cd-ng'
import SettingTypeRow from './SettingTypeRow'

import css from './SettingsCategorySection.module.scss'
interface SettingTypeRowProps {
  settingsTypesSet: Set<SettingType> | undefined
  onSelectionChange: (settingType: SettingType, val: string) => void
  onRestore: (settingType: SettingType) => void
  settingTypesResponseDTO: { [Key in SettingType]?: SettingResponseDTO } | undefined
  onAllowOverride: (val: boolean, settingType: SettingType) => void
  otherSettingsWhichAreChanged: Map<SettingType, SettingRequestDTO>

  settingErrorMessages: Map<SettingType, string>
}
const SettingCategorySectionContents: React.FC<SettingTypeRowProps> = ({
  settingsTypesSet,
  onRestore,
  onSelectionChange,
  settingTypesResponseDTO,
  onAllowOverride,
  otherSettingsWhichAreChanged,
  settingErrorMessages
}) => {
  if (!settingsTypesSet) {
    return null
  }
  const onSelectionChangeLocal = (settingType: SettingType, val: string) => {
    if (onSelectionChange) {
      onSelectionChange(settingType, val)
    }
  }
  const onRestoreLocal = (settingType: SettingType) => {
    if (onRestore) {
      onRestore(settingType)
    }
  }
  return (
    <div className={css.settingTable}>
      {Array.from(settingsTypesSet.values()).map(settingTypeKey => {
        const settingTypeHandler = DefaultSettingsFactory.getSettingTypeHandler(settingTypeKey)
        if (!settingTypeHandler) {
          return null
        }
        return (
          <SettingTypeRow
            otherSettingsWhichAreChanged={otherSettingsWhichAreChanged}
            allowedValues={
              settingTypesResponseDTO ? settingTypesResponseDTO[settingTypeKey]?.setting.allowedValues : undefined
            }
            settingType={settingTypeKey}
            onRestore={() => onRestoreLocal(settingTypeKey)}
            settingTypeHandler={settingTypeHandler}
            settingValue={settingTypesResponseDTO ? settingTypesResponseDTO[settingTypeKey]?.setting.value : ''}
            onSelectionChange={(val: string) => onSelectionChangeLocal(settingTypeKey, val)}
            onAllowOverride={(checked: boolean) => {
              onAllowOverride(checked, settingTypeKey)
            }}
            allowOverride={
              !!(
                settingTypesResponseDTO &&
                settingTypesResponseDTO[settingTypeKey] &&
                settingTypesResponseDTO[settingTypeKey]?.setting.allowOverrides
              )
            }
            errorMessage={settingErrorMessages.get(settingTypeKey) || ''}
          />
        )
      })}
    </div>
  )
}
export default SettingCategorySectionContents
