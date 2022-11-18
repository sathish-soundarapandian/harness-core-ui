/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getSettingsPromiseMock = {
  status: 'SUCCESS',
  data: [
    {
      setting: {
        identifier: 'disable_harness_built_in_secret_manager',
        name: 'Disable Harness Built-In Secret Manager',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CORE',
        groupIdentifier: null,
        valueType: 'Boolean',
        allowedValues: null,
        allowOverrides: true,
        value: 'false',
        defaultValue: 'false',
        settingSource: 'DEFAULT',
        isSettingEditable: true
      },
      lastModifiedAt: null
    },
    {
      setting: {
        identifier: 'mandate_webhook_secrets_for_github_triggers',
        name: 'Mandate Webhook Secrets for Github Triggers',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CORE',
        groupIdentifier: null,
        valueType: 'Boolean',
        allowedValues: null,
        allowOverrides: false,
        value: 'false',
        defaultValue: 'false',
        settingSource: 'ACCOUNT',
        isSettingEditable: true
      },
      lastModifiedAt: 1668412128699
    }
  ],
  metaData: null,
  correlationId: '3e66b2d7-ae59-4553-8149-2b8f98526372'
}

export const getAuthSettingsPromiseMock = {
  status: 'SUCCESS',
  data: [
    {
      setting: {
        identifier: 'test_setting_AUTH_1',
        name: 'test_setting_AUTH_1',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'AUTH',
        groupIdentifier: null,
        valueType: 'Boolean',
        allowedValues: null,
        allowOverrides: true,
        value: 'false',
        defaultValue: 'false',
        settingSource: 'DEFAULT',
        isSettingEditable: true
      },
      lastModifiedAt: null
    },
    {
      setting: {
        identifier: 'test_setting_AUTH_2',
        name: 'test_setting_AUTH_2',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'AUTH',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: false,
        value: 'false',
        defaultValue: 'false',
        settingSource: 'ACCOUNT',
        isSettingEditable: true
      },
      lastModifiedAt: 1668412128699
    }
  ],
  metaData: null,
  correlationId: '3e66b2d7-ae59-4553-8149-2b8f98526372'
}
