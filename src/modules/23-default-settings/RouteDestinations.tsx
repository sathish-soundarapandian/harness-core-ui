import { RouteWithLayout } from '@common/router'
import React from 'react'
import SettingsList from '@default-settings/pages/SettingsList'
import routes from '@common/RouteDefinitions'

import { accountPathProps, projectPathProps, orgPathProps } from '@common/utils/routeUtils'
import { AccountSideNavProps } from '@common/RouteDestinations'
import DefaultSettingsFactory, { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingCategory } from '@default-settings/interfaces/SettingType'
import { SettingType } from './interfaces/SettingType'
import { FeatureFlag } from '@common/featureFlags'
import SettingTypeRow from './components/SettingTypeRow'
DefaultSettingsFactory.registerSettingCategory('CD', {
  icon: 'res-secrets',
  label: 'common.purpose.cd.continuous',
  settingTypes: new Set([SettingType.TEST_SETTING_ID, SettingType.TEST_SETTING_ID_2, SettingType.ACCOUNT])
})

const ExampleRenderer: React.FC<SettingRendererProps> = props => {
  console.log({ props })
  return (
    <>
      <input type="text" value={props.settingValue} />
      
    </>
  )
}
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.TEST_SETTING_ID, {
  label: 'connector',
  settingRenderer: props => (
    <ExampleRenderer
      identifier={props.identifier}
      onSettingSelectionChange={props.onSettingSelectionChange}
      onRestore={props.onRestore}
      settingValue={props.settingValue}

      //settingType={props.settingType}
    />
  )
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.TEST_SETTING_ID_2, {
  label: 'secretManagers',
  settingRenderer: props => (
    <ExampleRenderer
      identifier={props.identifier}
      onSettingSelectionChange={props.onSettingSelectionChange}
      onRestore={props.onRestore}
      settingValue={props.settingValue}
    />
  )
})
DefaultSettingsFactory.registerSettingTypeHandler(SettingType.ACCOUNT, {
  label: 'account',
  settingRenderer: props => (
    <ExampleRenderer
      identifier={props.identifier}
      onSettingSelectionChange={props.onSettingSelectionChange}
      onRestore={props.onRestore}
      settingValue={props.settingValue}
    />
  )
})
export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toDefaultSettings({ ...projectPathProps })} exact>
      <SettingsList />
    </RouteWithLayout>
  </>
)
