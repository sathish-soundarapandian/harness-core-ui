/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { Stage } from '../ProgressOverlay';
import { ProgressOverlay } from '../ProgressOverlay'

describe('Test ProgressOverlay overlay component', () => {
  test('Should show correct stage labels and icons', () => {
    const pushingChangesToGitStage = {
      status: 'SUCCESS',
      intermediateLabel: 'Pushing changes to Git',
      finalLabel: 'Pushed changes to Git'
    } as Stage

    const createConnectorStage = {
      status: 'IN_PROGRESS',
      intermediateLabel: 'Creating connector',
      finalLabel: 'Connector successfully created'
    } as Stage

    const initialProps = {
      firstStage: pushingChangesToGitStage,
      secondStage: createConnectorStage,
      onClose: jest.fn
    }

    const { container, rerender } = render(
      <TestWrapper>
        <ProgressOverlay {...initialProps} />
      </TestWrapper>
    )

    /* initial view */

    // should show overall progress
    expect(getByText(container, 'common.gitSync.savingInProgress')).toBeTruthy()
    // should show first stage label
    expect(getByText(container, pushingChangesToGitStage.intermediateLabel as string)).toBeTruthy()
    // should show second stage label
    expect(getByText(container, createConnectorStage.intermediateLabel as string)).toBeTruthy()

    /* finish to completion */

    /* 1st stage was successful but 2nd failed */
    pushingChangesToGitStage['status'] = 'SUCCESS'
    createConnectorStage['status'] = 'FAILURE'
    rerender(<ProgressOverlay {...initialProps} />)
    if (createConnectorStage.finalLabel) {
      expect(getByText(container, createConnectorStage.finalLabel)).toBeTruthy()
    }

    /* failed at 1st stage itself */
    pushingChangesToGitStage['finalLabel'] = 'Unable to push changes to Git'
    pushingChangesToGitStage['status'] = 'FAILURE'
    rerender(<ProgressOverlay {...initialProps} />)
    expect(getByText(container, pushingChangesToGitStage.finalLabel)).toBeTruthy()
  })
})
