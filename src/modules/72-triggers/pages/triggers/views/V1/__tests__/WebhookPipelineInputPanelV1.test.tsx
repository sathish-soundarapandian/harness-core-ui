/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { renderHook } from '@testing-library/react-hooks'
import { useGetPipelineInputsQuery } from '@harnessio/react-pipeline-service-client'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TestWrapper } from '@common/utils/testUtils'
import { useStrings } from 'framework/strings'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import {
  ConnectorResponse,
  GetEnvironmentList,
  pipelineInputInitialValues,
  getTriggerConfigDefaultProps
} from './mocks'

import WebhookPipelineInputPanelV1 from '../WebhookPipelineInputPanelV1'
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),

  useMutateAsGet: jest.fn()
}))

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))
jest.mock('@harnessio/react-pipeline-service-client', () => ({
  useGetPipelineInputsQuery: jest.fn(() => ({}))
}))
jest.mock('services/cd-ng', () => ({
  useGetEnvironmentAccessList: jest.fn(() => GetEnvironmentList),
  useGetConnector: jest.fn(() => ConnectorResponse),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

const defaultTriggerConfigDefaultProps = getTriggerConfigDefaultProps({})

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper
      path="/account/:accountId/org/:orgIdentifier/project/:projectIdentifier"
      pathParams={{
        projectIdentifier: 'projectIdentifier',
        orgIdentifier: 'orgIdentifier',
        accountId: 'accountId'
      }}
    >
      <Formik initialValues={pipelineInputInitialValues} onSubmit={() => undefined} formName="wrapperComponentTestForm">
        {formikProps => (
          <FormikForm>
            <PipelineContext.Provider
              value={
                {
                  state: { pipeline: { name: '', identifier: '' } } as any,
                  getStageFromPipeline: jest.fn((_stageId, pipeline) => ({
                    stage: pipeline.stages[0],
                    parent: undefined
                  }))
                } as any
              }
            >
              <WebhookPipelineInputPanelV1 {...defaultTriggerConfigDefaultProps} formikProps={formikProps} />
            </PipelineContext.Provider>
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('WebhookPipelineInputPanelV1 Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Pipeline Input Panel with no inputs', async () => {
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('triggers.pipelineInputLabel')).toBeTruthy())
      expect(container).toMatchSnapshot()
    })

    test('Initial Render - Pipeline Input Panel with CI Codebase inputs', async () => {
      const mockCodebaseInputs = {
        data: {
          repository: {
            reference: 'branch',
            value: ''
          }
        },
        status: 'SUCCESS'
      }
      ;(useGetPipelineInputsQuery as jest.Mock).mockImplementation().mockReturnValue(mockCodebaseInputs)
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('triggers.pipelineInputLabel')).toBeTruthy())
      await waitFor(() => expect(result.current.getString('ciCodebase')).toBeTruthy())
      expect(container).toMatchSnapshot()
    })

    test('Initial Render - Pipeline Input Panel with runtime inputs', async () => {
      const mockCodebaseInputs = {
        inputs: {
          image: {
            prompt: false,
            required: true,
            default: 'golang',
            type: 'string',
            desc: 'image name'
          },
          repo: {
            prompt: true,
            required: true,
            type: 'string',
            desc: 'repository name'
          }
        },
        repository: {
          reference: {
            type: {
              prompt: false,
              required: true,
              type: 'string',
              enums: ['branch', 'tag', 'pr']
            },
            value: {
              prompt: false,
              required: true,
              type: 'string'
            }
          }
        }
      }
      ;(useGetPipelineInputsQuery as jest.Mock).mockImplementation().mockReturnValue(mockCodebaseInputs)
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('connectors.parameters')).toBeTruthy())
      expect(container).toMatchSnapshot()
    })
  })
})
