/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react/display-name */
import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { LogsHeaderProps as LogsHeaderPropsInterface } from '../LogsHeader';
import LogsHeader from '../LogsHeader'

const LogsHeaderProps: LogsHeaderPropsInterface = {
  onNext: jest.fn(),
  onPrev: jest.fn(),
  searchDir: '',
  subHeader: '',
  redirectToLogView: true
}

describe('Testing LogsHeader', () => {
  test('snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <LogsHeader {...LogsHeaderProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
