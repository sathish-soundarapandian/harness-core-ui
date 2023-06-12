import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdng from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import CustomSequenceDrawer from '../CustomSequence'
import { defaultSequenceData, getCustomSeqData, saveCustomSequencePromiseData } from './customSeqMocks'

export const findDrawerContainer = (): HTMLElement | null => document.querySelector('.bp3-drawer')

jest.mock('react-beautiful-dnd', () => {
  return {
    Droppable: (props: any) => {
      return <div>{props.children({ provided: {} })}</div>
    },
    DragDropContext: (props: any) => {
      return <div>{props.children}</div>
    },
    Draggable: (props: any) => props.children({ draggableProps: {}, dragHandleProps: {} })
  }
})

jest.mock('services/cd-ng', () => ({
  useGetCustomSequence: jest.fn().mockImplementation(() => {
    return { data: getCustomSeqData, refetch: jest.fn(), loading: false, error: false }
  }),
  useDefaultSequence: jest.fn().mockImplementation(() => {
    return { data: defaultSequenceData, refetch: jest.fn(), loading: false, error: false }
  }),
  saveCustomSequencePromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({
        data: saveCustomSequencePromiseData.data,
        status: saveCustomSequencePromiseData.status,
        refetch: jest.fn(),
        error: null,
        loading: false
      })
    })
  })
}))

const setDrawerOpen = jest.fn()
const afterSaveActions = jest.fn()

const getModuleParams = (module = 'cd') => ({
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module
})

const TEST_PATH = routes.toServiceStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

const renderDrawer = () =>
  render(
    <TestWrapper>
      <CustomSequenceDrawer drawerOpen={true} setDrawerOpen={setDrawerOpen} afterSaveActions={afterSaveActions} />
    </TestWrapper>
  )

describe('CustomSequence - ', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('Initial render', async () => {
    renderDrawer()

    const customSeqDrawer = findDrawerContainer()
    expect(customSeqDrawer?.querySelector('button[aria-label="save"]')).not.toBeDisabled()
    expect(customSeqDrawer?.querySelectorAll('[data-icon="drag-handle-vertical"]').length).toBe(5)
  })

  test('Test saving custom sequence - with default sequence', async () => {
    render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <CustomSequenceDrawer drawerOpen={true} setDrawerOpen={setDrawerOpen} afterSaveActions={afterSaveActions} />
      </TestWrapper>
    )

    const customSeqDrawer = findDrawerContainer()
    expect(customSeqDrawer?.querySelectorAll('[data-icon="drag-handle-vertical"]').length).toBe(5)

    //reset to default
    await userEvent.click(queryByText(customSeqDrawer!, 'cd.customSequence.resetToDefault')!)
    await userEvent.click(customSeqDrawer?.querySelector('button[aria-label="save"]')!)

    // save response with default sequence
    const response = {
      body: {
        envAndEnvGroupCardList: defaultSequenceData.data?.envAndEnvGroupCardList?.map(obj => ({ ...obj, new: false }))
      },
      queryParams: {
        accountIdentifier: 'accountId',
        orgIdentifier: 'orgIdentifier',
        projectIdentifier: 'projectIdentifier',
        serviceId: undefined
      }
    }

    await waitFor(() => expect(cdng.saveCustomSequencePromise).toHaveBeenCalledWith(response))
  })

  test('Test saving custom sequence - with custom sequence', async () => {
    jest.spyOn(cdng, 'useDefaultSequence').mockImplementation(() => {
      return { data: null, refetch: jest.fn(), loading: false, error: false } as any
    })
    render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <CustomSequenceDrawer drawerOpen={true} setDrawerOpen={setDrawerOpen} afterSaveActions={afterSaveActions} />
      </TestWrapper>
    )

    const customSeqDrawer = findDrawerContainer()
    expect(customSeqDrawer?.querySelectorAll('[data-icon="drag-handle-vertical"]').length).toBe(5)

    //saving custom sequence
    await userEvent.click(customSeqDrawer?.querySelector('button[aria-label="save"]')!)

    // save response with custom sequence
    const response = {
      body: {
        envAndEnvGroupCardList: getCustomSeqData.data?.envAndEnvGroupCardList?.map(obj => ({ ...obj, new: false }))
      },
      queryParams: {
        accountIdentifier: 'accountId',
        orgIdentifier: 'orgIdentifier',
        projectIdentifier: 'projectIdentifier',
        serviceId: undefined
      }
    }

    await waitFor(() => expect(cdng.saveCustomSequencePromise).toHaveBeenCalledWith(response))
    expect(afterSaveActions).toBeCalled()
  })

  test('Test saving custom sequence - error on save & sort icon behaviour', async () => {
    jest.spyOn(cdng, 'saveCustomSequencePromise').mockImplementation(() => {
      return new Promise(resolve => {
        resolve({ status: 'ERROR', data: saveCustomSequencePromiseData.data })
      })
    })
    render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <CustomSequenceDrawer drawerOpen={true} setDrawerOpen={setDrawerOpen} afterSaveActions={afterSaveActions} />
      </TestWrapper>
    )

    const customSeqDrawer = findDrawerContainer()

    /* --- test sort icon behaviour --- */
    const descIcon = (): any => customSeqDrawer?.querySelectorAll('[data-icon="main-caret-down"]')
    const incsIcon = (): any => customSeqDrawer?.querySelectorAll('[data-icon="main-caret-up"]')

    await userEvent.click(descIcon()?.[0]!)
    //desc icon should disappear
    expect(descIcon()?.length).toBe(1)

    await userEvent.click(incsIcon()?.[0]!)
    //both should appear
    expect(incsIcon()?.length).toBe(2)
    expect(descIcon()?.length).toBe(2)

    await userEvent.click(incsIcon()?.[0]!)
    //increase icon should disappear
    expect(incsIcon()?.length).toBe(1)

    /* --- saving custom sequence --- */
    await userEvent.click(customSeqDrawer?.querySelector('button[aria-label="save"]')!)

    // should not be called as promise returned error
    expect(afterSaveActions).not.toBeCalled()
    await userEvent.click(customSeqDrawer?.querySelector('[icon="cross"]')!)
  })
})

