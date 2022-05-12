/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper, UseGetReturnData } from '@common/utils/testUtils'
import type * as pipelineng from 'services/pipeline-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { RightDrawer } from '../../RightDrawer/RightDrawer'
import pipelineContextMock, { mockBarriers } from '../../RightDrawer/__tests__/stateMock'
import { DrawerTypes } from '../../PipelineContext/PipelineActions'

jest.mock('@blueprintjs/core', () => ({
  ...(jest.requireActual('@blueprintjs/core') as any),
  // eslint-disable-next-line react/display-name
  Drawer: ({ children, title }: any) => (
    <div className="drawer-mock">
      {title}
      {children}
    </div>
  )
}))

const useGetBarriersSetupInfoList: UseGetReturnData<pipelineng.ResponseListBarrierSetupInfo> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: mockBarriers
  }
}

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),

  useMutateAsGet: jest.fn().mockImplementation(() => {
    return useGetBarriersSetupInfoList
  })
}))

const initial = () => {
  pipelineContextMock.stepsFactory.getStepData = () => undefined
  pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.FlowControl
  pipelineContextMock.state.pipelineView?.drawerData?.data &&
    (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
      isRollback: false,
      isParallelNodeClicked: false
    } as any)
}

describe('FlowControl tests', () => {
  test('should render fine', async () => {
    initial()

    const { findByText, container } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <RightDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )

    expect(container).toMatchSnapshot()
    const flowControlHeader = await findByText('pipeline.barriers.syncBarriers')
    expect(flowControlHeader).toBeInTheDocument()
  })

  test('should call createItem when add barrier is clicked', async () => {
    initial()
    pipelineContextMock.updatePipeline = jest.fn()

    const { container, findByText, getByText } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <RightDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )

    const addBarrierButton = await findByText('pipeline.barriers.addBarrier')
    expect(addBarrierButton).toBeTruthy()
    fireEvent.click(addBarrierButton)
    fireEvent.change(container.querySelector('input[name="barriers[0].name"]')!, { target: { value: 'demoId' } })
    await waitFor(() => fireEvent.click(getByText('pipeline.barriers.syncBarriers')))

    expect(container.querySelectorAll('[data-icon="main-trash"]').length).toBe(1)

    const applyChangeButton = await findByText('applyChanges')
    expect(applyChangeButton).toBeTruthy()
    await act(() => {
      fireEvent.click(applyChangeButton)
    })
    await waitFor(() => expect(pipelineContextMock.updatePipeline).toHaveBeenCalled())
  })

  test('should call deleteItem when delete icon is clicked', async () => {
    initial()
    pipelineContextMock.state.pipeline.flowControl = {
      barriers: mockBarriers
    }

    const { container } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <RightDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )

    //delete
    const listTrash = container.querySelectorAll('[data-icon="main-trash"]')
    await act(() => {
      fireEvent.click(listTrash[1])
    })

    //check if deleted
    expect(container.querySelectorAll('[data-icon="main-trash"]').length).toBe(1)
  })

  test('discard button should exist', async () => {
    initial()

    const { findByText } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <RightDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )

    const discardButton = await findByText('pipeline.discard')
    expect(discardButton).toBeTruthy()
    act(() => {
      fireEvent.click(discardButton)
    })
  })

  test('should render with no stages and delete', async () => {
    initial()
    pipelineContextMock.state.pipeline.flowControl = {
      barriers: [
        {
          identifier: 'demoId',
          name: 'demoName'
        },
        {
          identifier: 'demoId1',
          name: 'demoName1'
        }
      ]
    }
    const { container } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <RightDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )

    //delete
    const listTrash = container.querySelectorAll('[data-icon="main-trash"]')
    await act(() => {
      fireEvent.click(listTrash[1])
    })

    //check if deleted
    expect(container.querySelectorAll('[data-icon="main-trash"]').length).toBe(1)
  })
  test('should render barrier list with mode', async () => {
    initial()
    pipelineContextMock.state.pipeline.flowControl = {
      barriers: [
        {
          identifier: 'demoId',
          name: 'demoName',
          stages: [
            {
              name: 'demoStageName'
            },
            {
              name: 'demoStageName2'
            }
          ]
        },
        {
          identifier: 'demoId1',
          name: 'demoName1',
          mode: 'Add'
        } as any
      ]
    }
    const { container, getByText } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <RightDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    //delete
    const listTrash = container.querySelectorAll('[data-icon="main-trash"]')
    fireEvent.click(listTrash[1])

    expect(container.querySelectorAll('[data-icon="main-trash"]').length).toBe(1)

    //add new barrier
    fireEvent.click(getByText('pipeline.barriers.addBarrier'))
    fireEvent.change(container.querySelector('input[name="barriers[1].name"]')!, { target: { value: 'demoId' } })
    await waitFor(() => fireEvent.click(getByText('pipeline.barriers.syncBarriers')))

    expect(container.querySelectorAll('[data-icon="main-trash"]').length).toBe(2)
  })
})
