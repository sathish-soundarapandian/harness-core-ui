import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { useStrings } from 'framework/strings'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { Scope } from '@common/interfaces/SecretsInterface'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingDTO } from 'services/cd-ng'
import css from './SettingsList.module.scss'
import type { SettingCategory } from '../interfaces/SettingType'
import type { SettingCategoryHandler } from '../factories/DefaultSettingsFactory'
import SettingsCategorySection from '../components/SettingsCategorySection'
const SettingsList = () => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()

  const defaultSettingsCategory: SettingCategory[] = DefaultSettingsFactory.getSettingCategoryNamesList()
  const onSettingChange = (settingDTO: SettingDTO) => {
    console.log({ settingDTO })
  }
  const saveSettings = () => {
    console.log('setting saved')
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
      <Page.Body>
        <Layout.Vertical>
          {defaultSettingsCategory.map(key => {
            return <SettingsCategorySection settingCategory={key} onSettingChange={onSettingChange} />
          })}
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default SettingsList
