import {
  Accordion,
  Card,
  getErrorInfoFromErrorObject,
  useToaster,
  Text,
  FontVariation,
  Container,
  Icon,
  Color
} from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { getSettingsListPromise, SettingDTO, SettingRequestDTO, SettingResponseDTO } from 'services/cd-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { SettingCategory, SettingType, SettingYupValidation } from '../interfaces/SettingType'
import SettingCategorySectionContents from './SettingCategorySectionContents'
import css from './SettingsCategorySection.module.scss'

interface SettingsCategorySectionProps {
  settingCategory: SettingCategory
  onSettingChange: (
    settingType: SettingType,
    settingDTO: SettingDTO,
    updateType: SettingRequestDTO['updateType']
  ) => void
  updateAllSettings: (settings: Map<SettingType, SettingDTO>) => void
  allSettings: Map<SettingType, SettingDTO>
  settingErrorMessages: Map<SettingType, string>
  updateValidationSchema: (val: SettingYupValidation) => void
}

const SettingsCategorySection: React.FC<SettingsCategorySectionProps> = ({
  settingCategory,
  onSettingChange,
  settingErrorMessages,
  updateValidationSchema,
  allSettings,
  updateAllSettings
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
  const [allSettingDTO, updateAllSettingDTO] = useState<Map<SettingType, SettingDTO>>(new Map())
  const categorySectionOpen = async () => {
    if (!settingTypes.size) {
      updateLoadingSettingTypes(true)
      try {
        const data = await getSettingsListPromise({
          queryParams: { accountIdentifier: accountId, category: settingCategory, orgIdentifier, projectIdentifier }
        })
        const settingTypesTemp: Set<SettingType> = new Set()
        const refiedSettingTypesWithDTOLocal: { [Key in SettingType]?: SettingResponseDTO } = {}
        const categorySettings = new Map()
        const validationsSchema: SettingYupValidation = {}
        data?.data?.forEach(val => {
          refiedSettingTypesWithDTOLocal[val.setting.identifier as SettingType] = val
          categorySettings.set(val.setting.identifier as SettingType, val.setting)
          setFieldValue(val.setting.identifier, val.setting.value)
          validationsSchema[val.setting.identifier as SettingType] = DefaultSettingsFactory.getYupValidationForSetting(
            val.setting.identifier as SettingType
          )

          settingTypesTemp.add(val.setting.identifier as SettingType)
        })
        updateAllSettings(categorySettings)
        updateAllSettingDTO(categorySettings)
        updateValidationSchema(validationsSchema)
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
  const updateChagnedSettingLocal = (settingType: SettingType, settingTypeDTO: SettingDTO) => {
    const changedSetting = new Map()
    changedSetting.set(settingType, settingTypeDTO)
    updateAllSettings(changedSetting)
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

        const oldSettingDTO = allSettingDTO.get(settingType)
        if (oldSettingDTO) {
          oldSettingDTO.value = val
          updateChagnedSettingLocal(settingType, oldSettingDTO)
        }
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

        const oldSettingDTO = allSettingDTO.get(settingType)
        if (oldSettingDTO) {
          oldSettingDTO.allowOverrides = checked
          updateChagnedSettingLocal(settingType, oldSettingDTO)
        }
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
        const oldSettingDTO = allSettingDTO.get(settingType)
        if (oldSettingDTO) {
          oldSettingDTO.value = defaultValue
          updateChagnedSettingLocal(settingType, oldSettingDTO)
        }
      }
    }
  }

  return (
    <Card className={css.summaryCard}>
      <Accordion
        summaryClassName={css.summarySetting}
        detailsClassName={css.detailSettings}
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
              <Container flex={{ justifyContent: 'center' }}>
                <Icon name="spinner" size={30} />
              </Container>
            ) : settingTypes.size ? (
              <SettingCategorySectionContents
                allSettings={allSettings}
                onSelectionChange={onSelectionChange}
                onRestore={onRestore}
                onAllowOverride={onAllowOverride}
                settingsTypesSet={settingTypes}
                settingTypesResponseDTO={refiedSettingTypesWithDTO}
                settingErrorMessages={settingErrorMessages}
                registeredGroupedSettings={registeredGroupedSettings}
              />
            ) : (
              <Container flex={{ justifyContent: 'center' }}>
                <Text font={{ variation: FontVariation.BODY2 }}>{getString('defaultSettings.noSettingToDisplay')}</Text>
              </Container>
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
