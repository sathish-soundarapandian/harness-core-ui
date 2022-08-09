import React from 'react'
import * as Yup from 'yup'
import { SettingType, SettingGroups } from '@default-settings/pages/__test__/DefaultFactoryMock'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { DefaultSettingNumberTextbox, DefaultSettingTextbox } from '@default-settings/components/ReusableHandlers'
jest.mock('@default-settings/interfaces/SettingType.types', () => ({
  SettingType: SettingType,
  SettingGroups: SettingGroups
}))
describe('Default Settings Factory', () => {
  DefaultSettingsFactory.registerCategory('CI', {
    icon: 'ci-main',
    label: 'common.purpose.ci.continuous',
    settingsAndGroupDisplayOrder: [
      SettingType.test_setting_CI_6,
      SettingGroups.group_1,
      SettingGroups.group_2,
      SettingType.test_setting_CI_7
    ] as any
  })
  DefaultSettingsFactory.registerGroupHandler(SettingGroups.group_1 as any, {
    groupName: 'addStepGroup',
    settingCategory: 'CI',
    settingsDisplayOrder: [
      SettingType.test_setting_CI_2,
      SettingType.test_setting_CI_5,
      SettingType.test_setting_CI_3
    ] as any
  })
  DefaultSettingsFactory.registerGroupHandler(SettingGroups.group_2 as any, {
    groupName: 'auditTrail.delegateGroups',
    settingCategory: 'CI'
  })
  DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_3 as any, {
    label: 'secretType',
    settingRenderer: props => <DefaultSettingTextbox {...props} />,
    yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
    settingCategory: 'CI',
    groupId: SettingGroups.group_1 as any
  })
  DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_4 as any, {
    label: 'secrets.confirmDelete',
    settingRenderer: props => <DefaultSettingTextbox {...props} />,
    yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
    settingCategory: 'CI',
    groupId: SettingGroups.group_2 as any
  })
  DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_5 as any, {
    label: 'secrets.createSSHCredWizard.btnVerifyConnection',
    settingRenderer: props => <DefaultSettingTextbox {...props} />,
    yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
    settingCategory: 'CI',
    groupId: SettingGroups.group_1 as any
  })
  DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_6 as any, {
    label: 'secrets.createSSHCredWizard.titleAuth',
    settingRenderer: props => <DefaultSettingTextbox {...props} />,
    yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
    settingCategory: 'CI'
  })

  DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_2 as any, {
    label: 'dashboardLabel',
    settingRenderer: props => <DefaultSettingNumberTextbox {...props} />,
    yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
    settingCategory: 'CI',
    groupId: SettingGroups.group_1 as any
  })
  DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_7 as any, {
    label: 'secrets.createSSHCredWizard.validateKeypath',
    settingRenderer: props => <DefaultSettingTextbox {...props} />,
    yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
    settingCategory: 'CI'
  })
  test('test factory changes', async () => {
    const categeoryHandler = DefaultSettingsFactory.getCategoryHandler('CI')
    expect(categeoryHandler?.icon).toEqual('ci-main')
    const typeHandler = DefaultSettingsFactory.getSettingHandler(SettingType.test_setting_CI_5 as any)
    expect(typeHandler?.label).toEqual('secrets.createSSHCredWizard.btnVerifyConnection')
    const getCategoryNamesList = DefaultSettingsFactory.getCategoryNamesList()
    expect(getCategoryNamesList[0]).toEqual('CI')
    const getCategoryList = DefaultSettingsFactory.getCategoryList()
    expect(getCategoryList.get('CI')?.label).toEqual('common.purpose.ci.continuous')
    const getYupValidationForSetting = DefaultSettingsFactory.getYupValidationForSetting(
      SettingType.test_setting_CI_5 as any
    )
    expect(getYupValidationForSetting).toBeTruthy()
    const getGroupsOfACategory = DefaultSettingsFactory.getGroupsOfACategory('CI')
    expect(getGroupsOfACategory.has(SettingGroups.group_1 as any)).toBeTruthy()
    const getGroupHandler = DefaultSettingsFactory.getGroupHandler(SettingGroups.group_1 as any)
    expect(getGroupHandler?.groupName).toEqual('addStepGroup')
    const getGroupSettingsDisplayOrderList = DefaultSettingsFactory.getGroupSettingsDisplayOrderList(
      SettingGroups.group_1 as any
    )
    expect(getGroupSettingsDisplayOrderList[0]).toEqual(SettingType.test_setting_CI_2)

    const getGroupSettingsDisplayOrderList2 = DefaultSettingsFactory.getGroupSettingsDisplayOrderList(
      SettingGroups.group_2 as any
    )
    expect(getGroupSettingsDisplayOrderList2[0]).toEqual(SettingType.test_setting_CI_4)
    const getGroupSettingsDisplayOrderList3 = DefaultSettingsFactory.getGroupSettingsDisplayOrderList('dummy' as any)
    expect(getGroupSettingsDisplayOrderList3.length).toEqual(0)
    const getCategorySettingsDisplayOrderListEmpty = DefaultSettingsFactory.getCategorySettingsDisplayOrderList(
      'dummy' as any
    )
    expect(getCategorySettingsDisplayOrderListEmpty.length).toEqual(0)
    const getCategorySettingsList = DefaultSettingsFactory.getCategorySettingsList('CI')
    expect(getCategorySettingsList.has(SettingType.test_setting_CI_3 as any)).toBeTruthy()
    const getCategorySettingsDisplayOrderList = DefaultSettingsFactory.getCategorySettingsDisplayOrderList('CI')
    expect(getCategorySettingsDisplayOrderList[0]).toEqual('test_setting_CI_6')
    const getSettingNames = DefaultSettingsFactory.getSettingNames()
    expect(getSettingNames.has('test_setting_CI_4' as any)).toBeTruthy()
    const getGroupNames = DefaultSettingsFactory.getGroupNames()
    expect(getGroupNames.has('group_1' as any)).toBeTruthy()
  })
})
