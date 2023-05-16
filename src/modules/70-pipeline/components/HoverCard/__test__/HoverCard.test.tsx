/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { HoverCardProps } from '@pipeline/components/HoverCard/HoverCard';
import HoverCard from '@pipeline/components/HoverCard/HoverCard'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'

const getProps = (): HoverCardProps => ({
  data: {
    data: {
      startTs: 1619479030,
      endTs: 1619482630,
      failureInfo: {
        message: 'Failure message'
      }
    },
    status: ExecutionStatusEnum.Failed
  }
})

describe('ConditionalExecution', () => {
  test('matches snapshot with failure', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <HoverCard {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
