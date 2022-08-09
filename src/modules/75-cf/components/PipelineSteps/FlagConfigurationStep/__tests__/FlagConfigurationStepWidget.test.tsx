/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as ffServices from 'services/cf'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import * as cdngServices from 'services/cd-ng'
import mockFeatureFlags from '@cf/pages/feature-flags/__tests__/mockFeatureFlags'
import FlagConfigurationStepWidget, { FlagConfigurationStepWidgetProps } from '../FlagConfigurationStepWidget'
import { mockVariations } from '../FlagChanges/subSections/__tests__/utils.mocks'

const mockEnvironment = {
  name: 'Mock Environment',
  identifier: 'Mock_Environment'
} as cdngServices.EnvironmentResponseDTO

const mockInitialValues = {
  type: 'FlagConfiguration',
  name: 'Step 1 Test',
  identifier: 'Step_1_Test',
  spec: {
    feature: 'Test_Flag_1',
    environment: 'Mock_Environment'
  },
  timeout: '10m'
}

jest.mock('@pipeline/components/AbstractSteps/Step', () => {
  const stepModule = jest.requireActual('@pipeline/components/AbstractSteps/Step')

  return {
    ...stepModule,
    setFormikRef: jest.fn()
  }
})

const renderComponent = (props?: Partial<FlagConfigurationStepWidgetProps>): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/:pipelineIdentifier/pipeline-studio"
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        pipelineIdentifier: 'Pipeline_1'
      }}
      queryParams={{ stageId: 'FF_Stage_1', stepId: 'Step_1_Test' }}
    >
      <FlagConfigurationStepWidget
        initialValues={mockInitialValues}
        onUpdate={jest.fn()}
        ref={React.createRef()}
        isNewStep
        {...props}
      />
    </TestWrapper>
  )

describe('FlagConfigurationStepWidget', () => {
  const spyGetAllFeatures = jest.spyOn(ffServices, 'useGetAllFeatures')

  beforeAll(() => {
    jest.spyOn(cdngServices, 'useGetEnvironmentList').mockReturnValue({
      data: { data: { content: [{ environment: mockEnvironment }] } },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)
  })
  afterAll(() => {
    jest.clearAllMocks()
  })

  test('it should should display the loading indicator when an api is loading', async () => {
    spyGetAllFeatures.mockReturnValue({ data: null, loading: true, error: null, refetch: jest.fn() } as any)

    renderComponent()

    expect(screen.getByTestId('flag-configuration-step-widget-loading')).toBeVisible()
  })

  test('it should display the error when an api fails', async () => {
    spyGetAllFeatures.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'ERROR' },
      refetch: jest.fn()
    } as any)

    renderComponent()

    expect(screen.getByTestId('flag-configuration-step-widget-error')).toBeVisible()
  })

  test('it should render the form', async () => {
    const mockFeature = {
      name: 'Test Flag 1',
      identifier: 'Test_Flag_1',
      variations: mockVariations
    } as ffServices.Feature

    spyGetAllFeatures.mockReturnValue({
      data: { features: [mockFeature] },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    const { container } = renderComponent()
    expect(container).toMatchSnapshot()
  })

  describe('FlagConfigurationStepWidget form', () => {
    const spyGetFeatureFlag = jest.spyOn(ffServices, 'useGetFeatureFlag')

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('It should show the correct initialValues in the form inputs', async () => {
      renderComponent()

      expect(spyGetAllFeatures).toBeCalled()
      expect(spyGetFeatureFlag).toBeCalled()
      expect(document.querySelector('[name="name"]')).toHaveValue('Step 1 Test')
      expect(document.querySelector('[name="spec.environment"]')).toHaveValue('Mock Environment')
      expect(document.querySelector('[name="spec.feature"]')).toHaveValue('Test Flag 1')
    })

    test('It should prepend the saved flag on to the Select Flag MultitypeInput options when saved flag is not in first page of results', async () => {
      const savedFlagId = 'Test_Paging_Flag'
      const pagedResponse = {
        ...mockFeatureFlags,
        features: mockFeatureFlags.features.slice(0, CF_DEFAULT_PAGE_SIZE)
      }
      const mockFeatureFlag = mockFeatureFlags.features.find(flag => flag.identifier === savedFlagId)

      spyGetAllFeatures.mockReturnValue({ data: pagedResponse, loading: false, error: null, refetch: jest.fn() } as any)
      spyGetFeatureFlag.mockReturnValue({
        data: mockFeatureFlag,
        loading: false,
        error: null,
        refetch: jest.fn()
      } as any)

      renderComponent({
        initialValues: {
          type: 'FlagConfiguration',
          name: 'Step 1 Test',
          identifier: 'Step_1_Test',
          spec: {
            feature: savedFlagId,
            environment: 'Mock_Environment'
          },
          timeout: '10m'
        }
      })
      const flagInput = document.querySelector('[name="spec.feature"]') as HTMLElement

      expect(document.querySelector('[name="name"]')).toHaveValue('Step 1 Test')
      expect(document.querySelector('[name="spec.environment"]')).toHaveValue('Mock Environment')
      expect(flagInput).toHaveValue('Test Paging Flag')

      // Click the flag dropdown to display options
      userEvent.click(flagInput)
      const dropdownOptions = document.getElementsByTagName('li')

      // saved flag should be prepended to list
      expect(dropdownOptions).toHaveLength(CF_DEFAULT_PAGE_SIZE + 1)
      expect(dropdownOptions[0]).toHaveTextContent('Test Paging Flag')
    })

    test('It should NOT prepend the saved flag when the flag is in the first page of results', async () => {
      // mock array with length of 3
      const mockFeatures = {
        ...mockFeatureFlags,
        features: mockFeatureFlags.features.slice(-3)
      }

      spyGetAllFeatures.mockReturnValue({ data: mockFeatures, loading: false, error: null, refetch: jest.fn() } as any)

      renderComponent({
        initialValues: {
          type: 'FlagConfiguration',
          name: 'Step 1 Test',
          identifier: 'Step_1_Test',
          spec: {
            feature: 'X_Flag_11', // second flag in mockFeatures array
            environment: 'Mock_Environment'
          },
          timeout: '10m'
        }
      })

      const flagInput = document.querySelector('[name="spec.feature"]') as HTMLElement

      expect(document.querySelector('[name="name"]')).toHaveValue('Step 1 Test')
      expect(document.querySelector('[name="spec.environment"]')).toHaveValue('Mock Environment')
      expect(flagInput).toHaveValue('X Flag 11') // saved flag

      // Click the flag dropdown to display options
      userEvent.click(flagInput)
      const dropdownOptions = document.getElementsByTagName('li')

      // saved flag should be not have been prepended to list
      expect(dropdownOptions).toHaveLength(mockFeatures.features.length)
      expect(dropdownOptions[0]).toHaveTextContent('X Flag 10') // first flag in array
    })
  })
})
