/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable jest-no-mock */
import { renderHook } from '@testing-library/react-hooks'
import React, { FC } from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGovernance } from '../useGovernance'

jest.mock('services/cf')
jest.mock('@common/hooks/useFeatureFlag')

const renderHookUnderTest = () => {
  const wrapper: FC = ({ children }) => {
    return <TestWrapper>{children}</TestWrapper>
  }
  return renderHook(() => useGovernance(), { wrapper })
}

describe('useGovernance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it should set error correctly', async () => {
    const { result } = renderHookUnderTest()

    result.current.handleError(governanceError)

    expect(result.current.governanceError).toBe(governanceError.details.governanceMetadata)
  })
})

const governanceError = {
  code: '400',
  details: {
    governanceMetadata: {
      account_id: 'Ws0xvw71Sm2YmpSC7A8z4g',
      action: 'onsave',
      created: 1647949479966,
      details: [
        {
          account_id: 'Ws0xvw71Sm2YmpSC7A8z4g',
          action: 'onsave',
          created: 1647292318446,
          description: '',
          details: [
            {
              deny_messages: [],
              error: '',
              policy: {
                account_id: 'Ws0xvw71Sm2YmpSC7A8z4g',
                created: 1647292306536,
                identifier: 'Flags_cant_be_on',
                name: "Flags can't be on",
                org_id: 'default',
                project_id: 'cmproj',
                rego: 'package feature_flags\n\n# Deny flags that aren\'t booleans\ndeny[sprintf("feature flag \'%s\' is enabled for env %s", [input.flag.identifier, input.flag.envProperties[_].environment])] {\n    input.flag.envProperties[_].state == "on"\n}\n\n',
                updated: 1647293629919
              },
              status: 'pass'
            },
            {
              deny_messages: ['Always fail'],
              error: '',
              policy: {
                account_id: 'Ws0xvw71Sm2YmpSC7A8z4g',
                created: 1645468139858,
                identifier: 'always_fail',
                name: 'always fail',
                org_id: '',
                project_id: '',
                rego: 'package play\n\ndeny["Always fail"] {\n    true\n}',
                updated: 1645468139858
              },
              status: 'error'
            }
          ],
          enabled: true,
          identifier: 'Flag_rules',
          name: 'Flag rules',
          org_id: 'default',
          project_id: 'cmproj',
          status: 'error',
          type: 'flag',
          updated: 1647428536108
        }
      ],
      entity: 'test',
      entity_metadata: '',
      id: 7550,
      org_id: 'default',
      project_id: 'my_proj',
      status: 'error',
      type: 'flag'
    }
  },
  message: 'Governance policy failed. Check governance tab for details.'
}
