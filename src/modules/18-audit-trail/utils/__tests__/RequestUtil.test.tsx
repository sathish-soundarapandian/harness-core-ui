/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import type { AuditTrailFormType } from '@audit-trail/components/FilterDrawer/FilterDrawer'
import type { AuditFilterProperties } from 'services/audit'
import { useStrings } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'

import {
  getFilterPropertiesFromForm,
  getFormValuesFromFilterProperties,
  getModuleNameFromAuditModule,
  getOrgDropdownList,
  getProjectDropdownList,
  getStringFromSubtitleMap
} from '../RequestUtil'

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)

const { result } = renderHook(() => useStrings(), { wrapper })

const filterProperties: AuditFilterProperties = {
  filterType: 'Audit',
  actions: ['CREATE'],
  modules: ['CD'],
  principals: [{ type: 'USER', identifier: 'USER1' }],
  scopes: [
    {
      projectIdentifier: 'project_1_value',
      accountIdentifier: 'dummyAccountId',
      orgIdentifier: 'org_1'
    },
    { accountIdentifier: 'dummyAccountId', orgIdentifier: 'org_2' }
  ]
}

const formData: AuditTrailFormType = {
  actions: [{ label: 'created', value: 'CREATE' }],
  modules: [{ label: 'common.module.cd', value: 'CD' }],
  projects: [{ label: 'project_1_value', value: 'project_1_value', orgIdentifier: 'org_1' }],
  organizations: [
    { label: 'org_1', value: 'org_1' },
    { label: 'org_2', value: 'org_2' }
  ],
  users: [{ label: 'USER1', value: 'USER1' }]
}

describe('Request util', () => {
  test('test empty form to get filter properties', () => {
    expect(getFilterPropertiesFromForm({}, 'dummyAccountId')).toEqual({ filterType: 'Audit' })
  })

  test('test empty form to get filter properties', () => {
    expect(getFilterPropertiesFromForm({}, 'dummyAccountId')).toEqual({ filterType: 'Audit' })
  })

  test('test filter properties from form data', () => {
    expect(getFilterPropertiesFromForm(formData, 'dummyAccountId')).toEqual(filterProperties)
  })

  test('get form values from filter properties', () => {
    expect(getFormValuesFromFilterProperties(filterProperties, result.current.getString)).toEqual(formData)
  })

  test('get form values from filter properties without actions', () => {
    const filterPropertieswithoutActions: AuditFilterProperties = {
      filterType: 'Audit',
      resources: [
        {
          type: 'API_KEY',
          identifier: 'api_key'
        }
      ],
      scopes: [
        {
          projectIdentifier: 'project_1_value',
          accountIdentifier: 'dummyAccountId',
          orgIdentifier: 'org_1'
        },
        { accountIdentifier: 'dummyAccountId', orgIdentifier: 'org_2' }
      ]
    }

    const formDataWithoutActions: AuditTrailFormType = {
      projects: [{ label: 'project_1_value', value: 'project_1_value', orgIdentifier: 'org_1' }],
      organizations: [
        { label: 'org_1', value: 'org_1' },
        { label: 'org_2', value: 'org_2' }
      ],
      resourceType: [
        {
          label: 'API_KEY',
          value: 'API_KEY'
        }
      ]
    }
    expect(getFormValuesFromFilterProperties(filterPropertieswithoutActions, result.current.getString)).toEqual(
      formDataWithoutActions
    )
  })

  test('get module name from Audit module', () => {
    expect(getModuleNameFromAuditModule('CD')).toEqual('cd')
    expect(getModuleNameFromAuditModule('CI')).toEqual('ci')
    expect(getModuleNameFromAuditModule('CF')).toEqual('cf')
    expect(getModuleNameFromAuditModule('CE')).toEqual('ce')
    expect(getModuleNameFromAuditModule('CV')).toEqual('cv')
    expect(getModuleNameFromAuditModule('CORE')).toEqual(undefined)
  })

  test('get string from subtitle map', () => {
    expect(
      getStringFromSubtitleMap({
        title: 'value'
      })
    ).toEqual('title: value')

    expect(
      getStringFromSubtitleMap({
        title: 'value',
        title1: 'value1'
      })
    ).toEqual('title: value | title1: value1')
  })

  test('test project dropdown list', () => {
    const projectDropdonwList = getProjectDropdownList([
      {
        project: {
          identifier: 'projectIdentifier',
          name: 'projectName',
          orgIdentifier: 'orgIdentifier'
        }
      }
    ])
    expect(projectDropdonwList).toEqual([
      {
        label: 'projectName',
        value: 'projectIdentifier',
        orgIdentifier: 'orgIdentifier'
      }
    ])
  })

  test('test org dropdown list', () => {
    const projectDropdonwList = getOrgDropdownList([
      {
        organizationResponse: {
          organization: {
            name: 'orgName',
            identifier: 'orgIdentifier'
          }
        }
      }
    ])
    expect(projectDropdonwList).toEqual([
      {
        label: 'orgName',
        value: 'orgIdentifier'
      }
    ])
  })
})
