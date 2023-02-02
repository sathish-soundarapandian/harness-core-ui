/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { RouteWithLayout } from '@common/router'
import SettingsList from '@default-settings/pages/SettingsList'
import routes from '@common/RouteDefinitions'

import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { AccountSideNavProps } from '@common/RouteDestinations'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { String, useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/helper'
import DefaultSettingsFactory from './factories/DefaultSettingsFactory'
import { SettingType } from './interfaces/SettingType.types'
import {
  DefaultSettingCheckBoxWithTrueAndFalse,
  DefaultSettingDurationField,
  DefaultSettingNumberTextbox,
  DefaultSettingRadioBtnWithTrueAndFalse
} from './components/ReusableHandlers'

DefaultSettingsFactory.registerCategory('CORE', {
  icon: 'cog',
  label: 'common.settingCategory.general',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ce', 'cf', 'chaos', 'ci', 'cv', 'code', 'sto']
})

DefaultSettingsFactory.registerCategory('CONNECTORS', {
  icon: 'cog',
  label: 'connectorsLabel',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ce', 'cf', 'chaos', 'ci', 'cv', 'code', 'sto']
})

DefaultSettingsFactory.registerCategory('GIT_EXPERIENCE', {
  icon: 'cog',
  label: 'authSettings.cdCommunityPlan.communityPlanStrings.item5',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ce', 'cf', 'chaos', 'ci', 'cv', 'code', 'sto']
})

DefaultSettingsFactory.registerCategory('PMS', {
  icon: 'cog',
  label: 'common.pipeline',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ci']
})

DefaultSettingsFactory.registerSettingHandler(SettingType.DISABLE_HARNESS_BUILT_IN_SECRET_MANAGER, {
  label: 'common.accountSetting.connector.disableBISMHeading',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CONNECTORS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.MANDATE_CUSTOM_WEBHOOK_AUTHORIZATION, {
  label: 'defaultSettings.mandateAuthorizationForCustomWebhookTriggers',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_GIT_COMMANDS, {
  label: 'defaultSettings.enableGitCommands',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'GIT_EXPERIENCE'
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
  labelSingular: 'common.singularLabels.defaultSetting',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CORE_SETTING]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CORE_SETTING]: <String stringID="rbac.permissionLabels.createEdit" />
  }
})

DefaultSettingsFactory.registerSettingHandler(SettingType.WEBHOOK_GITHUB_TRIGGERS_AUTHENTICATION, {
  label: 'defaultSettings.mandateWebhookSecretsGithubTriggers',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
})

export default function DefaultSettingsRoutes(): React.ReactElement {
  const { PL_FORCE_DELETE_CONNECTOR_SECRET, PIE_PIPELINE_SETTINGS_ENFORCEMENT_LIMIT } = useFeatureFlags()
  const { getString } = useStrings()
  // Register  Category Factory only when Feature Flag is enabled
  if (PL_FORCE_DELETE_CONNECTOR_SECRET) {
    DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_FORCE_DELETE, {
      label: 'defaultSettings.enableForceDelete',
      settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
      yupValidation: Yup.boolean(),
      settingCategory: 'CORE'
    })
  }

  if (PIE_PIPELINE_SETTINGS_ENFORCEMENT_LIMIT) {
    DefaultSettingsFactory.registerSettingHandler(SettingType.PIPELINE_TIMEOUT, {
      label: 'defaultSettings.pipelineTimeout',
      settingRenderer: props => <DefaultSettingDurationField {...props} />,
      yupValidation: getDurationValidationSchema().required(getString('validation.timeout10SecMinimum')),
      settingCategory: 'PMS'
    })

    DefaultSettingsFactory.registerSettingHandler(SettingType.STAGE_TIMEOUT, {
      label: 'defaultSettings.stageTimeout',
      settingRenderer: props => <DefaultSettingDurationField {...props} />,
      yupValidation: getDurationValidationSchema().required(getString('validation.timeout10SecMinimum')),
      settingCategory: 'PMS'
    })

    DefaultSettingsFactory.registerSettingHandler(SettingType.STEP_TIMEOUT, {
      label: 'defaultSettings.stepTimeout',
      settingRenderer: props => <DefaultSettingDurationField {...props} />,
      yupValidation: getDurationValidationSchema().required(getString('validation.timeout10SecMinimum')),
      settingCategory: 'PMS'
    })

    DefaultSettingsFactory.registerSettingHandler(SettingType.CONCURRENT_ACTIVE_PIPELINE_EXECUTIONS, {
      label: 'defaultSettings.concurrentActivePipelineExecutions',
      settingRenderer: props => <DefaultSettingNumberTextbox {...props} />,
      settingCategory: 'PMS'
    })
  }

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
