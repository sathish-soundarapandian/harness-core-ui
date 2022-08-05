/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import ModuleList from '../ModuleList'

describe('ModuleList', () => {
  test('should render correctly', () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <ModuleList isOpen={true} close={noop} usePortal={false} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    expect(getByText('common.purpose.ci.continuous')).toBeDefined()
    expect(getByText('common.purpose.cd.continuous')).toBeDefined()
    expect(getByText('common.purpose.cv.continuous')).toBeDefined()
    expect(getByText('common.purpose.cf.continuous')).toBeDefined()
    expect(getByText('common.purpose.ce.continuous')).toBeDefined()
    expect(getByText('common.purpose.sto.continuous')).toBeDefined()
  })
})
