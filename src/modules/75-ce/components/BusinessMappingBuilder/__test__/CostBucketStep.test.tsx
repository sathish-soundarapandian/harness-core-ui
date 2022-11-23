/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import {} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { TestWrapper } from '@common/utils/testUtils'
import { CostBucketWidgetType } from '@ce/types'
import CostBucketStep from '../CostBucketStep/CostBucketStep'

const value = [
  {
    name: 'Rule1',
    rules: [
      {
        viewConditions: [
          {
            values: ['d', 'e', 'f'],
            viewOperator: 'IN',
            viewField: {
              fieldId: 'product',
              fieldName: 'Product',
              identifier: 'COMMON',
              identifierName: 'Common'
            }
          }
        ]
      }
    ],
    strategy: 'Fixed'
  }
]

describe('test cases for Cost Bucket Step', () => {
  test('should be able to render', () => {
    const props: any = {
      formikProps: {
        values: {
          sharedCostBucketKey: 1
        },
        setFieldValue: jest.fn()
      },
      value: value,
      namespace: 'sharedCostBucket',
      isSharedCost: true,
      widgetType: CostBucketWidgetType.SharedCostBucket,
      stepProps: {
        color: Color.PRIMARY_7,
        background: Color.PRIMARY_1,
        total: 3,
        current: 1,
        defaultOpen: true
      }
    }

    const { container } = render(
      <TestWrapper>
        <CostBucketStep {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
