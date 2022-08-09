import React from 'react'
import * as Yup from 'yup'
import { FormInput } from '@harness/uicore'
import type { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'

const MockDefaultSettingTextbox: React.FC<SettingRendererProps> = ({ onSettingSelectionChange, identifier }) => {
  return (
    <>
      <span>mockbox</span>
      <FormInput.Text
        name={identifier}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.target.value)
        }}
      />
    </>
  )
}
export const getCategoryNamesList = () => {
  return ['CD', 'CI', 'CORE', 'SOMETHING']
}
export const SettingType = {
  ACCOUNT: 'ACCOUNT',
  TEST_SETTING_ID: 'test_setting_id',
  TEST_SETTING_ID_2: 'test_setting_id_2',
  TEST_SETTING_CI: 'test_setting_CI',
  test_setting_CORE_1: 'test_setting_CORE_1',
  test_setting_CORE_2: 'test_setting_CORE_2',
  test_setting_CD_1: 'test_setting_CD_1',
  test_setting_CD_2: 'test_setting_CD_2',
  test_setting_CD_3: 'test_setting_CD_3',
  test_setting_CI_1: 'test_setting_CI_1',
  test_setting_CI_2: 'test_setting_CI_2',
  test_setting_CI_3: 'test_setting_CI_3',
  test_setting_CI_4: 'test_setting_CI_4',
  test_setting_CI_5: 'test_setting_CI_5',
  test_setting_CI_6: 'test_setting_CI_6',
  test_setting_CI_7: 'test_setting_CI_7'
}
export const SettingGroups = {
  group_2: 'group_2',
  group_1: 'group_1',
  group_3: 'group_3'
}

export const getCategoryHandler = (category: string) => {
  switch (category) {
    case 'CD': {
      return {
        icon: 'cd-main',
        label: 'common.purpose.cd.continuous',
        settingsAndGroupDisplayOrder: [' test_setting_CD_1', 'test_setting_CD_2', 'test_setting_CD_3']
      }
    }
    case 'CORE': {
      return {
        icon: 'cd-main',
        label: 'core'
      }
    }
    case 'CI': {
      return {
        icon: 'ci-main',
        label: 'common.purpose.ci.continuous',
        settingsAndGroupDisplayOrder: [
          SettingType.test_setting_CI_6,
          SettingGroups.group_1,
          SettingType.test_setting_CI_7
        ]
      }
    }
    default: {
      return null
    }
  }
}
export const getCategorySettingsList = () => {
  return new Set([
    'test_setting_CI_3',
    'test_setting_CI_4',
    'test_setting_CI_5',
    'test_setting_CI_6',
    'test_setting_CI_2',
    'test_setting_CI_7',
    'test_setting_CI'
  ])
}
export const getSettingNames = () => {
  return new Set([
    'test_setting_CI_3',
    'test_setting_CI_4',
    'test_setting_CI_5',
    'test_setting_CI_6',
    'test_setting_CI_2',
    'test_setting_CI_7',
    'test_setting_CD_1',
    'test_setting_CD_2',
    'test_setting_CD_3',
    'test_setting_CI'
  ])
}
export const getGroupNames = () => {
  return new Set(['group_1', 'group_2', 'group_3'])
}
export const getCategorySettingsDisplayOrderList = () => {
  return ['test_setting_CI_6', 'group_1', 'group_2', 'group_3', 'test_setting_CI_7', 'test_setting_CI']
}
export const getYupValidationForSetting = () => {
  return Yup.string().max(15, 'Must be 15 characters or less')
}
export const errorResponse = {
  status: 'SUCCESS',
  data: [
    {
      identifier: 'test_setting_CI_6',
      setting: null,
      lastModifiedAt: null,
      updateStatus: false,
      errorMessage: 'Only numbers are allowed. Received input [fd]'
    }
  ],
  metaData: null,
  correlationId: 'c1b63847-243c-4fde-b062-2fdb0ce7c216'
}
export const getTypeHandler = (setting: string) => {
  if (setting === 'test_setting_CI') return null
  return {
    settingCategory: 'CI',
    label: setting,
    settingRenderer: (props: any) => <MockDefaultSettingTextbox {...props} />,
    yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
  }
}
export const getGroupHandler = (groupName: string) => {
  switch (groupName) {
    case 'group_1': {
      return {
        groupName: 'addStepGroup',
        settingCategory: 'CI',
        settingsDisplayOrder: ['test_setting_CI_2', 'test_setting_CI_5', 'test_setting_CI_3']
      }
    }
    case 'group_2': {
      return {
        groupName: 'auditTrail.delegateGroups',
        settingCategory: 'CI',
        settingsDisplayOrder: ['test_setting_CI_5', 'test_setting_CI_4']
      }
    }
    default: {
      return null
    }
  }
}
export const getGroupSettingsDisplayOrderList = (groupName: string) => {
  switch (groupName) {
    case 'group_1': {
      return ['test_setting_CI_2', 'test_setting_CI_5', 'test_setting_CI_3']
    }
    case 'group_2': {
      return ['test_setting_CI_5', 'test_setting_CI_4']
    }
  }
}

