/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { CustomApprovalCriteria } from '../CustomApprovalCriteria'

describe('<CustomApprovalCriteria/> tests', () => {
  test('type is jexl', () => {
    const criteriaProps = {
      type: 'approval',
      criteria: {
        type: 'Jexl',
        spec: {
          expression: "<+status> == 'Blocked'"
        }
      }
    } as const

    const { container } = render(
      <TestWrapper>
        <CustomApprovalCriteria {...criteriaProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('type is key value pair', () => {
    const criteriaProps = {
      type: 'approval',
      criteria: {
        type: 'KeyValues',
        spec: {
          matchAnyCondition: true,
          conditions: [
            {
              key: 'Status',
              operator: 'in',
              value: 'Done,todo'
            },
            {
              key: 'f1',
              operator: 'equals',
              value: 'somevalue for f1'
            }
          ]
        }
      }
    } as const

    const { container } = render(
      <TestWrapper>
        <CustomApprovalCriteria {...criteriaProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
