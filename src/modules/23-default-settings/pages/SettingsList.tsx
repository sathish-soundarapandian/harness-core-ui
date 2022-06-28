import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { useStrings } from 'framework/strings'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Accordion, Card, Layout } from '@harness/uicore'
import { Scope } from '@common/interfaces/SecretsInterface'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { useGetSettingsList } from 'services/cd-ng'
import css from './SettingsList.module.scss'
const SettingsList = () => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { response, data } = useGetSettingsList({ category: 'CD', queryParams: { accountIdentifier: accountId } })
  response?.json().then(val => console.log(val, data?.data))
  const defaultSettingsCategory = DefaultSettingsFactory.getSettingCategoryList2()
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
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
      />
      <Page.Body>
        <Layout.Vertical>
          {Array.from(defaultSettingsCategory.values()).map(val => {
            return (
              <Card>
                <Accordion className={css.summary}>
                  <Accordion.Panel details={val.label} id={val.label} summary={getString(val.label)} />
                </Accordion>
              </Card>
            )
          })}
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default SettingsList
