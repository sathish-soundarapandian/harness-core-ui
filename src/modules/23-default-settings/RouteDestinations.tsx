import React, { useEffect } from 'react'
import * as Yup from 'yup'
import { isUndefined } from 'lodash-es'
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
import DefaultSettingsFactory, {SettingRendererProps} from './factories/DefaultSettingsFactory'
import { SettingType, SettingGroups, SettingCategory, SettingYupValidation } from './interfaces/SettingType.types'
import {DefaultSettingTextbox, DefaultSettingNumberTextbox, DefaultSettingStringDropDown, DefaultSettingRadioBtnWithTrueAndFalseProps, DefaultSettingCheckBoxWithTrueAndFalse, DefaultSettingRadioBtnWithTrueAndFalse} from './components/ReusableHandlers'

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

RbacFactory.registerResourceTypeHandler(ResourceType.DEFAULT_SETTINGS, {
  icon: 'nav-settings',
  label: 'common.defaultSettings',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CORE_SETTING]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_CORE_SETTING]: <String stringID="rbac.permissionLabels.createEdit" />
  }
})

export default function DefaultSettingsRoutes(): React.ReactElement {

  DefaultSettingsFactory.registerCategory('CD', {
    icon: 'cd-main',
    label: 'common.purpose.cd.continuous',
    settingsAndGroupDisplayOrder: [
      SettingType.test_setting_CD_1,
      SettingType.test_setting_CD_2,
      SettingType.test_setting_CD_3
    ]
  })

DefaultSettingsFactory.registerCategory('CI', {
  icon: 'ci-main',
  label: 'common.purpose.ci.continuous',
  settingsAndGroupDisplayOrder: [
    SettingType.test_setting_CI_6,
    SettingGroups.group_1,
    SettingGroups.group_2,
    SettingType.test_setting_CI_7
  ]
})

DefaultSettingsFactory.registerGroupHandler(SettingGroups.group_1, {
  groupName: 'addStepGroup',
  settingCategory: 'CI',
  settingsDisplayOrder: [SettingType.test_setting_CI_1, SettingType.test_setting_CI_2, SettingType.test_setting_CI_3]
})
DefaultSettingsFactory.registerGroupHandler(SettingGroups.group_2, {
  groupName: 'auditTrail.delegateGroups',
  settingCategory: 'CI',
  settingsDisplayOrder: [SettingType.test_setting_CI_4, SettingType.test_setting_CI_5]
})

DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_1, {
  label: 'secretType',
  settingRenderer: props => <DependendentValues {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
  settingCategory: 'CI',
  groupId: SettingGroups.group_1
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_2, {
  label: 'secrets.confirmDelete',
  settingRenderer: props => <DefaultSettingNumberTextbox {...props} />,
  yupValidation: Yup.number().required('Required'),
  settingCategory: 'CI',
  groupId: SettingGroups.group_1
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_3, {
  label: 'secrets.createSSHCredWizard.btnVerifyConnection',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean().required('Required'),
  settingCategory: 'CI',
  groupId: SettingGroups.group_1
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_4, {
  label: 'secrets.createSSHCredWizard.titleAuth',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().nullable().max(15, 'Must be 15 characters or less'),
  settingCategory: 'CI',
  groupId: SettingGroups.group_2
})

DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_5, {
  label: 'dashboardLabel',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
  settingCategory: 'CI',
  groupId: SettingGroups.group_2
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_6, {
  label: 'secrets.createSSHCredWizard.validateKeypath',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
  settingCategory: 'CI'
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_7, {
  label: 'secrets.createSSHCredWizard.validateKeypath',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
  settingCategory: 'CI'
})
// DefaultSettingsFactory.registerSettingHandler(SettingType.ACCOUNT, {
//   label: 'account',
//   settingRenderer: props => <DefaultSettingTextbox {...props} />,
//   yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
// })
// DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CORE_1, {
//   label: 'common.accountSetting.connector.disableBISMHeading',
//   settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
//   yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
// })

const DependendentValues: React.FC<SettingRendererProps> = ({
  categoryAllSettings: allSettings,
  setFieldValue,

  ...otherProps
}) => {
  const isEvenorOdd = (number: string | undefined) => {
    if (isUndefined(number)) {
      return ''
    }

    return parseInt(number) % 2 ? 'Odd' : 'Even'
  }

  useEffect(() => {
    setFieldValue(otherProps.identifier, isEvenorOdd(allSettings.get(SettingType.test_setting_CI_2)?.value))
  }, [allSettings.get(SettingType.test_setting_CI_2)?.value])
  return (
    <span>
      <span>Dependent Value</span>
      <DefaultSettingTextbox setFieldValue={setFieldValue} {...otherProps} categoryAllSettings={allSettings} />
    </span>
  )
}

DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CD_1, {
  label: 'orgLabel',
  settingCategory: 'CD',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean().required('Required')
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CD_2, {
  label: 'projectLabel',
  settingCategory: 'CD',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  yupValidation: Yup.number().required('Required')
})
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CD_3, {
  label: 'summary',
  settingCategory: 'CD',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})


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
