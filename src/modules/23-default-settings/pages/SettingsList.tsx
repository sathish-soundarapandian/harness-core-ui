import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, getErrorInfoFromErrorObject, Layout, useToaster } from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { useStrings } from 'framework/strings'
import { Scope } from '@common/interfaces/SecretsInterface'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { SettingDTO, SettingRequestDTO, useUpdateSettingValue } from 'services/cd-ng'
import type { SettingCategory, SettingType } from '../interfaces/SettingType'
import SettingsCategorySection from '../components/SettingsCategorySection'
import css from './SettingsList.module.scss'
const SettingsList = () => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  //const [savingSettingInProgress, updateSavingSettingInProgress] = useState<boolean>(false)
  const defaultSettingsCategory: SettingCategory[] = DefaultSettingsFactory.getSettingCategoryNamesList()
  const [changedSettings, updateChangedSettings] = useState<Map<SettingType, SettingRequestDTO>>(new Map())
  const [settingErrrorMessage, updateSettingErrrorMessage] = useState<Map<SettingType, string>>(new Map())
  const [disableSave, updateDisableSave] = useState<boolean>(true)
  const { showError } = useToaster()
  const onSettingChange = (
    settingType: SettingType,
    settingDTO: SettingDTO,
    updateType: SettingRequestDTO['updateType']
  ) => {
    if (disableSave) {
      updateDisableSave(false)
    }
    const exisitingChangedSettings = new Map(changedSettings)
    const { allowOverrides, identifier, value } = settingDTO
    exisitingChangedSettings.set(settingType, { allowOverrides, updateType, identifier, value })
    updateChangedSettings(exisitingChangedSettings)
  }
  const { loading: savingSettingInProgress, mutate: updateSettingValue } = useUpdateSettingValue({
    queryParams: { projectIdentifier: projectIdentifier, accountIdentifier: accountId, orgIdentifier }
  })
  const saveSettings = () => {
    updateSettingErrrorMessage(new Map())
    try {
      updateSettingValue(Array.from(changedSettings.values())).then(data => {
        const errorMap = new Map()
        data.data?.forEach(setting => {
          if (!setting.updateStatus && setting.errorMessage) {
            errorMap.set(setting.identifier, setting.errorMessage)
          }
        })
        updateSettingErrrorMessage(errorMap)
        if (!errorMap.size) {
          updateDisableSave(true)
        }
      })
    } catch (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }
  return (
    <>
      <Page.Header
        title={
          <ScopedTitle
            title={{
              [Scope.PROJECT]: getString('common.defaultSettings'),
              [Scope.ORG]: getString('common.defaultSettings'),
              [Scope.ACCOUNT]: getString('common.defaultSettings')
            }}
          />
        }
        toolbar={
          <Button
            text={getString('save')}
            disabled={disableSave}
            variation={ButtonVariation.PRIMARY}
            onClick={saveSettings}
          />
        }
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
      />
      {savingSettingInProgress && <Page.Spinner message={getString('secrets.secret.saving')}></Page.Spinner>}
      <Page.Body>
        <Layout.Vertical className={css.settingList}>
          {defaultSettingsCategory.map(key => {
            return (
              <SettingsCategorySection
                settingCategory={key}
                onSettingChange={onSettingChange}
                otherSettingsWhichAreChanged={changedSettings}
                settingErrorMessages={settingErrrorMessage}
              />
            )
          })}
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default SettingsList
