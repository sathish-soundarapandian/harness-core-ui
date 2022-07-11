import { Accordion, Card, OverlaySpinner, PageSpinner } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import React, { useState } from 'react'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingCategory, SettingType } from '../interfaces/SettingType'
import css from './SettingsCategorySection.module.scss'
import SettingCategorySectionContents from './SettingCategorySectionContents'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import {
  getSettingsListPromise,
  SettingDTO,
  SettingRequestDTO,
  SettingResponseDTO,
  useGetSettingsList
} from 'services/cd-ng'
import { useParams } from 'react-router-dom'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
interface SettingsCategorySectionProps {
  settingCategory: SettingCategory
  onSettingChange: (
    settingType: SettingType,
    settingDTO: SettingDTO,
    updateType: SettingRequestDTO['updateType']
  ) => void
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

  const [settingTypes, updateSettingTypes] = useState<Set<SettingType>>(new Set())
  const [settingResponseDTO, updateSettingResponseDTO] = useState<SettingResponseDTO[]>()
  const [refiedSettingTypesWithDTO, updateRefiedSettingTypesWithDTO] =
    useState<{ [Key in SettingType]?: SettingResponseDTO }>()
  const [loadingSettingTypes, updateLoadingSettingTypes] = useState(false)
  const categorySectionOpen = async () => {
    console.log('calling api')
    if (!settingTypes.size) {
      updateLoadingSettingTypes(true)
      try {
        const data = await getSettingsListPromise({
          queryParams: { accountIdentifier: accountId, category: settingCategory, orgIdentifier, projectIdentifier }
        })
        const settingTypesTemp: Set<SettingType> = new Set()
        const refiedSettingTypesWithDTOLocal: { [Key in SettingType]?: SettingResponseDTO } = {}
        data?.data?.forEach(val => {
          if (registeredSettingTypes?.has(val.setting.identifier as SettingType)) {
            refiedSettingTypesWithDTOLocal[val.setting.identifier as SettingType] = val
            settingTypesTemp.add(val.setting.identifier as SettingType)
          }
        })
        updateRefiedSettingTypesWithDTO(refiedSettingTypesWithDTOLocal)
        updateSettingResponseDTO(data.data)
        updateSettingTypes(settingTypesTemp)
      } catch (error) {
      } finally {
        updateLoadingSettingTypes(false)
      }
    }
  }

  const onSelectionChange = (settingType: SettingType, val: string) => {
    const prevSettings = refiedSettingTypesWithDTO

    if (prevSettings && prevSettings[settingType]) {
      let selectedSettingTypeDTO = prevSettings[settingType]
      if (selectedSettingTypeDTO) {
        selectedSettingTypeDTO = {
          ...selectedSettingTypeDTO,
          setting: { ...selectedSettingTypeDTO.setting, value: val }
        }

        const updatesSettingDTO = {
          ...prevSettings,
          [settingType]: selectedSettingTypeDTO
        }
        console.log(updatesSettingDTO)
        updateRefiedSettingTypesWithDTO(updatesSettingDTO)
        onSettingChange(settingType, selectedSettingTypeDTO.setting, 'UPDATE')
      }
    }
  }
  const onAllowOverride = (checked: boolean, settingType: SettingType) => {
    const prevSettings = refiedSettingTypesWithDTO

    if (prevSettings && prevSettings[settingType]) {
      let selectedSettingTypeDTO = prevSettings[settingType]
      if (selectedSettingTypeDTO) {
        selectedSettingTypeDTO = {
          ...selectedSettingTypeDTO,
          setting: { ...selectedSettingTypeDTO.setting, allowOverrides: checked }
        }

        const updatesSettingDTO = {
          ...prevSettings,
          [settingType]: selectedSettingTypeDTO
        }
        console.log(updatesSettingDTO)
        updateRefiedSettingTypesWithDTO(updatesSettingDTO)
        onSettingChange(settingType, selectedSettingTypeDTO.setting, 'UPDATE')
      }
    }
  }
  const onRestore = (settingType: SettingType) => {
    const prevSettings = refiedSettingTypesWithDTO

    if (prevSettings && prevSettings[settingType]) {
      let selectedSettingTypeDTO = prevSettings[settingType]
      if (selectedSettingTypeDTO) {
        const defaultValue = selectedSettingTypeDTO?.setting.defaultValue
        selectedSettingTypeDTO = {
          ...selectedSettingTypeDTO,
          setting: { ...selectedSettingTypeDTO.setting, value: 'modified' + defaultValue }
        }

        const updatesSettingDTO = {
          ...prevSettings,
          [settingType]: selectedSettingTypeDTO
        }
        console.log(updatesSettingDTO)
        updateRefiedSettingTypesWithDTO(updatesSettingDTO)
        onSettingChange(settingType, selectedSettingTypeDTO.setting, 'RESTORE')
      }
    }
  }

  return (
    <Card className={css.summaryCard}>
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
                onAllowOverride={onAllowOverride}
                settingsTypesSet={settingTypes}
                settingTypesResponseDTO={refiedSettingTypesWithDTO}
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
