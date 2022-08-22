import React from 'react'
import { Container, FontVariation, Text } from '@harness/uicore'
import type { SettingCategory, SettingGroups, SettingType } from '@default-settings/interfaces/SettingType.types'

import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import SettingTypeRow from './SettingTypeRow'
import css from './SettingsCategorySection.module.scss'
interface SettingCategorySectionContentsProps {
  settingCategory: SettingCategory
  settingsSet: Set<SettingType> | undefined
  onSelectionChange: (settingType: SettingType, val: string) => void
  onRestore: (settingType: SettingType) => void
  onAllowOverride: (val: boolean, settingType: SettingType) => void
  settingErrorMessages: Map<SettingType, string>
  categoryAllSettings: Map<SettingType, SettingDTO>
}
const SettingCategorySectionContents: React.FC<SettingCategorySectionContentsProps> = ({
  settingsSet: settingsTypesSet,
  onRestore,
  onSelectionChange,
  onAllowOverride,
  categoryAllSettings: allSettings,
  settingErrorMessages,
  settingCategory
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
  const GroupHeader: React.FC<{ groupName: keyof StringsMap }> = ({ groupName }) => (
    <Container className={css.groupHeaderContainer} flex={{ alignItems: 'center' }}>
      <Text font={{ variation: FontVariation.TINY }}>{getString(groupName).toUpperCase()}</Text>
    </Container>
  )
  const settingDisplayOrder = DefaultSettingsFactory.getCategorySettingsDisplayOrderList(settingCategory)
  const groupNamesSet = DefaultSettingsFactory.getGroupNames()
  const settingsSet = DefaultSettingsFactory.getSettingNames()
  const getSettingTypeRowsJSXElements = (settingArray: SettingType[], isSubCategory = false) => {
    return settingArray.map(settingTypeKey => {
      const settingTypeHandler = DefaultSettingsFactory.getSettingHandler(settingTypeKey)
      if (!settingTypeHandler || !settingsTypesSet.has(settingTypeKey)) {
        return null
      }
      return (
        <SettingTypeRow
          key={settingTypeKey}
          allSettings={allSettings}
          settingType={settingTypeKey}
          onRestore={() => onRestoreLocal(settingTypeKey)}
          settingTypeHandler={settingTypeHandler}
          settingValue={allSettings.get(settingTypeKey)}
          onSettingChange={(val: string) => onSelectionChangeLocal(settingTypeKey, val)}
          onAllowOverride={(checked: boolean) => {
            onAllowOverride(checked, settingTypeKey)
          }}
          allowOverride={!!allSettings.get(settingTypeKey)?.allowOverrides}
          errorMessage={settingErrorMessages.get(settingTypeKey) || ''}
          isSubCategory={!!isSubCategory}
        />
      )
    })
  }
  return (
    <>
      {settingDisplayOrder.reduce((settingsArray: (JSX.Element | null)[], settingOrAGroup) => {
        if (groupNamesSet.has(settingOrAGroup as SettingGroups)) {
          const groupHandler = DefaultSettingsFactory.getGroupHandler(settingOrAGroup as SettingGroups)
          if (groupHandler && groupHandler.groupName) {
            settingsArray.push(<GroupHeader groupName={groupHandler.groupName} />)
            const groupSettingList = DefaultSettingsFactory.getGroupSettingsDisplayOrderList(
              settingOrAGroup as SettingGroups
            )
            settingsArray = settingsArray.concat(getSettingTypeRowsJSXElements(groupSettingList, true))
          }
        } else if (settingsSet.has(settingOrAGroup as SettingType)) {
          settingsArray = settingsArray.concat(getSettingTypeRowsJSXElements([settingOrAGroup as SettingType]))
        }

        return settingsArray
      }, [])}
    </>
  )
}
export default SettingCategorySectionContents
