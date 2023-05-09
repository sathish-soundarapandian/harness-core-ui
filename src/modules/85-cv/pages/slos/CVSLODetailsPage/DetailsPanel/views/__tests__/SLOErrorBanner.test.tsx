/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { SLOError } from 'services/cv'
import SLOErrorBanner from '../SLOErrorBanner'

const Wrapper = ({ sloError }: { sloError?: SLOError }) => {
  return (
    <TestWrapper>
      <SLOErrorBanner sloError={sloError} />
    </TestWrapper>
  )
}
describe('SLOErrorBanner', () => {
  test('should render with no SLO Error', () => {
    const { getByText } = render(<Wrapper />)
    expect(getByText('cv.slos.sloErrorBanner')).toBeInTheDocument()
  })
  test('should render with  SLO Error', () => {
    const props = {
      sloError: {
        errorMessage: 'Custom error message',
        failedState: true,
        sloErrorType: 'SimpleSLODeletion' as any
      }
    }
    const { getByText } = render(<Wrapper {...props} />)
    expect(getByText(props.sloError.errorMessage)).toBeInTheDocument()
  })
})
