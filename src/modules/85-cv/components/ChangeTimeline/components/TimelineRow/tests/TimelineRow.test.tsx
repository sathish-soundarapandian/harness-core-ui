/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TimelineRow } from '../TimelineRow'
import { series } from './TimelineRow.mock'

describe('Unit tests for TimelineRow', () => {
  test('Ensure timeline component renders correctly', async () => {
    const { getByText } = render(<TimelineRow labelName="label1" labelWidth={200} data={series} />)
    await waitFor(() => expect(getByText('label1')).not.toBeNull())
  })
  test('Ensure loading state is rendered', async () => {
    const { container } = render(<TimelineRow labelName="label1" labelWidth={200} data={[]} isLoading={true} />)
    await waitFor(() => expect(container.querySelector('[data-testid="timelineLoading"]')).not.toBeNull())
  })
})
