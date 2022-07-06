import type { SettingType } from '@default-settings/interfaces/SettingType'
import React from 'react'

import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import SettingTypeRow from './SettingTypeRow'
import { Layout } from '@harness/uicore'

import css from './SettingsCategorySection.module.scss'
interface SettingTypeRowProps {
  settingsTypesSet: Set<SettingType> | undefined
  onSelectionChange: (settingType: SettingType, val: string) => void
  onRestore: (settingType: SettingType, val: string) => void
}
const SettingCategorySectionContents: React.FC<SettingTypeRowProps> = ({
  settingsTypesSet,
  onRestore,
  onSelectionChange
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
    console.log('restored Clicked')
    if (onRestore) {
      onRestore(settingType, 'restoredValue')
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
            settingType={settingTypeKey}
            onRestore={() => onRestoreLocal(settingTypeKey)}
            settingTypeHandler={settingTypeHandler}
            settingValue={'somerandomValue'}
            onSelectionChange={(val: string) => onSelectionChangeLocal(settingTypeKey, val)}
          />
        )
      })}
    </div>
  )
}
export default SettingCategorySectionContents
