/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import DelegateConnectivityStatus from '../DelegateConnectivityStatus'
import { delegateGroupsMock } from './DelegateGroupsMock'

describe('Delegate connectivity status component', () => {
  test('Open troubleshoot', async () => {
    const { queryByText } = render(
      <TestWrapper>
        <DelegateConnectivityStatus delegate={{ ...delegateGroupsMock[0], activelyConnected: false }} />
      </TestWrapper>
    )
    const troubleShoot = queryByText('delegates.troubleshootOption')
    expect(troubleShoot).toBeInTheDocument()
    fireEvent.click(troubleShoot!)
    const dialog = findDialogContainer() as HTMLElement
    fireEvent.keyDown(dialog, { key: 'Escape', keyCode: 27, which: 27 })
    await waitFor(() =>
      expect(queryByText('delegates.delegateNotInstalled.tabs.commonProblems.title')).not.toBeInTheDocument()
    )
  })
})
