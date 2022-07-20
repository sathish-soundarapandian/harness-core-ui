import React, { useEffect, useState } from 'react'
import { isUndefined } from 'lodash'
import { RouteWithLayout } from '@common/router'
import SettingsList from '@default-settings/pages/SettingsList'
import routes from '@common/RouteDefinitions'

import { projectPathProps } from '@common/utils/routeUtils'
import { AccountSideNavProps } from '@common/RouteDestinations'
import DefaultSettingsFactory, { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import { SettingGroups, SettingType } from './interfaces/SettingType'
import {
  DefaultSettingStringDropDown,
  DefaultSettingNumberTextbox,
  DefaultSettingTextbox,
  DefaultSettingRadioBtnWithTrueAndFalse,
  DefaultSettingCheckBoxWithTrueAndFalse
} from './components/ReusableHandlers'
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
  )
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.TEST_SETTING_ID_2, {
  label: 'secretManagers',
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_3, {
  label: 'secretType',
  settingRenderer: props => <DependendentValues {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_4, {
  label: 'secrets.confirmDelete',
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_5, {
  label: 'secrets.createSSHCredWizard.btnVerifyConnection',
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_6, {
  label: 'secrets.createSSHCredWizard.titleAuth',
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})

DefaultSettingsFactory.registerSettingTypeHandler(SettingType.ACCOUNT, {
  label: 'account',
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CORE_1, {
  label: 'common.accountSetting.connector.disableBISMHeading',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />
})

const DependendentValues: React.FC<SettingRendererProps> = ({
  otherSettingsWhichAreChanged,
  setFieldValue,

  ...otherProps
}) => {
  const isEvenorOdd = (number: string | undefined) => {
    if (isUndefined(number)) {
      return ''
    }
    console.log({ number }, parseInt(number) % 2 ? 'Odd' : 'Even')

    return parseInt(number) % 2 ? 'Odd' : 'Even'
  }
  const [settingValue, updateSettingValue] = useState(
    isEvenorOdd(otherSettingsWhichAreChanged.get(SettingType.test_setting_CD_3)?.value)
  )
  useEffect(() => {
    console.log('otherSettingsWhichAreChanged', { otherSettingsWhichAreChanged })
    setFieldValue(
      otherProps.identifier,
      isEvenorOdd(otherSettingsWhichAreChanged.get(SettingType.test_setting_CI_2)?.value)
    )
  }, [otherSettingsWhichAreChanged.get(SettingType.test_setting_CI_2)?.value])
  return (
    <span>
      <span>Depeneedent</span>
      <DefaultSettingTextbox
        setFieldValue={setFieldValue}
        {...otherProps}
        otherSettingsWhichAreChanged={otherSettingsWhichAreChanged}
      />
    </span>
  )
}

DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CORE_2, {
  label: 'pipeline.ACR.name',
  settingRenderer: props => <DependendentValues {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CD_1, {
  label: 'orgLabel',
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CD_2, {
  label: 'projectLabel',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CD_3, {
  label: 'summary',
  settingRenderer: props => <DefaultSettingNumberTextbox {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.TEST_SETTING_CI, {
  label: 'abort',
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_2, {
  label: 'dashboardLabel',
  settingRenderer: props => <DefaultSettingNumberTextbox {...props} />
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CI_7, {
  label: 'secrets.createSSHCredWizard.validateKeypath',
  settingRenderer: props => <DefaultSettingTextbox {...props} />
})
export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toDefaultSettings({ ...projectPathProps })} exact>
      <SettingsList />
    </RouteWithLayout>
  </>
)
