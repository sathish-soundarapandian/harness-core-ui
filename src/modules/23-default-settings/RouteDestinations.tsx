/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { Color } from '@harness/design-system'
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
import { SettingType } from '@common/constants/Utils'
import DefaultSettingsFactory from './factories/DefaultSettingsFactory'
import { SettingGroups } from './interfaces/SettingType.types'
import {
  DefaultSettingCheckBoxWithTrueAndFalse,
  DefaultSettingDurationField,
  DefaultSettingNumberTextbox,
  DefaultSettingRadioBtnWithTrueAndFalse,
  DefaultSettingStringDropDown,
  DefaultSettingsToggle
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

DefaultSettingsFactory.registerCategory('CD', {
  icon: 'cd',
  label: 'common.purpose.cd.fullText',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ce', 'cf', 'chaos', 'ci', 'cv', 'code', 'sto'],
  settingsAndGroupDisplayOrder: [SettingType.EMAIL_TO_NON_HARNESS_USERS]
})

DefaultSettingsFactory.registerCategory('GIT_EXPERIENCE', {
  icon: 'git-experience-setting',
  iconProps: { color: Color.GREY_900, size: 16 },
  label: 'authSettings.cdCommunityPlan.communityPlanStrings.item5',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ce', 'cf', 'chaos', 'ci', 'cv', 'code', 'sto']
})

DefaultSettingsFactory.registerCategory('PMS', {
  icon: 'cog',
  label: 'common.pipeline',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ci']
})

DefaultSettingsFactory.registerCategory('CE', {
  icon: 'ccm-solid',
  label: 'common.purpose.ce.continuous',
  modulesWhereCategoryWillBeDisplayed: ['ce']
})

DefaultSettingsFactory.registerGroupHandler(SettingGroups.PERSPECTIVES_PREFERENCES, {
  groupName: 'defaultSettings.perspectivePreferences',
  settingCategory: 'CE',
  settingsDisplayOrder: [
    SettingType.SHOW_ANOMALIES,
    SettingType.SHOW_OTHERS,
    SettingType.SHOW_UNALLOCATED_CUSTER_COST,
    SettingType.INCLUDE_AWS_DISCOUNTS,
    SettingType.INCLUDE_AWS_CREDIT,
    SettingType.INCLUDE_AWS_REFUNDS,
    SettingType.INCLUDE_AWS_TAXES,
    SettingType.SHOW_AWS_COST_AS,
    SettingType.INCLUDE_AZURE_REFUNDS,
    SettingType.SHOW_AZURE_COST_AS,
    SettingType.INCLUDE_GCP_DISCOUNTS,
    SettingType.SHOW_GCP_COST_AS
  ]
})

DefaultSettingsFactory.registerSettingHandler(SettingType.EMAIL_TO_NON_HARNESS_USERS, {
  label: 'defaultSettings.emailToNonHarnessUsers',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'CD'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_ANOMALIES, {
  label: 'defaultSettings.showAnomalies',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_OTHERS, {
  label: 'defaultSettings.showOthers',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_UNALLOCATED_CUSTER_COST, {
  label: 'defaultSettings.showUnallocatedClusterCost',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_AWS_DISCOUNTS, {
  label: 'defaultSettings.awsIncludeDiscounts',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_AWS_CREDIT, {
  label: 'defaultSettings.awsIncludeCredit',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_AWS_REFUNDS, {
  label: 'defaultSettings.awsIncludeRefunds',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_AWS_TAXES, {
  label: 'defaultSettings.awsIncludeTaxes',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_AWS_COST_AS, {
  label: 'defaultSettings.showAwsCostAs',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  yupValidation: Yup.string(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_AZURE_REFUNDS, {
  label: 'defaultSettings.azureIncludeRefunds',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_AZURE_COST_AS, {
  label: 'defaultSettings.showAzureCostAs',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  yupValidation: Yup.string(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_GCP_DISCOUNTS, {
  label: 'defaultSettings.gcpIncludeDiscounts',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_GCP_TAXES, {
  label: 'defaultSettings.gcpIncludeTaxes',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_GCP_COST_AS, {
  label: 'defaultSettings.showGcpCostAs',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  yupValidation: Yup.string(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
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

DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_NODE_EXECUTION_AUDIT_EVENTS, {
  label: 'defaultSettings.enablePipelineExecutionAuditEvents',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ALLOW_USER_TO_MARK_STEP_AS_FAILED_EXPLICITLY, {
  label: 'defaultSettings.allowUserToMarkStepAsFailedExplicitly',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_GIT_COMMANDS, {
  label: 'defaultSettings.enableGitCommands',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'GIT_EXPERIENCE'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ALLOW_DIFFERENT_REPO_FOR_INPUT_SETS, {
  label: 'defaultSettings.allowDifferentRepoForInputSets',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'GIT_EXPERIENCE'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ENFORCE_GIT_EXPERIENCE, {
  label: 'defaultSettings.enforceGitExperience',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'GIT_EXPERIENCE'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_MATRIX_FIELD_NAME_SETTING, {
  label: 'defaultSettings.enableMatrixFieldNames',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
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
