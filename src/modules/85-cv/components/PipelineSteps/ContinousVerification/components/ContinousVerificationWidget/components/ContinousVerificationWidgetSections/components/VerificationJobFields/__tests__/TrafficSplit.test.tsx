/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { set } from 'lodash-es'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TrafficSplit } from '../VerificationJobFields'

const props = {
  label: 'Test',
  name: 'test',
  isSimpleDropdown: true,
  allowableTypes: [],
  formik: { values: {} } as any
}
describe('Validate Verify Step Components', () => {
  test('should render Traffic Split empty state', () => {
    const { container } = render(
      <TestWrapper>
        <TrafficSplit {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render Traffic Split with values', () => {
    let trafficSplitProp = {} as any
    trafficSplitProp = set(props, 'name', 'trafficSplit')
    trafficSplitProp = set(props, 'label', 'trafficSplit')
    trafficSplitProp = set(props, 'formik.values.spec.spec.trafficsplit', { label: '5%', value: 5 })
    const { container } = render(
      <TestWrapper>
        <TrafficSplit {...trafficSplitProp} />
      </TestWrapper>
    )
    expect(container.querySelector('input[name="trafficSplit"]')).toHaveValue('5%')
  })
})
