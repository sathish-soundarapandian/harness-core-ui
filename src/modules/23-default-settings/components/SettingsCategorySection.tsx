import { Accordion, Card, OverlaySpinner, PageSpinner } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import React, { useState } from 'react'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingCategory, SettingType } from '../interfaces/SettingType'
import css from './SettingsCategorySection.module.scss'
import SettingCategorySectionContents from './SettingCategorySectionContents'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { getSettingsListPromise, SettingDTO, SettingResponseDTO, useGetSettingsList } from 'services/cd-ng'
import { useParams } from 'react-router-dom'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
interface SettingsCategorySectionProps {
  settingCategory: SettingCategory
  onSettingChange: (settingDTO: SettingDTO) => void
}

const SettingsCategorySection: React.FC<SettingsCategorySectionProps> = ({ settingCategory, onSettingChange }) => {
  const settingCategoryHandler = DefaultSettingsFactory.getSettingCategoryHandler(settingCategory)
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()

  const { getString } = useStrings()
  if (!settingCategoryHandler) return null
  const { label, settingTypes: registeredSettingTypes, featureFlag } = settingCategoryHandler
  let enableFeatureFlag = true
  if (featureFlag) {
    enableFeatureFlag = useFeatureFlag(featureFlag)
  }
  if (!enableFeatureFlag) {
    return null
  }
  const refiedSettingTypesWithDTO: { [Key in SettingType]?: SettingResponseDTO } = {}
  const [settingTypes, updateSettingTypes] = useState<Set<SettingType>>(new Set())
  const [settingResponseDTO, updateSettingResponseDTO] = useState<SettingResponseDTO[]>()

  const [loadingSettingTypes, updateLoadingSettingTypes] = useState(false)
  const categorySectionOpen = async () => {
    console.log('calling api')
    if (!settingTypes.size) {
      updateLoadingSettingTypes(true)
      try {
        const data = await getSettingsListPromise({
          category: settingCategory,
          queryParams: { accountIdentifier: accountId }
        })
        const settingTypesTemp: Set<SettingType> = new Set()
        data?.data?.forEach(val => {
          if (registeredSettingTypes?.has(val.setting.identifier as SettingType)) {
            refiedSettingTypesWithDTO[val.setting.identifier as SettingType] = val
            settingTypesTemp.add(val.setting.identifier as SettingType)
          }
        })
        updateSettingResponseDTO(data.data)
        updateSettingTypes(settingTypesTemp)
      } catch (error) {
      } finally {
        updateLoadingSettingTypes(false)
      }
    }
  }
  const onSettingChangeLocal = () => {
    // onSettingChange({ identifier: settingType, category: settingCategory })
  }
  const onSelectionChange = (settingType: SettingType, val: string) => {
    console.log({ settingType, val })
  }
  const onRestore = (settingType: SettingType, val: string) => {
    console.log({ settingType, val })
  }

  return (
    <Card>
      <Accordion
        summaryClassName={css.summarySetting}
        onChange={openTabId => {
          console.log({ openTab: openTabId })
          if (openTabId) {
            categorySectionOpen()
          }
        }}
        collapseProps={{ keepChildrenMounted: false }}
      >
        <Accordion.Panel
          details={
            loadingSettingTypes ? (
              <PageSpinner />
            ) : (
              <SettingCategorySectionContents
                onSelectionChange={onSelectionChange}
                onRestore={onRestore}
                settingsTypesSet={settingTypes}
              />
            )
          }
          id={settingCategory}
          summary={getString(label)}
        />
      </Accordion>
    </Card>
  )
}
export default SettingsCategorySection
