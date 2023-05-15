/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RemoveSubSectionButton from '../RemoveSubSectionButton'

describe('RemoveSubSectionButton', () => {
  test('it should call the onClick handler when the button is pressed', async () => {
    const onClick = jest.fn()
    render(<RemoveSubSectionButton onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(onClick).toHaveBeenCalled()
    })
  })
})
