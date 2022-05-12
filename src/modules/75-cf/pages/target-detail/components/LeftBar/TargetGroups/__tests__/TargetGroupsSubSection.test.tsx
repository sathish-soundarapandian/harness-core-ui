/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as useModal from '@harness/use-modal'
import { TestWrapper } from '@common/utils/testUtils'
import mockTarget from '@cf/utils/testData/data/mockTarget'
import TargetGroupsSubSection, { TargetGroupsSubSectionProps } from '../TargetGroupsSubSection'

const mockTargetGroups: TargetGroupsSubSectionProps['targetGroups'] = [
  { identifier: 'tg1', name: 'Target Group 1' },
  { identifier: 'tg2', name: 'Target Group 2' },
  { identifier: 'tg3', name: 'Target Group 3' }
]

const renderComponent = (props: Partial<TargetGroupsSubSectionProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <TargetGroupsSubSection
        target={mockTarget}
        targetGroups={mockTargetGroups}
        onAddTargetGroups={jest.fn()}
        removeTargetGroup={jest.fn()}
        onRemoveTargetGroup={jest.fn()}
        sectionTitle="cf.targetDetail.manuallyAdded"
        sectionTitleTooltipId="ff_targetTargetGroups_manuallyAdded"
        modalTitle="cf.targetDetail.addTargetToSegment"
        addButtonText="cf.targetDetail.addToSegment"
        noDataMessage="cf.targetDetail.noSegmentAdded"
        instructionKind="addToIncludeList"
        {...props}
      />
    </TestWrapper>
  )

describe('TargetGroupsSubSection', () => {
  beforeEach(() => jest.resetAllMocks())

  test('it should display the section title', async () => {
    const sectionTitle = 'cf.targetDetail.manuallyAdded'

    renderComponent({ sectionTitle })

    expect(screen.getByText(sectionTitle)).toBeInTheDocument()
  })

  test('it should call the removeTargetGroup function and then the onRemoveTargetGroup callback when the delete button of a target group is clicked', async () => {
    const removeTargetGroup = jest.fn().mockResolvedValue(undefined)
    const onRemoveTargetGroup = jest.fn()

    renderComponent({ removeTargetGroup, onRemoveTargetGroup })

    userEvent.click(screen.getAllByRole('button', { name: 'cf.targetDetail.removeSegment' })[0])

    await waitFor(() => {
      expect(removeTargetGroup).not.toHaveBeenCalled()
      expect(onRemoveTargetGroup).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'confirm' })).toBeInTheDocument()
    })

    userEvent.click(screen.getByRole('button', { name: 'confirm' }))

    await waitFor(() => {
      expect(removeTargetGroup).toHaveBeenCalled()
      expect(onRemoveTargetGroup).toHaveBeenCalled()
    })
  })

  test('it should display an error if unable to remove a target group', async () => {
    const message = 'ERROR MESSAGE'
    const removeTargetGroup = jest.fn().mockRejectedValue({ message })

    renderComponent({ removeTargetGroup })

    userEvent.click(screen.getAllByRole('button', { name: 'cf.targetDetail.removeSegment' })[0])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'confirm' })).toBeInTheDocument()
    })

    userEvent.click(screen.getByRole('button', { name: 'confirm' }))

    await waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument()
    })
  })

  test('it should display the add target group button and trigger the modal when clicked', async () => {
    const addButtonText = 'cf.targetDetail.addToSegment'
    const openModal = jest.fn()
    jest.spyOn(useModal, 'useModalHook').mockReturnValue([openModal, jest.fn()])

    renderComponent({ addButtonText })

    const addBtn = screen.getByRole('button', { name: addButtonText })
    expect(addBtn).toBeInTheDocument()
    expect(openModal).not.toHaveBeenCalled()

    userEvent.click(addBtn)

    await waitFor(() => expect(openModal).toHaveBeenCalled())
  })
})
