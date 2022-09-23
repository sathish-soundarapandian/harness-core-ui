/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'react-router-dom'
import { Formik, FormikForm } from '@wings-software/uicore'
import userEvent from '@testing-library/user-event'
import { useMutateAsGet } from '@common/hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { mockPipelineTemplateYaml } from '@pipeline/components/PipelineStudio/PipelineCanvas/__tests__/PipelineCanvasTestHelper'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { createPipelinePromise } from 'services/pipeline-ng'
import { PipelineCanvas } from '@pipeline/components/PipelineStudio/PipelineCanvas/PipelineCanvas'
import { PipelineResponse } from '@pipeline/components/InputSetForm/__tests__/InputSetMocks'
import StageOverview from '../StageOverview'
import {
  getEditPipelineContext,
  getPipelineContext,
  mockIntersectionObserver,
  pipelineProps,
  showError,
  showSuccess,
  TEST_PATH,
  toasterClear
} from './StageOverviewTestHelper'

// Start of mocks

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ loading: false, refetch: jest.fn(), data: undefined })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetTestGitRepoConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve({ response: { data: { content: [] } } })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() }))
}))

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn()
}))

jest.mock('services/pipeline-ng', () => ({
  getPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve(PipelineResponse)),
  putPipelinePromise: jest.fn().mockResolvedValue({ status: 'Success' }),
  createPipelinePromise: jest.fn().mockResolvedValue({ status: 'Success' }),
  useCreateVariablesV2: jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ data: { yaml: '' } })) })),
  useGetSchemaYaml: jest.fn(() => ({})),
  useGetStepYamlSchema: jest.fn(() => ({})),
  useGetInputsetYaml: jest.fn(() => ({ data: null }))
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

jest.mock('@wings-software/uicore', () => ({
  ...jest.requireActual('@wings-software/uicore'),
  useToaster: jest.fn(() => ({ showError, showSuccess, clear: toasterClear }))
}))

window.IntersectionObserver = mockIntersectionObserver

// End of mocks

function RenderComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props || {}

  return (
    <TestWrapper
      path={TEST_PATH}
      pathParams={{
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'editPipeline',
        module: 'cf'
      }}
      defaultAppStoreValues={defaultAppStoreValues}
    >
      <PipelineContext.Provider value={getPipelineContext()}>
        <PipelineCanvas {...pipelineProps} />
        <StageOverview>
          <Formik initialValues={initialValues} onSubmit={() => undefined} formName="TestWrapper">
            {formikProps => (
              <FormikForm>
                <NameIdDescriptionTags formikProps={formikProps} />
              </FormikForm>
            )}
          </Formik>
        </StageOverview>
      </PipelineContext.Provider>
    </TestWrapper>
  )
}

describe('Stage Overview Tests', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useParams.mockImplementation(() => {
      return { pipelineIdentifier: DefaultNewPipelineId }
    })
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(() => {
      return mockPipelineTemplateYaml
    })
  })

  test(`it displays the overview tab `, async () => {
    render(<RenderComponent initialValues={{}} />)
    const overviewTab = screen.getByTestId('stageOverview')
    await waitFor(() => expect(overviewTab).toBeInTheDocument())
  })

  test(`it displays the Stage Overview Component `, async () => {
    render(<RenderComponent initialValues={{}} />)
    const overviewPanel = screen.getByTestId('stageOverviewPanel')
    await waitFor(() => expect(overviewPanel).toBeInTheDocument())
  })

  test(`it displays the save button as disabled until edit`, async () => {
    render(<RenderComponent initialValues={{}} />)
    userEvent.click(screen.getByText('save'))
    await waitFor(() => expect(createPipelinePromise).not.toBeCalled())
  })

  test('changing name causes save button to be enabled', async () => {
    render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'editPipeline',
          module: 'cf'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineContext.Provider value={getEditPipelineContext()}>
          <PipelineCanvas {...pipelineProps} />
          <StageOverview>
            <Formik initialValues={{}} onSubmit={() => undefined} formName="TestWrapper">
              {formikProps => (
                <FormikForm>
                  <NameIdDescriptionTags formikProps={formikProps} />
                </FormikForm>
              )}
            </Formik>
          </StageOverview>
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const nameTextbox = screen.getByPlaceholderText('common.namePlaceholder')
    await waitFor(() => expect(nameTextbox).toBeInTheDocument())
    userEvent.click(nameTextbox)
    userEvent.type(nameTextbox, 'Stage 1')
    userEvent.click(screen.getByText('save'))
    await waitFor(() => expect(createPipelinePromise).toBeCalled())
  })
})
