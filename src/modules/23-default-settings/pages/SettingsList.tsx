import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { useStrings } from 'framework/strings'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { Scope } from '@common/interfaces/SecretsInterface'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { SettingDTO, SettingRequestDTO, updateSettingValuePromise, useUpdateSettingValue } from 'services/cd-ng'
import css from './SettingsList.module.scss'
import type { SettingCategory, SettingType } from '../interfaces/SettingType'
import type { SettingCategoryHandler } from '../factories/DefaultSettingsFactory'
import SettingsCategorySection from '../components/SettingsCategorySection'
const SettingsList = () => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  //const [savingSettingInProgress, updateSavingSettingInProgress] = useState<boolean>(false)
  const defaultSettingsCategory: SettingCategory[] = DefaultSettingsFactory.getSettingCategoryNamesList()
  const [changedSettings, updateChangedSettings] = useState<Map<SettingType, SettingRequestDTO>>(new Map())
  const onSettingChange = (
    settingType: SettingType,
    settingDTO: SettingDTO,
    updateType: SettingRequestDTO['updateType']
  ) => {
    const exisitingChangedSettings = changedSettings
    const { allowOverrides, identifier, value } = settingDTO
    exisitingChangedSettings.set(settingType, { allowOverrides, updateType, identifier, value })
    console.log({ exisitingChangedSettings })
    updateChangedSettings(exisitingChangedSettings)
  }
  const { loading: savingSettingInProgress, mutate: updateSettingValue } = useUpdateSettingValue({
    queryParams: { projectIdentifier: projectIdentifier, accountIdentifier: accountId, orgIdentifier }
  })
  const saveSettings = () => {
    //updateSavingSettingInProgress(true)
    console.log(Array.from(changedSettings.values()))
    if (true) {
      updateSettingValue(Array.from(changedSettings.values()))
        .then(data => {
          console.log(data)
        })
        .finally(() => {
          //updateSavingSettingInProgress(false)
        })
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
        toolbar={<Button text={getString('save')} variation={ButtonVariation.PRIMARY} onClick={saveSettings} />}
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
            return <SettingsCategorySection settingCategory={key} onSettingChange={onSettingChange} />
          })}
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default SettingsList
