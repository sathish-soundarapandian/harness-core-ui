/* eslint-disable react/display-name */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import mockTarget from '@cf/utils/testData/data/mockTarget'
import type { AddTargetToTargetGroupsDialogProps } from '../../components/LeftBar/TargetGroups/AddTargetToTargetGroupsDialog/AddTargetToTargetGroupsDialog'
import useAddTargetToTargetGroupsDialog from '../useAddTargetToTargetGroupsDialog'

jest.mock('../../components/LeftBar/TargetGroups/AddTargetToTargetGroupsDialog/AddTargetToTargetGroupsDialog', () => ({
  __esModule: true,
  default: () => (
    <Dialog isOpen enforceFocus={false}>
      <span data-testid="add-target-to-target-groups-dialog">Add Target to Target Groups Dialog</span>
    </Dialog>
  )
}))

const WrapperComponent: FC<Omit<AddTargetToTargetGroupsDialogProps, 'hideModal'>> = ({
  target,
  onChange,
  modalTitle,
  addButtonText,
  instructionKind
}) => {
  const [openAddTargetToTargetGroupsDialog] = useAddTargetToTargetGroupsDialog(
    target,
    onChange,
    modalTitle,
    addButtonText,
    instructionKind
  )

  return <button onClick={() => openAddTargetToTargetGroupsDialog()}>Open dialog</button>
}

const renderComponent = (props: Partial<AddTargetToTargetGroupsDialogProps> = {}): RenderResult => {
  const result = render(
    <TestWrapper>
      <WrapperComponent
        target={mockTarget}
        onChange={jest.fn()}
        modalTitle="MODAL TITLE"
        addButtonText="cf.targetDetail.addToSegment"
        instructionKind="addToIncludeList"
        {...props}
      />
    </TestWrapper>
  )

  userEvent.click(screen.getByRole('button', { name: 'Open dialog' }))

  return result
}

describe('useAddTargetToTargetGroupsDialog', () => {
  test('it should render the dialog', async () => {
    renderComponent()

    expect(screen.getByTestId('add-target-to-target-groups-dialog')).toBeInTheDocument()
  })
})
