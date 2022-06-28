import { RouteWithLayout } from '@common/router'
import React from 'react'
import SettingsList from '@default-settings/pages/SettingsList'
import routes from '@common/RouteDefinitions'

import { accountPathProps, projectPathProps, orgPathProps } from '@common/utils/routeUtils'
import { AccountSideNavProps } from '@common/RouteDestinations'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { SettingCategory } from '@default-settings/interfaces/SettingType'
DefaultSettingsFactory.registerSettingCategory(SettingCategory.CD, {
  icon: 'res-secrets',
  label: 'common.purpose.cd.continuous'
})
DefaultSettingsFactory.registerSettingCategory(SettingCategory.SECRET_MANAGER_2, {
  icon: 'res-secrets',
  label: 'secretManagers'
})
export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toDefaultSettings({ ...projectPathProps })} exact>
      <SettingsList />
    </RouteWithLayout>
  </>
)