export const responseData = {
  status: 'SUCCESS',
  data: [
    {
      setting: {
        identifier: 'test_setting_CI_5',
        name: 'Test CI setting',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CI',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: false,
        value: 'dfdfsf',
        defaultValue: 'default',
        settingSource: 'ACCOUNT',
        isSettingEditable: true
      },
      lastModifiedAt: 1658989800873
    },
    {
      setting: {
        identifier: 'test_setting_CI_6',
        name: 'Test CI setting',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CI',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: false,
        value: 'something',
        defaultValue: 'default',
        settingSource: 'ACCOUNT',
        isSettingEditable: true
      },
      lastModifiedAt: 1658991313071
    },
    {
      setting: {
        identifier: 'test_setting_CI_7',
        name: 'Test CI setting',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CI',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: true,
        value: 'default',
        defaultValue: 'default',
        settingSource: 'ACCOUNT',
        isSettingEditable: true
      },
      lastModifiedAt: 1658745566476
    },
    {
      setting: {
        identifier: 'test_setting_CI_2',
        name: 'Test CI setting',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CI',
        groupIdentifier: null,
        valueType: 'Number',
        allowedValues: null,
        allowOverrides: true,
        value: '21',
        defaultValue: '2',
        settingSource: 'ACCOUNT',
        isSettingEditable: true
      },
      lastModifiedAt: 1658989811878
    },
    {
      setting: {
        identifier: 'test_setting_CI_3',
        name: 'Test CI setting',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CI',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: true,
        value: 'default',
        defaultValue: 'default',
        settingSource: 'DEFAULT',
        isSettingEditable: true
      },
      lastModifiedAt: null
    },
    {
      setting: {
        identifier: 'test_setting_CI_4',
        name: 'Test CI setting',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CI',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: false,
        value: 'default',
        defaultValue: 'default',
        settingSource: 'DEFAULT',
        isSettingEditable: false
      },
      lastModifiedAt: null
    },
    {
      setting: {
        identifier: 'test_setting_CI',
        name: 'Test CI setting',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CI',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: false,
        value: 'default',
        defaultValue: 'default',
        settingSource: 'DEFAULT',
        isSettingEditable: false
      },
      lastModifiedAt: null
    },
    {
      setting: {
        identifier: 'test_setting_CI_77',
        name: 'Test CI setting',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CI',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: false,
        value: 'default',
        defaultValue: 'default',
        settingSource: 'DEFAULT',
        isSettingEditable: false
      },
      lastModifiedAt: null
    }
  ],
  metaData: null,
  correlationId: '41d93bf7-6ec5-4ea8-8c91-7e02df430280'
}
