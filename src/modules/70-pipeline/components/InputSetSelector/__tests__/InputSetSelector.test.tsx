/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor, within, createEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputSetSummaryResponse, useGetInputSetsListForPipeline } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import { InputSetSelector, InputSetSelectorProps } from '../InputSetSelector'
import {
  mockInputSetsList,
  mockInputSetsListEmpty,
  mockInputSetsListError,
  mockInputSetsListWithGitDetails,
  multipleSelectedInputSets,
  multipleSelectedInputSetsWithGitDetails,
  paginatedInputSetsResponse
} from './mocks'
import type { InputSetValue } from '../utils'

const commonProps: InputSetSelectorProps = {
  pipelineIdentifier: 'pipId'
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('services/pipeline-ng', () => ({
  useGetInputSetsListForPipeline: jest.fn()
}))

const eventData = {
  dataTransfer: {
    setData: jest.fn(),
    dropEffect: '',
    getData: () => '1'
  }
}

describe('INPUT SET SELECTOR', () => {
  test('No input sets - should show loading symbol', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => ({
      data: {},
      refetch: jest.fn()
    }))
    const { queryByText, getByText } = render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    // Show loading input sets after click
    await waitFor(() => expect(queryByText(/Loading, please wait\.\.\./)).toBeTruthy())
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Input sets API has data', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { container, getByText, rerender, getByPlaceholderText, queryByText } = render(
      <TestWrapper>
        <InputSetSelector {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })
    await waitFor(() => expect(container).toMatchSnapshot('snapshot afteropening the input set list'))

    // Click on the overlay input set, it should reorder and come to the top
    act(() => {
      fireEvent.click(getByText('ol1'))
    })
    await waitFor(() => expect(container).toMatchSnapshot('reorder after selecting an overlay'))

    // Click again to uncheck
    act(() => {
      fireEvent.click(getByText('ol1'))
    })

    // click again to check
    act(() => {
      fireEvent.click(getByText('ol1'))
    })

    // Select the other input set
    act(() => {
      fireEvent.click(getByText('is1'))
    })

    // Use the search box
    act(() => {
      fireEvent.change(getByPlaceholderText('search'), { target: { value: 'randomstring' } })
    })
    // Since we searched for a random string, it should filter out the remaining option is2
    await waitFor(() => expect(queryByText('is2')).toBeNull())

    // Apply the selections
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.applyInputSets'))
    })

    // Check if onChange is called with proper values
    const selectedValues: InputSetValue[] | undefined = mockInputSetsList.data?.data?.content
      ?.filter(opt => opt.name !== 'is2')
      .map(opt => ({
        label: opt.name || '',
        value: opt.identifier || '',
        type: opt.inputSetType || ('INPUT_SET' as InputSetSummaryResponse['inputSetType']),
        gitDetails: {}
      }))

    await waitFor(() =>
      expect(onChangeMock).toBeCalledWith([
        {
          gitDetails: {},
          label: 'ol1',
          type: 'OVERLAY_INPUT_SET',
          value: 'overlay1'
        },
        {
          gitDetails: {},
          label: 'is1',
          type: 'INPUT_SET',
          value: 'inputset1'
        }
      ])
    )

    // Rerender with selected values i.e. is1 and ol1
    const onChangeRe = jest.fn()
    rerender(
      <TestWrapper>
        <InputSetSelector {...commonProps} value={selectedValues} onChange={onChangeRe} />
      </TestWrapper>
    )

    // Try and remove the first input set
    const firstXIcon = container.querySelectorAll('span[icon="cross"]')[0]
    fireEvent.click(firstXIcon)

    // Check if onChange is passed with the latest selected values
    await waitFor(() =>
      expect(onChangeRe).toBeCalledWith([
        {
          label: 'ol1',
          value: 'overlay1',
          type: 'OVERLAY_INPUT_SET',
          gitDetails: {}
        }
      ])
    )
  })

  test('input set displayed', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { getByTestId } = render(
      <TestWrapper>
        <InputSetSelector value={multipleSelectedInputSets} {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )
    expect(getByTestId('button-is1')).toBeTruthy()
  })

  test('input set displayed in popover list', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { getByText, container } = render(
      <TestWrapper>
        <InputSetSelector value={multipleSelectedInputSets} {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })
    await waitFor(() => expect(container).toMatchSnapshot('snapshot afteropening the input set list'))

    const inputSetListPopoverList = document.getElementsByClassName('popoverContainer')
    await waitFor(() => expect(inputSetListPopoverList).toBeDefined())
    expect(inputSetListPopoverList).toHaveLength(1)
    const inputSetListPopover = inputSetListPopoverList[0] as HTMLElement
    const selectedIS = within(inputSetListPopover).getByTestId('0-inputset1')

    expect(selectedIS).toBeTruthy()
    expect(within(selectedIS).queryByText('main')).toBeNull()
    expect(within(inputSetListPopover).getByTestId('1-inputset2')).toBeTruthy()
  })

  test('cross button exists when there is a selected inputset', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { container } = render(
      <TestWrapper>
        <InputSetSelector value={multipleSelectedInputSets} {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )
    const crossbtn = container.querySelector('.bp3-popover-target .bp3-icon-cross')

    expect(crossbtn).toBeTruthy()
  })

  test('cross button working fine', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { container } = render(
      <TestWrapper>
        <InputSetSelector value={multipleSelectedInputSets} {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )
    const crossbtn = container.querySelector('.bp3-popover-target .bp3-icon-cross')

    await waitFor(() => expect(crossbtn).toBeTruthy())

    if (crossbtn)
      act(() => {
        fireEvent.click(crossbtn)
      })

    expect(onChangeMock).toBeCalled()
  })

  test('Input set API return empty', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsListEmpty)

    const { getByText } = render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    await waitFor(() => expect(getByText('inputSets.noRecord')).toBeTruthy())
  })

  test('Input set with git details', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsListWithGitDetails)

    const { getByText } = render(
      <GitSyncTestWrapper>
        <InputSetSelector {...commonProps} value={multipleSelectedInputSetsWithGitDetails} />
      </GitSyncTestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    const inputSetListPopoverList = document.getElementsByClassName('popoverContainer')
    await waitFor(() => expect(inputSetListPopoverList).toBeDefined())
    expect(inputSetListPopoverList).toHaveLength(1)
    const inputSetListPopover = inputSetListPopoverList[0] as HTMLElement

    const allInputSetItems = within(inputSetListPopover).getAllByRole('listitem')
    const inputset1 = allInputSetItems[0]
    await waitFor(() => expect(inputset1).toBeTruthy())
    act(() => {
      fireEvent.click(inputset1)
    })

    // Checkif 'branch' is visible
    const inputSetWithGitRow = within(inputSetListPopover).getByTestId('popover-list-inputsetwithgit1')
    expect(within(inputSetWithGitRow).queryByText('master')).toBeTruthy()
  })

  test('Input set API has error', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsListError)

    const { queryByText } = render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('error message')).toBeTruthy())
  })

  test('Check if unchecking selected input set is working fine', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <InputSetSelector value={multipleSelectedInputSets} {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('is1')).toBeDefined())

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    const inputSetListPopoverList = document.getElementsByClassName('popoverContainer')
    await waitFor(() => expect(inputSetListPopoverList).toBeDefined())
    expect(inputSetListPopoverList).toHaveLength(1)
    const inputSetListPopover = inputSetListPopoverList[0] as HTMLElement
    const inputSet1 = within(inputSetListPopover).getByTestId('checkbox-is1')
    const inputSet2 = within(inputSetListPopover).getByTestId('checkbox-is1')
    const overlayIS1 = within(inputSetListPopover).getByTestId('checkbox-ol1')

    expect(inputSet1).toBeDefined()
    expect(inputSet2).toBeDefined()
    expect(overlayIS1).toBeDefined()

    let allCheckboxes = within(inputSetListPopover).getAllByRole('checkbox')
    expect(allCheckboxes).toHaveLength(3)
    expect(allCheckboxes[0]).toBeChecked()
    expect(allCheckboxes[1]).toBeChecked()
    expect(allCheckboxes[2]).not.toBeChecked()

    // Uncheck is1
    act(() => {
      fireEvent.click(inputSet1)
    })
    allCheckboxes = within(inputSetListPopover).getAllByRole('checkbox')
    expect(allCheckboxes[0]).not.toBeChecked()

    // Check ol1
    act(() => {
      fireEvent.click(overlayIS1)
    })
    allCheckboxes = within(inputSetListPopover).getAllByRole('checkbox')
    expect(allCheckboxes[2]).toBeChecked()
  })

  test('Perform drag and drop on selected input sets', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <InputSetSelector value={multipleSelectedInputSets} {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('is1')).toBeDefined())

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    const inputSetListPopoverList = document.getElementsByClassName('popoverContainer')
    await waitFor(() => expect(inputSetListPopoverList).toBeDefined())
    expect(inputSetListPopoverList).toHaveLength(1)
    const inputSetListPopover = inputSetListPopoverList[0] as HTMLElement

    const container1 = within(inputSetListPopover).getByTestId('0-inputset1')
    const container2 = within(inputSetListPopover).getByTestId('1-inputset2')

    act(() => {
      const dragStartEvent = Object.assign(createEvent.dragStart(container1), eventData)

      fireEvent(container1, dragStartEvent)
      fireEvent.dragEnd(container1)
      fireEvent.dragLeave(container1)

      const dropEffectEvent = Object.assign(createEvent.dragOver(container1), eventData)
      fireEvent(container2, dropEffectEvent)

      const dropEvent = Object.assign(createEvent.drop(container1), eventData)
      fireEvent(container2, dropEvent)
    })
  })

  test('should refetch input sets on search term change', async () => {
    const refetch = jest.fn()
    const mockUseGetInputSets = useGetInputSetsListForPipeline as jest.MockedFunction<
      typeof useGetInputSetsListForPipeline
    >

    mockUseGetInputSets.mockImplementation(() => ({
      refetch,
      absolutePath: '',
      cancel: jest.fn(),
      data: paginatedInputSetsResponse,
      loading: false,
      response: null,
      error: null
    }))
    render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )

    // input sets are fetched on mount
    await waitFor(() => expect(refetch).toHaveBeenCalled())

    fireEvent.click(screen.getByText('pipeline.inputSets.selectPlaceholder'))

    expect(await screen.findByText('inputSet23')).toBeInTheDocument()

    refetch.mockClear()

    const searchInput = screen.getByPlaceholderText('search')

    userEvent.type(searchInput, 'inputSet')
    await waitFor(() => expect(refetch).toHaveBeenCalled())
  })

  test('should refetch input sets on page index change', async () => {
    const refetch = jest.fn()
    const mockUseGetInputSets = useGetInputSetsListForPipeline as jest.MockedFunction<
      typeof useGetInputSetsListForPipeline
    >

    mockUseGetInputSets.mockImplementation(() => ({
      refetch,
      absolutePath: '',
      cancel: jest.fn(),
      data: paginatedInputSetsResponse,
      loading: false,
      response: null,
      error: null
    }))

    render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )

    // input sets are fetched on mount
    await waitFor(() => expect(refetch).toHaveBeenCalled())

    fireEvent.click(screen.getByText('pipeline.inputSets.selectPlaceholder'))

    expect(await screen.findByText('inputSet23')).toBeInTheDocument()

    refetch.mockClear()

    userEvent.click(screen.getByLabelText('Next'))
    await waitFor(() => expect(refetch).toHaveBeenCalled())
  })
})
