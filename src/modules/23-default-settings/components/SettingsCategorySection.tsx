/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Accordion, Card, getErrorInfoFromErrorObject, useToaster, Text, Container, Icon } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React, { useEffect, useState } from 'react'
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
  savedSettings: Map<SettingType, SettingDTO>
}
interface UpdateSettingValue {
  updateType: 'UPDATE' | 'RESTORE'
  checked?: boolean
  settingType: SettingType
  val?: string
  action: 'OVERRIDE' | 'SETTINGCHANGE' | 'RESTORE'
}
const SettingsCategorySection: React.FC<SettingsCategorySectionProps> = ({
  settingCategory,
  onSettingChange,
  settingErrorMessages,
  updateValidationSchema,
  savedSettings
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
  useEffect(() => {
    let settingsChanged = false
    const categoryAllSettingsLocal: Map<SettingType, SettingDTO> = new Map(categoryAllSettings)
    savedSettings.forEach((value, key) => {
      if (categoryAllSettings.has(key)) {
        categoryAllSettingsLocal.set(key, value)
        settingsChanged = true
      }
    })
    if (settingsChanged) {
      updateCategoryAllSettings(categoryAllSettingsLocal)
    }
  }, [savedSettings])
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
        case 'SETTINGCHANGE':
          {
            selectedSettingTypeDTO = {
              ...selectedSettingTypeDTO,
              value: val
            }
          }
          break
        case 'OVERRIDE':
          {
            selectedSettingTypeDTO = {
              ...selectedSettingTypeDTO,
              allowOverrides: !!checked
            }
          }
          break
        case 'RESTORE':
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
    updateValueInSetting({ action: 'SETTINGCHANGE', updateType: 'UPDATE', settingType, val })
  }

  const onAllowOverride = (checked: boolean, settingType: SettingType) => {
    updateValueInSetting({ action: 'OVERRIDE', updateType: 'UPDATE', settingType, checked })
  }

  const onRestore = (settingType: SettingType) => {
    updateValueInSetting({ action: 'RESTORE', updateType: 'RESTORE', settingType })
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