describe('CustomSequence - Empty, loading & Error states', () => {
  test('Empty state', async () => {
    jest.spyOn(cdng, 'useGetCustomSequence').mockImplementation(() => {
      return { data: [], refetch: jest.fn(), loading: false, error: false } as any
    })
    jest.spyOn(cdng, 'useDefaultSequence').mockImplementation(() => {
      return { data: [], refetch: jest.fn(), loading: false, error: false } as any
    })
    renderDrawer()

    const customSeqDrawer = findDrawerContainer()
    expect(customSeqDrawer?.querySelector('button[aria-label="save"]')).toBeDisabled()
    expect(queryByText(customSeqDrawer!, 'pipeline.ServiceDetail.envCardEmptyStateMsg')).toBeInTheDocument()
  })

  test('Loading state', async () => {
    jest.spyOn(cdng, 'useGetCustomSequence').mockImplementation(() => {
      return { data: [], refetch: jest.fn(), loading: true, error: false } as any
    })
    renderDrawer()

    const customSeqDrawer = findDrawerContainer()
    expect(customSeqDrawer?.querySelector('[data-icon="spinner"]')).toBeTruthy()
  })

  test('Error state', async () => {
    jest.spyOn(cdng, 'useGetCustomSequence').mockImplementation(() => {
      return {
        data: [],
        refetch: jest.fn(),
        loading: false,
        error: {
          message: 'failed to fetch'
        }
      } as any
    })
    renderDrawer()

    const customSeqDrawer = findDrawerContainer()
    const errorText = queryByText(customSeqDrawer!, 'failed to fetch')

    expect(errorText).toBeInTheDocument()
    const retry = customSeqDrawer?.querySelector('button[aria-label="Retry"]')
    expect(retry).toBeTruthy()
    await userEvent.click(retry!)
    expect(errorText).toBeInTheDocument()
  })
})
