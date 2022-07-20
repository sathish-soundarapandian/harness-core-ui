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
import { SettingCategory, SettingType } from '../interfaces/SettingType'
import SettingCategorySectionContents from './SettingCategorySectionContents'
import css from './SettingsCategorySection.module.scss'
import { useFormikContext } from 'formik'

import * as Yup from 'yup'
interface SettingsCategorySectionProps {
  settingCategory: SettingCategory
  onSettingChange: (
    settingType: SettingType,
    settingDTO: SettingDTO,
    updateType: SettingRequestDTO['updateType']
  ) => void
  otherSettingsWhichAreChanged: Map<SettingType, SettingRequestDTO>
  settingErrorMessages: Map<SettingType, string>
  updateValidationSchema: (val: Yup.ObjectSchema<object | undefined>) => void
}

const SettingsCategorySection: React.FC<SettingsCategorySectionProps> = ({
  settingCategory,
  onSettingChange,
  otherSettingsWhichAreChanged,
  settingErrorMessages,
  updateValidationSchema
}) => {
  const { initialValues, setFieldValue } = useFormikContext()

  const settingCategoryHandler = DefaultSettingsFactory.getSettingCategoryHandler(settingCategory)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & ModulePathParams>()

  const { getString } = useStrings()
  if (!settingCategoryHandler) return null
  const { label, settings: registeredGroupedSettings, featureFlag, icon } = settingCategoryHandler
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

        const valid: any = {}
        data?.data?.forEach(val => {
          refiedSettingTypesWithDTOLocal[val.setting.identifier as SettingType] = val
          setFieldValue(val.setting.identifier, val.setting.value)
          valid[val.setting.identifier] = Yup.string().max(15, 'Must be 15 characters or less').required('Required')
          settingTypesTemp.add(val.setting.identifier as SettingType)
        })

        updateValidationSchema(valid)
        console.log({ initialValues })
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
        setFieldValue(settingType, defaultValue)
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
                registeredGroupedSettings={registeredGroupedSettings}
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
