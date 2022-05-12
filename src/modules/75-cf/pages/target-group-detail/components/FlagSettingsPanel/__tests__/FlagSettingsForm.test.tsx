/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep, set } from 'lodash-es'
import { getByRole, render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import { PERCENTAGE_ROLLOUT_VALUE } from '@cf/constants'
import type { TargetGroupFlagsMap } from '../../../TargetGroupDetailPage.types'
import { mockFlagWithPercentageRollout, mockTargetGroup, mockTargetGroupFlagsMap } from '../../../__tests__/mocks'
import FlagSettingsForm, { FlagSettingsFormProps } from '../FlagSettingsForm'

const renderComponent = (props: Partial<FlagSettingsFormProps> = {}): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/target-groups/:segmentId"
      pathParams={{
        accountId: 'accId',
        orgIdentifier: 'orgId',
        projectIdentifier: 'projectId',
        segmentId: mockTargetGroup.identifier
      }}
      queryParams={{ environment: 'env' }}
    >
      <FlagSettingsForm
        targetGroup={mockTargetGroup}
        targetGroupFlagsMap={mockTargetGroupFlagsMap}
        onChange={jest.fn()}
        openAddFlagDialog={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('FlagSettingsForm', () => {
  const usePatchSegmentMock = jest.spyOn(cfServices, 'usePatchSegment')

  beforeEach(() => {
    jest.resetAllMocks()
    usePatchSegmentMock.mockReturnValue({
      mutate: jest.fn()
    } as any)
  })

  test('it should display a row for the header and each flag', async () => {
    renderComponent()

    expect(screen.getAllByRole('row')).toHaveLength(Object.values(mockTargetGroupFlagsMap).length + 1)
  })

  test('it should display a remove button for each flag row', async () => {
    renderComponent()

    expect(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })).toHaveLength(
      Object.values(mockTargetGroupFlagsMap).length
    )
  })

  test('it should remove the specific row whose remove button was clicked', async () => {
    renderComponent()

    const firstRow = screen.getByText(mockTargetGroupFlagsMap.f1.name).closest('[role="row"]') as HTMLElement
    const firstRemoveButton = getByRole(firstRow, 'button', { name: 'cf.segmentDetail.removeRule' })

    expect(firstRow).toBeInTheDocument()
    expect(firstRemoveButton).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(Object.values(mockTargetGroupFlagsMap).length + 1)

    userEvent.click(firstRemoveButton)

    await waitFor(() => {
      expect(screen.queryByText(mockTargetGroupFlagsMap.f1.name)).not.toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(Object.values(mockTargetGroupFlagsMap).length)
    })
  })

  test('it should display the Save/Cancel buttons when a change is made to the form', async () => {
    renderComponent()

    expect(screen.queryByRole('button', { name: 'saveChanges' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'cancel' })).not.toBeInTheDocument()

    userEvent.click(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })[0])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'saveChanges' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
    })
  })

  test('it should reset the form and hide the Save/Cancel buttons when the Cancel button is clicked', async () => {
    renderComponent()
    const initialRowLength = screen.getAllByRole('row').length

    userEvent.click(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })[0])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
      expect(screen.getAllByRole('row')).not.toHaveLength(initialRowLength)
    })

    userEvent.click(screen.getByRole('button', { name: 'cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'cancel' })).not.toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(initialRowLength)
    })
  })

  test('it should not paginate when there are no rows', async () => {
    renderComponent({ targetGroupFlagsMap: {} })

    expect(screen.queryByTestId('flags-pagination')).not.toBeInTheDocument()
  })

  test('it should paginate when there are rows', async () => {
    const targetGroupFlagsMap: TargetGroupFlagsMap = {}

    for (let x = 0; x < 30; x++) {
      targetGroupFlagsMap[`newFlag${x}`] = cloneDeep(mockTargetGroupFlagsMap.f1)
      set(targetGroupFlagsMap, `newFlag${x}.identifier`, `newFlag${x}`)
      set(targetGroupFlagsMap, `newFlag${x}.name`, `New Flag ${x}`)
      set(targetGroupFlagsMap, `newFlag${x}.flag.name`, `New Flag ${x}`)
      set(targetGroupFlagsMap, `newFlag${x}.flag.identifier`, `newFlag${x}`)
    }

    const page1Flags = Object.values(targetGroupFlagsMap)
      .slice(0, 14)
      .map(({ flag }) => flag.name)
    const page2Flags = Object.values(targetGroupFlagsMap)
      .slice(15)
      .map(({ flag }) => flag.name)

    renderComponent({ targetGroupFlagsMap })

    expect(screen.getByTestId('flags-pagination')).toBeInTheDocument()

    page1Flags.forEach(flagName => expect(screen.getByText(flagName)).toBeInTheDocument())
    page2Flags.forEach(flagName => expect(screen.queryByText(flagName)).not.toBeInTheDocument())

    userEvent.click(screen.getByRole('button', { name: '2' }))

    await waitFor(() => {
      page1Flags.forEach(flagName => expect(screen.queryByText(flagName)).not.toBeInTheDocument())
      page2Flags.forEach(flagName => expect(screen.getByText(flagName)).toBeInTheDocument())
    })
  })

  test('it should filter flags based on search', async () => {
    const targetGroupFlagsMap: TargetGroupFlagsMap = {}

    for (let x = 0; x < 15; x++) {
      targetGroupFlagsMap[`newFlag${x}`] = cloneDeep(mockTargetGroupFlagsMap.f1)
      set(targetGroupFlagsMap, `newFlag${x}.identifier`, `newFlag${x}`)
      set(targetGroupFlagsMap, `newFlag${x}.name`, `${x % 0 ? 'Odd' : 'Even'} Flag ${x}`)
      set(targetGroupFlagsMap, `newFlag${x}.flag.name`, `${x % 0 ? 'Odd' : 'Even'} Flag ${x}`)
      set(targetGroupFlagsMap, `newFlag${x}.flag.identifier`, `newFlag${x}`)
    }

    const oddFlags = Object.values(targetGroupFlagsMap)
      .filter(({ name }) => name.includes('Odd'))
      .map(({ name }) => name)
    const evenFlags = Object.values(targetGroupFlagsMap)
      .filter(({ name }) => name.includes('Even'))
      .map(({ name }) => name)

    renderComponent({ targetGroupFlagsMap })

    const searchBox = screen.getByRole('searchbox')
    expect(searchBox).toBeInTheDocument()

    oddFlags.forEach(flagName => expect(screen.getByText(flagName)).toBeInTheDocument())
    evenFlags.forEach(flagName => expect(screen.getByText(flagName)).toBeInTheDocument())

    await userEvent.type(searchBox, 'odd')

    await waitFor(() => {
      oddFlags.forEach(flagName => expect(screen.getByText(flagName)).toBeInTheDocument())
      evenFlags.forEach(flagName => expect(screen.queryByText(flagName)).not.toBeInTheDocument())
    })

    userEvent.clear(searchBox)
    await userEvent.type(searchBox, 'even')

    await waitFor(() => {
      oddFlags.forEach(flagName => expect(screen.queryByText(flagName)).not.toBeInTheDocument())
      evenFlags.forEach(flagName => expect(screen.getByText(flagName)).toBeInTheDocument())
    })
  })

  test('it should display a no results message when the search does not match', async () => {
    renderComponent()

    expect(screen.queryByText('cf.noResultMatch')).not.toBeInTheDocument()

    await userEvent.type(screen.getByRole('searchbox'), 'asdfgdsfgsdf', { delay: 100 })

    await waitFor(() => expect(screen.getByText('cf.noResultMatch')).toBeInTheDocument())
  })

  test('it should send a patch and call the onChange callback when the form is submitted', async () => {
    const onChangeMock = jest.fn()
    const mutateMock = jest.fn().mockResolvedValue(undefined)
    usePatchSegmentMock.mockReturnValue({
      mutate: mutateMock
    } as any)

    renderComponent({ onChange: onChangeMock })

    expect(mutateMock).not.toHaveBeenCalled()
    expect(onChangeMock).not.toHaveBeenCalled()

    userEvent.click(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })[0])

    await waitFor(() => expect(screen.getByRole('button', { name: 'saveChanges' })).toBeInTheDocument())

    userEvent.click(screen.getByRole('button', { name: 'saveChanges' }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalled()
      expect(onChangeMock).toHaveBeenCalled()
    })
  })

  test('it should display an error when the mutate fails', async () => {
    const message = 'ERROR!'
    const onChangeMock = jest.fn()
    const mutateMock = jest.fn().mockRejectedValue({ message })
    usePatchSegmentMock.mockReturnValue({
      mutate: mutateMock
    } as any)

    renderComponent({ onChange: onChangeMock })

    expect(mutateMock).not.toHaveBeenCalled()
    expect(onChangeMock).not.toHaveBeenCalled()

    userEvent.click(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })[0])

    await waitFor(() => expect(screen.getByRole('button', { name: 'saveChanges' })).toBeInTheDocument())

    userEvent.click(screen.getByRole('button', { name: 'saveChanges' }))

    await waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument()
      expect(onChangeMock).not.toHaveBeenCalled()
    })
  })

  test('it should call the openAddFlagDialog callback when the Add Flag button is pressed', async () => {
    const openAddFlagDialogMock = jest.fn()

    renderComponent({ openAddFlagDialog: openAddFlagDialogMock })

    expect(openAddFlagDialogMock).not.toHaveBeenCalled()

    userEvent.click(screen.getByRole('button', { name: 'cf.segmentDetail.addFlag' }))

    await waitFor(() => expect(openAddFlagDialogMock).toHaveBeenCalled())
  })

  test('it should display the percentage rollout UI when Percentage Rollout is set as variation', async () => {
    const targetGroupFlagsMap = {
      [mockFlagWithPercentageRollout.identifier]: {
        identifier: mockFlagWithPercentageRollout.identifier,
        name: mockFlagWithPercentageRollout.name,
        variation: PERCENTAGE_ROLLOUT_VALUE,
        environment: 'e1',
        project: 'p1',
        type: 'CONDITION',
        ruleId: 'r3',
        flag: mockFlagWithPercentageRollout
      }
    } as TargetGroupFlagsMap

    renderComponent({ targetGroupFlagsMap })

    await waitFor(() => {
      expect(screen.getByTestId('variation-percentage-rollout')).toBeInTheDocument()
    })
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('it should display the percentage rollout error when the weight sum exceeds 100%', async () => {
    const targetGroupFlagsMap = {
      [mockFlagWithPercentageRollout.identifier]: {
        identifier: mockFlagWithPercentageRollout.identifier,
        name: mockFlagWithPercentageRollout.name,
        variation: PERCENTAGE_ROLLOUT_VALUE,
        environment: 'e1',
        project: 'p1',
        type: 'CONDITION',
        ruleId: 'r3',
        flag: mockFlagWithPercentageRollout
      }
    } as TargetGroupFlagsMap

    renderComponent({ targetGroupFlagsMap })

    await waitFor(() => {
      expect(screen.getByTestId('variation-percentage-rollout')).toBeInTheDocument()
      expect(screen.queryByText('cf.percentageRollout.invalidTotalError')).not.toBeInTheDocument()
    })

    const firstWeightInput = screen.getAllByRole('spinbutton')[0]

    userEvent.clear(firstWeightInput)
    await userEvent.type(firstWeightInput, '101')

    await waitFor(() => expect(screen.getByText('cf.percentageRollout.invalidTotalError')).toBeInTheDocument())
  })
})
