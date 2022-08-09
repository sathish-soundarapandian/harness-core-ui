import {
  Accordion,
  Card,
  getErrorInfoFromErrorObject,
  useToaster,
  Text,
  FontVariation,
  Container,
  Icon
} from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { getSettingsListPromise, SettingDTO, SettingRequestDTO } from 'services/cd-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { SettingCategory, SettingType, SettingYupValidation } from '../interfaces/SettingType.types'
import SettingCategorySectionContents from './SettingCategorySectionContents'
import css from './SettingsCategorySection.module.scss'

interface SettingsCategorySectionProps {
  settingCategory: SettingCategory
  onSettingChange: (
    settingType: SettingType,
    settingDTO: SettingDTO,
    updateType: SettingRequestDTO['updateType']
  ) => void
  settingErrorMessages: Map<SettingType, string>
  updateValidationSchema: (val: SettingYupValidation) => void
}
interface UpdateSettingValue {
  updateType: 'UPDATE' | 'RESTORE'
  checked?: boolean
  settingType: SettingType
  val?: string
  action: 'Override' | 'SettingChange' | 'Restore'
}
const SettingsCategorySection: React.FC<SettingsCategorySectionProps> = ({
  settingCategory,
  onSettingChange,
  settingErrorMessages,
  updateValidationSchema
}) => {
  const { setFieldValue } = useFormikContext()

  const settingCategoryHandler = DefaultSettingsFactory.getCategoryHandler(settingCategory)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & ModulePathParams>()
  const [isCateogryOpen, updateIsCateogryOpen] = useState<boolean>(false)
  const { getString } = useStrings()

  const [categoryAllSettings, updateCategoryAllSettings] = useState<Map<SettingType, SettingDTO>>(new Map())

  const [refinedSettingTypes, updateSettingTypes] = useState<Set<SettingType>>(new Set())

  const { showError } = useToaster()
  const [loadingSettingTypes, updateLoadingSettingTypes] = useState(false)
  const categorySectionOpen = async () => {
    if (!refinedSettingTypes.size) {
      updateLoadingSettingTypes(true)
      try {
        const data = await getSettingsListPromise({
          queryParams: { accountIdentifier: accountId, category: settingCategory, orgIdentifier, projectIdentifier }
        })
        const refinedSettingTypesTemp: Set<SettingType> = new Set()
        const categorySettings = new Map()
        const validationsSchema: SettingYupValidation = {}
        data?.data?.forEach(val => {
          const registeredSettingsOnUI = DefaultSettingsFactory.getCategorySettingsList(settingCategory)
          categorySettings.set(val.setting.identifier as SettingType, val.setting)
          setFieldValue(val.setting.identifier, val.setting.value)
          validationsSchema[val.setting.identifier as SettingType] = DefaultSettingsFactory.getYupValidationForSetting(
            val.setting.identifier as SettingType
          )
          if (registeredSettingsOnUI?.has(val.setting.identifier as SettingType)) {
            refinedSettingTypesTemp.add(val.setting.identifier as SettingType)
          }
        })
        updateCategoryAllSettings(categorySettings)
        updateValidationSchema(validationsSchema)
        updateSettingTypes(refinedSettingTypesTemp)
      } catch (error) {
        showError(getErrorInfoFromErrorObject(error))
      } finally {
        updateLoadingSettingTypes(false)
      }
    }
  }
  const updateChangedSettingLocal = (settingType: SettingType, settingTypeDTO: SettingDTO) => {
    const changedSetting = new Map()
    changedSetting.set(settingType, settingTypeDTO)
    updateCategoryAllSettings(new Map([...categoryAllSettings, ...changedSetting]))
  }
  const updateValueInSetting = ({ checked, settingType, updateType, val, action }: UpdateSettingValue): void => {
    let selectedSettingTypeDTO = categoryAllSettings.get(settingType)
    if (selectedSettingTypeDTO) {
      switch (action) {
        case 'SettingChange':
          {
            selectedSettingTypeDTO = {
              ...selectedSettingTypeDTO,
              value: val
            }
          }
          break
        case 'Override':
          {
            selectedSettingTypeDTO = {
              ...selectedSettingTypeDTO,
              allowOverrides: !!checked
            }
          }
          break
        case 'Restore':
          {
            selectedSettingTypeDTO = {
              ...selectedSettingTypeDTO,
              value: selectedSettingTypeDTO.defaultValue
            }
            setFieldValue(settingType, selectedSettingTypeDTO.defaultValue)
          }
          break
      }
      onSettingChange(settingType, selectedSettingTypeDTO, updateType)
      updateChangedSettingLocal(settingType, selectedSettingTypeDTO)
    }
  }

  const onSelectionChange = (settingType: SettingType, val: string) => {
    updateValueInSetting({ action: 'SettingChange', updateType: 'UPDATE', settingType, val })
  }

  const onAllowOverride = (checked: boolean, settingType: SettingType) => {
    updateValueInSetting({ action: 'Override', updateType: 'UPDATE', settingType, checked })
  }

  const onRestore = (settingType: SettingType) => {
    updateValueInSetting({ action: 'Restore', updateType: 'RESTORE', settingType })
  }

  if (!settingCategoryHandler) {
    return null
  }
  const { label, icon } = settingCategoryHandler

  return (
    <Card className={css.summaryCard}>
      <Accordion
        summaryClassName={cx(css.summarySetting, isCateogryOpen && css.summarySettingBackGround)}
        detailsClassName={css.detailSettings}
        panelClassName={css.panelClassName}
        onChange={openTabId => {
          if (openTabId) {
            updateIsCateogryOpen(true)
            categorySectionOpen()
          } else {
            updateIsCateogryOpen(false)
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
            ) : refinedSettingTypes.size ? (
              <SettingCategorySectionContents
                settingCategory={settingCategory}
                categoryAllSettings={categoryAllSettings}
                onSelectionChange={onSelectionChange}
                onRestore={onRestore}
                onAllowOverride={onAllowOverride}
                settingsSet={refinedSettingTypes}
                settingErrorMessages={settingErrorMessages}
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
