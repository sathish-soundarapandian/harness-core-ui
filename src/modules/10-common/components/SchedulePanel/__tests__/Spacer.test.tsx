/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import Spacer from '../components/Spacer/Spacer'

describe('Spacer styling', () => {
  test('Test Spacer with all layout props', () => {
    const { container } = render(
      <Spacer
        paddingTop="var(--spacing-large)"
        paddingBottom="var(--spacing-large)"
        width="90%"
        marginLeft="var(--spacing-large)"
      />
    )
    expect(container).toMatchSnapshot()
  })
})
