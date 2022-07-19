import {
  Accordion,
  Card,
  getErrorInfoFromErrorObject,
  PageSpinner,
  useToaster,
  Text,
  FontVariation
} from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { getSettingsListPromise, SettingDTO, SettingRequestDTO, SettingResponseDTO } from 'services/cd-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { SettingCategory, SettingType } from '../interfaces/SettingType'
import SettingCategorySectionContents from './SettingCategorySectionContents'
import css from './SettingsCategorySection.module.scss'
interface SettingsCategorySectionProps {
  settingCategory: SettingCategory
  onSettingChange: (
    settingType: SettingType,
    settingDTO: SettingDTO,
    updateType: SettingRequestDTO['updateType']
  ) => void
  otherSettingsWhichAreChanged: Map<SettingType, SettingRequestDTO>
  settingErrorMessages: Map<SettingType, string>
}

const SettingsCategorySection: React.FC<SettingsCategorySectionProps> = ({
  settingCategory,
  onSettingChange,
  otherSettingsWhichAreChanged,
  settingErrorMessages
}) => {
  const settingCategoryHandler = DefaultSettingsFactory.getSettingCategoryHandler(settingCategory)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & ModulePathParams>()

  const { getString } = useStrings()
  if (!settingCategoryHandler) return null
  const { label, settingTypes: registeredSettingTypes, featureFlag, icon } = settingCategoryHandler
  let enableFeatureFlag = true
  if (featureFlag) {
    enableFeatureFlag = useFeatureFlag(featureFlag)
  }
  if (!enableFeatureFlag) {
    return null
  }

  const [settingTypes, updateSettingTypes] = useState<Set<SettingType>>(new Set())

  const { showError } = useToaster()
  const [refiedSettingTypesWithDTO, updateRefiedSettingTypesWithDTO] =
    useState<{ [Key in SettingType]?: SettingResponseDTO }>()
  const [loadingSettingTypes, updateLoadingSettingTypes] = useState(false)
  const categorySectionOpen = async () => {
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
        updateSettingTypes(settingTypesTemp)
      } catch (error) {
        showError(getErrorInfoFromErrorObject(error))
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
          setting: { ...selectedSettingTypeDTO.setting, value: defaultValue }
        }

        const updatesSettingDTO = {
          ...prevSettings,
          [settingType]: selectedSettingTypeDTO
        }
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
                otherSettingsWhichAreChanged={otherSettingsWhichAreChanged}
                onSelectionChange={onSelectionChange}
                onRestore={onRestore}
                onAllowOverride={onAllowOverride}
                settingsTypesSet={settingTypes}
                settingTypesResponseDTO={refiedSettingTypesWithDTO}
                settingErrorMessages={settingErrorMessages}
              />
            )
          }
          id={settingCategory}
          summary={
            <Text font={{ variation: FontVariation.H5 }} icon={icon} iconProps={{ margin: { right: 'small' } }}>
              {getString(label)}
            </Text>
          }
        />
      </Accordion>
    </Card>
  )
}
export default SettingsCategorySection
