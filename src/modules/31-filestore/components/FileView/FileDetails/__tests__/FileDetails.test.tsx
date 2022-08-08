import React from 'react'
import {
  fireEvent,
  render,
  act,
  getByTestId,
  getByText,
  getAllByTestId,
  waitFor,
  findByTestId,
  act,
  findByText
} from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import type { FileStoreContextState } from '@filestore/components/FileStoreContext/FileStoreContext'

import FileDetails from '../FileDetails'
import { getDummyFileStoreContextValue, fileStoreContextMock } from './mocks/mocks'

jest.spyOn(cdngServices, 'useDownloadFile').mockImplementation(() => {
  return {
    data: {
      clone: () => {
        return {
          text: () =>
            new Promise(resolve => {
              resolve('123')
            })
        }
      }
    },
    loading: false,
    error: null
  } as any
})

const getLoader = (container: HTMLElement): Element => container.querySelector('[data-test="fileDetailsLoader"]')!
const getError = (container: HTMLElement): Element =>
  container.querySelector('[data-test="executionStrategyListError"]')!

describe('ExecutionStrategy test', () => {
  let rollingCard: HTMLElement
  let blueGreenCard: HTMLElement
  let canaryCard: HTMLElement
  let blankCanvasCard: HTMLElement
  let component: HTMLElement
  let fileStoreContextMockValue: FileStoreContextState
  beforeEach(() => {
    // jest
    //   .spyOn(cdngServices, 'useGetExecutionStrategyList')
    //   .mockImplementation(() => ({ data: executionStrategies, error: null } as any))

    fileStoreContextMockValue = getDummyFileStoreContextValue()
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectId/pipelines/:pipelineIdentifier/pipeline-studio"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          projectId: 'testProject',
          pipelineIdentifier: 'test'
        }}
        queryParams={{
          stageId: 'testStage',
          sectionId: 'EXECUTION'
        }}
      >
        <FileStoreContext.Provider value={fileStoreContextMockValue}>
          <FileDetails handleError={() => jest.fn()} />
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    component = container
    // rollingCard = getByTestId(component, 'Rolling-Card')
    // blueGreenCard = getByTestId(component, 'BlueGreen-Card')
    // canaryCard = getByTestId(component, 'Canary-Card')
    // blankCanvasCard = getByTestId(component, 'Default-Card')
  })

  test('Check file detaild header', async () => {
    jest.spyOn(cdngServices, 'useDownloadFile').mockImplementation(() => {
      return {
        data: {
          clone: () => {
            return {
              text: () =>
                new Promise(resolve => {
                  resolve('123')
                })
            }
          }
        },
        loading: false,
        error: null
      } as any
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectId/pipelines/:pipelineIdentifier/pipeline-studio"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          projectId: 'testProject',
          pipelineIdentifier: 'test'
        }}
        queryParams={{
          stageId: 'testStage',
          sectionId: 'EXECUTION'
        }}
      >
        <FileStoreContext.Provider value={fileStoreContextMockValue}>
          <FileDetails handleError={() => jest.fn()} />
        </FileStoreContext.Provider>
      </TestWrapper>
    )
    const Container = await findByTestId(container, 'details-container')
    expect(Container).toBeInTheDocument()
    const formContainer = await findByTestId(container, 'details-form-container')
    expect(formContainer).toBeInTheDocument()

    const submitBtn = await findByText(container, 'cancel')
    expect(submitBtn).toBeInTheDocument()
  })
  test('file details is loading', async () => {
    jest.spyOn(cdngServices, 'useDownloadFile').mockImplementation(() => {
      return {
        data: {
          clone: () => {
            return {
              text: () =>
                new Promise(resolve => {
                  resolve('123')
                })
            }
          }
        },
        loading: true,
        error: null
      } as any
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectId/pipelines/:pipelineIdentifier/pipeline-studio"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          projectId: 'testProject',
          pipelineIdentifier: 'test'
        }}
        queryParams={{
          stageId: 'testStage',
          sectionId: 'EXECUTION'
        }}
      >
        <FileStoreContext.Provider value={fileStoreContextMockValue}>
          <FileDetails handleError={() => jest.fn()} />
        </FileStoreContext.Provider>
      </TestWrapper>
    )
    const loader = await findByTestId(container, 'fileDetailsLoader')
    await waitFor(() => {
      expect(loader).toBeInTheDocument()
    })
  })

  test.skip('wrong format is display', async () => {
    jest.spyOn(cdngServices, 'useDownloadFile').mockImplementation(() => {
      return {
        data: {
          clone: () => {
            return {
              text: () =>
                new Promise(resolve => {
                  resolve('123')
                })
            }
          }
        },
        loading: true,
        error: null
      } as any
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectId/pipelines/:pipelineIdentifier/pipeline-studio"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          projectId: 'testProject',
          pipelineIdentifier: 'test'
        }}
        queryParams={{
          stageId: 'testStage'
        }}
      >
        <FileStoreContext.Provider
          value={{
            ...fileStoreContextMockValue,
            tempNodes: []
          }}
        >
          <FileDetails handleError={() => jest.fn()} />
        </FileStoreContext.Provider>
      </TestWrapper>
    )
    const submitBtn = await findByText(container, 'cancel')
    expect(submitBtn).toBeInTheDocument()
    // await act(async () => {
    //   fireEvent.change(container.querySelector("textarea[name='description']")!, { target: { value: 'new desc' } })
    //   const submitBtn = await findByText(container, 'save')
    //   fireEvent.click(submitBtn)
    // })
  })
})
