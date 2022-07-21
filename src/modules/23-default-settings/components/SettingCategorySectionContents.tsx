import React from 'react'
import { FontVariation, Text } from '@harness/uicore'
import type { SettingType } from '@default-settings/interfaces/SettingType'

import DefaultSettingsFactory, { GroupedSettings } from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingDTO, SettingResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import SettingTypeRow from './SettingTypeRow'
import css from './SettingsCategorySection.module.scss'
interface SettingCategorySectionContentsProps {
  settingsTypesSet: Set<SettingType> | undefined
  onSelectionChange: (settingType: SettingType, val: string) => void
  onRestore: (settingType: SettingType) => void
  settingTypesResponseDTO: { [Key in SettingType]?: SettingResponseDTO } | undefined
  onAllowOverride: (val: boolean, settingType: SettingType) => void
  settingErrorMessages: Map<SettingType, string>
  registeredGroupedSettings: GroupedSettings[]

  allSettings: Map<SettingType, SettingDTO>
}
const SettingCategorySectionContents: React.FC<SettingCategorySectionContentsProps> = ({
  settingsTypesSet,
  onRestore,
  onSelectionChange,
  settingTypesResponseDTO,
  onAllowOverride,
  allSettings,
  settingErrorMessages,
  registeredGroupedSettings
}) => {
  const { getString } = useStrings()
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
      {registeredGroupedSettings.reduce((settingsArray: (JSX.Element | null)[], registeredGroupedSetting) => {
        if (registeredGroupedSetting.groupName) {
          settingsArray.push(
            <>
              <Text font={{ variation: FontVariation.H6 }}>{getString(registeredGroupedSetting.groupName)}</Text>
              <span></span> <span></span>
            </>
          )
        }

        const filteredGroupSettings = Array.from(registeredGroupedSetting.settingTypes.values()).map(settingTypeKey => {
          const settingTypeHandler = DefaultSettingsFactory.getSettingTypeHandler(settingTypeKey)
          if (!settingTypeHandler || !settingsTypesSet.has(settingTypeKey)) {
            return null
          }
          return (
            <SettingTypeRow
              key={settingTypeKey}
              allSettings={allSettings}
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
        })

        settingsArray = settingsArray.concat(filteredGroupSettings)

        return settingsArray
      }, [])}
    </div>
  )
}
export default SettingCategorySectionContents
