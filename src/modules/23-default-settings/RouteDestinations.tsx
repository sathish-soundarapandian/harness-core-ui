/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RouteWithLayout } from '@common/router'
import SettingsList from '@default-settings/pages/SettingsList'
import routes from '@common/RouteDefinitions'

import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { AccountSideNavProps } from '@common/RouteDestinations'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import AuditTrailFactory, { ResourceScope } from '@audit-trail/factories/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { String } from 'framework/strings'
import DefaultSettingsFactory from './factories/DefaultSettingsFactory'
import { SettingGroups, SettingType } from './interfaces/SettingType.types'
import {
  DefaultSettingCheckBoxWithTrueAndFalse,
  DefaultSettingNumberTextbox,
  DefaultSettingRadioBtnWithTrueAndFalse,
  DefaultSettingStringDropDown,
  DefaultSettingTextbox
} from './components/ReusableHandlers'

DefaultSettingsFactory.registerCategory('CI', {
  icon: 'ci-main',
  label: 'common.purpose.ci.continuous',
  settingsAndGroupDisplayOrder: [SettingGroups.group_1, SettingGroups.group_2, SettingType.test_setting_CI_7],
  modulesWhereCategoryWillBeDisplayed: ['ci']
})
DefaultSettingsFactory.registerCategory('CORE', {
  icon: 'cv-main',
  label: 'common.module.core',
  settingsAndGroupDisplayOrder: [SettingGroups.group_1, SettingGroups.group_2, SettingType.test_setting_CI_7],
  modulesWhereCategoryWillBeDisplayed: ['ci', 'cd']
})
DefaultSettingsFactory.registerCategory('CD', {
  icon: 'cd-main',
  label: 'common.purpose.cd.continuous',
  settingsAndGroupDisplayOrder: [
    SettingType.test_setting_CD_1,
    SettingType.test_setting_CD_2,
    SettingType.test_setting_CD_3
  ],
  modulesWhereCategoryWillBeDisplayed: ['cd']
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CD_1, {
  label: 'defaultSettings.test_setting_CD_1',
  settingCategory: 'CD',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CD_2, {
  label: 'defaultSettings.test_setting_CD_2',
  settingCategory: 'CD',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CD_3, {
  label: 'defaultSettings.test_setting_CD_3',
  settingCategory: 'CD',
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_1, {
  label: 'defaultSettings.test_setting_CI_1',
  settingCategory: 'CI',

  groupId: SettingGroups.group_1,
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_2, {
  label: 'defaultSettings.test_setting_CI_2',
  settingCategory: 'CI',

  groupId: SettingGroups.group_1,
  settingRenderer: props => <DefaultSettingNumberTextbox {...props} />
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_3, {
  label: 'defaultSettings.test_setting_CI_3',
  settingCategory: 'CI',

  groupId: SettingGroups.group_1,
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_4, {
  label: 'defaultSettings.test_setting_CI_4',
  settingCategory: 'CI',

  groupId: SettingGroups.group_2,
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_5, {
  label: 'defaultSettings.test_setting_CI_5',
  settingCategory: 'CI',
  groupId: SettingGroups.group_2,
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_6, {
  label: 'defaultSettings.test_setting_CI_6',
  settingCategory: 'CI',

  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_7, {
  label: 'defaultSettings.test_setting_CI_7',
  settingCategory: 'CI',
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_disable_built_in_sm, {
  label: 'defaultSettings.test_setting_disable_built_in_sm',
  settingCategory: 'CORE',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />
})
DefaultSettingsFactory.registerGroupHandler(SettingGroups.group_1, {
  settingCategory: 'CI',
  groupName: 'common.advanced'
})
DefaultSettingsFactory.registerGroupHandler(SettingGroups.group_2, {
  settingCategory: 'CI',
  groupName: 'common.azure'
})
AuditTrailFactory.registerResourceHandler('SETTING', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: 'common.defaultSettings',
  resourceLabel: 'common.defaultSettings',
  resourceUrl: (_resource_: ResourceDTO, resourceScope: ResourceScope) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    return routes.toDefaultSettings({
      orgIdentifier,
      accountId: accountIdentifier,
      projectIdentifier
    })
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.SETTING, {
  icon: 'nav-settings',
  label: 'common.defaultSettings',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CORE_SETTING]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CORE_SETTING]: <String stringID="rbac.permissionLabels.createEdit" />
  }
})

export default function DefaultSettingsRoutes(): React.ReactElement {
  return (
    <>
      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routes.toDefaultSettings({ ...accountPathProps })}
        exact
      >
        <SettingsList />
      </RouteWithLayout>
    </>
  )
}
export const DefaultSettingsRouteDestinations: React.FC<{
  moduleParams: ModulePathParams
  licenseRedirectData?: LicenseRedirectProps
  sidebarProps?: SidebarContext
}> = ({ moduleParams, licenseRedirectData, sidebarProps }) => (
  <>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routes.toDefaultSettings({
        ...accountPathProps,
        ...projectPathProps,
        ...moduleParams
      })}
    >
      <SettingsList />
    </RouteWithLayout>
  </>
)
