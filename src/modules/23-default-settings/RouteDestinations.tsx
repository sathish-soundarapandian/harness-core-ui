import React, { useEffect } from 'react'
import { isUndefined } from 'lodash-es'
import * as Yup from 'yup'
import { RouteWithLayout } from '@common/router'
import SettingsList from '@default-settings/pages/SettingsList'
import routes from '@common/RouteDefinitions'

import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { AccountSideNavProps } from '@common/RouteDestinations'
import DefaultSettingsFactory, { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { FeatureFlag } from '@common/featureFlags'
import {
  DefaultSettingNumberTextbox,
  DefaultSettingTextbox,
  DefaultSettingRadioBtnWithTrueAndFalse,
  DefaultSettingCheckBoxWithTrueAndFalse
} from './components/ReusableHandlers'
import { SettingGroups, SettingType } from './interfaces/SettingType'
DefaultSettingsFactory.registerSettingCategory('CD', {
  icon: 'cd-main',
  label: 'common.purpose.cd.continuous',
  settings: [
    {
      settingTypes: new Set([
        SettingType.test_setting_CD_1,
        SettingType.test_setting_CD_2,
        SettingType.test_setting_CD_3
      ])
    }
  ]
})
DefaultSettingsFactory.registerSettingCategory('CI', {
  icon: 'ci-main',
  label: 'common.purpose.ci.continuous',
  settings: [
    {
      settingTypes: new Set([SettingType.test_setting_CI_6, SettingType.test_setting_CI_7])
    },
    {
      groupId: SettingGroups.group_1,
      groupName: 'addStepGroup',
      settingTypes: new Set([
        SettingType.test_setting_CI_5,
        SettingType.test_setting_CI_2,
        SettingType.test_setting_CI_3
      ])
    },
    {
      groupId: SettingGroups.group_2,
      groupName: 'auditTrail.delegateGroups',
      settingTypes: new Set([SettingType.test_setting_CI_5, SettingType.test_setting_CI_4])
    }
  ]
})
DefaultSettingsFactory.registerSettingCategory('CORE', {
  icon: 'access-control',
  label: 'account',
  settings: [
    {
      settingTypes: new Set([
        SettingType.TEST_SETTING_ID,
        SettingType.TEST_SETTING_ID_2,
        SettingType.TEST_SETTING_CI,
        SettingType.ACCOUNT,
        SettingType.TEST_SETTING_CI,
        SettingType.test_setting_CD_1,
        SettingType.test_setting_CD_2,
        SettingType.test_setting_CD_3,
        SettingType.test_setting_CORE_1,
        SettingType.test_setting_CORE_2
      ])
    }
  ]
})

DefaultSettingsFactory.registerSettingTypeHandler(SettingType.TEST_SETTING_ID, {
  label: 'connector',
  settingRenderer: props => (
    <DefaultSettingTextbox
      {...props}

      //settingType={props.settingType}
    />
  ),
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.TEST_SETTING_ID_2, {
  label: 'secretManagers',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_3, {
  label: 'secretType',
  settingRenderer: props => <DependendentValues {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_4, {
  label: 'secrets.confirmDelete',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_5, {
  label: 'secrets.createSSHCredWizard.btnVerifyConnection',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_6, {
  label: 'secrets.createSSHCredWizard.titleAuth',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})

DefaultSettingsFactory.registerSettingTypeHandler(SettingType.ACCOUNT, {
  label: 'account',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CORE_1, {
  label: 'common.accountSetting.connector.disableBISMHeading',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})

const DependendentValues: React.FC<SettingRendererProps> = ({
  allSettings,
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
      <span>Depeneedent</span>
      <DefaultSettingTextbox setFieldValue={setFieldValue} {...otherProps} allSettings={allSettings} />
    </span>
  )
}

DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CORE_2, {
  label: 'pipeline.ACR.name',
  settingRenderer: props => <DependendentValues {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CD_1, {
  label: 'orgLabel',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
  featureFlag: FeatureFlag.NG_SETTINGS_1
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CD_2, {
  label: 'projectLabel',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CD_3, {
  label: 'summary',
  settingRenderer: props => <DefaultSettingNumberTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.TEST_SETTING_CI, {
  label: 'abort',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_2, {
  label: 'dashboardLabel',
  settingRenderer: props => <DefaultSettingNumberTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_7, {
  label: 'secrets.createSSHCredWizard.validateKeypath',
  settingRenderer: props => <DefaultSettingTextbox {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
})
export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toDefaultSettings({ ...accountPathProps })} exact>
      <SettingsList />
    </RouteWithLayout>
  </>
)
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
