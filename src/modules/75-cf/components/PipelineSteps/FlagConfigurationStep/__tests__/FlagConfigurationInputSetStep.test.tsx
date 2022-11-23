/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep } from 'lodash-es'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik, FormikForm, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { Feature } from 'services/cf'
import * as cfServices from 'services/cf'
import FlagConfigurationInputSetStep, { FlagConfigurationInputSetStepProps } from '../FlagConfigurationInputSetStep'

const mockFeatures = [
  { name: 'Feature 1', identifier: 'f1' },
  { name: 'Feature 2', identifier: 'f2' },
  { name: 'Feature 3', identifier: 'f3' }
] as Feature[]

jest.mock('../FlagChanges/FlagChangesForm', () => ({
  __esModule: true,
  default: () => <span data-testid="flag-changes-form" />
}))

const renderComponent = (props: Partial<FlagConfigurationInputSetStepProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <Formik
        formName="test"
        onSubmit={jest.fn()}
        initialValues={{ stages: [{ stage: { spec: { execution: { steps: [{ step: {} }] } } } }] }}
      >
        <FormikForm>
          <FlagConfigurationInputSetStep
            existingValues={{ spec: { environment: 'e1' } } as FlagConfigurationInputSetStepProps['existingValues']}
            template={
              {
                spec: { feature: RUNTIME_INPUT_VALUE, instructions: RUNTIME_INPUT_VALUE }
              } as FlagConfigurationInputSetStepProps['template']
            }
            pathPrefix="stages[0].stage.spec.execution.steps[0].step"
            {...props}
          />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )

describe('FlagConfigurationInputSetStep', () => {
  let useGetAllFeaturesMock: jest.SpyInstance

  beforeEach(() => {
    useGetAllFeaturesMock = jest
      .spyOn(cfServices, 'useGetAllFeatures')
      .mockReturnValue({ data: [], loading: false, error: null, refetch: jest.fn() } as any)
  })

  describe('Select feature', () => {
    const template = {
      spec: { feature: RUNTIME_INPUT_VALUE }
    } as FlagConfigurationInputSetStepProps['template']

    test('it should display the features select when the template spec value is set as runtime', async () => {
      renderComponent({ template })

      expect(screen.getByText('cf.pipeline.flagConfiguration.selectFlag')).toBeInTheDocument()
    })

    test('it should not display the features select when the template spec value set as static', async () => {
      const staticTemplate = {
        spec: { feature: 'something else' }
      } as FlagConfigurationInputSetStepProps['template']
      renderComponent({ template: staticTemplate })

      expect(screen.queryByText('cf.pipeline.flagConfiguration.selectFlag')).not.toBeInTheDocument()
    })

    test('it should display the error if the features fail to load', async () => {
      const errorMessage = 'TEST ERROR MESSAGE'
      const refetchMock = jest.fn()
      useGetAllFeaturesMock.mockReturnValue({
        data: [],
        loading: false,
        error: { data: { message: errorMessage } },
        refetch: refetchMock
      })

      renderComponent({ template })

      expect(screen.queryByText('cf.pipeline.flagConfiguration.selectFlag')).not.toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()

      const btn = screen.getByRole('button', { name: 'Retry' })
      expect(btn).toBeInTheDocument()
      expect(refetchMock).not.toHaveBeenCalled()

      userEvent.click(btn)

      await waitFor(() => expect(refetchMock).toHaveBeenCalled())
    })

    test('it should display the returned features', async () => {
      useGetAllFeaturesMock.mockReturnValue({
        data: { features: mockFeatures },
        loading: false,
        error: null,
        refetch: jest.fn()
      })

      renderComponent({ template })

      const field = screen
        .getByText('cf.pipeline.flagConfiguration.selectFlag')
        ?.parentElement?.parentElement?.querySelector('input') as HTMLInputElement
      expect(field).toBeInTheDocument()

      userEvent.click(field)

      await waitFor(() => {
        mockFeatures.forEach(({ name }) => expect(screen.getByText(name)).toBeInTheDocument())
      })
    })

    test('it should try to search for features when the user types', async () => {
      const flagSearch = 'TEST FLAG SEARCH'
      const refetchMock = jest.fn()
      useGetAllFeaturesMock.mockReturnValue({ data: [], loading: false, error: null, refetch: refetchMock })

      renderComponent({ template })

      const field = screen
        .getByText('cf.pipeline.flagConfiguration.selectFlag')
        ?.parentElement?.parentElement?.querySelector('input') as HTMLInputElement
      expect(field).toBeInTheDocument()
      expect(refetchMock).not.toHaveBeenCalled()

      await userEvent.type(field, flagSearch)

      await waitFor(() => {
        expect(refetchMock).toBeCalledWith(
          expect.objectContaining({
            queryParams: expect.objectContaining({ name: flagSearch })
          })
        )
      })
    })

    test('it should disable the input if readonly is set', async () => {
      renderComponent({ template, readonly: true })

      const field = screen
        .getByText('cf.pipeline.flagConfiguration.selectFlag')
        ?.parentElement?.parentElement?.querySelector('input') as HTMLInputElement
      expect(field).toBeDisabled()
    })
  })

  describe('FlagChanges', () => {
    const basicProps = {
      template: {
        spec: { instructions: RUNTIME_INPUT_VALUE }
      } as FlagConfigurationInputSetStepProps['template'],
      existingValues: {
        spec: { feature: 'f1', environment: 'e1' }
      } as FlagConfigurationInputSetStepProps['existingValues']
    }

    beforeEach(() => {
      useGetAllFeaturesMock.mockReturnValue({
        data: { features: mockFeatures },
        loading: false,
        error: null,
        refetch: jest.fn()
      })
    })

    test('it should display the flag changes section if spec.instructions is set as runtime', async () => {
      renderComponent(basicProps)

      expect(screen.getByText('cf.pipeline.flagConfiguration.flagChanges')).toBeInTheDocument()
      expect(screen.getByTestId('flag-changes-form')).toBeInTheDocument()
    })

    test("it should display the select feature message when the feature was runtime and hasn't been selected", async () => {
      const mockTemplate = cloneDeep(basicProps.template)
      if (mockTemplate?.spec.feature) {
        mockTemplate.spec.feature = RUNTIME_INPUT_VALUE
      }

      renderComponent({
        template: mockTemplate,
        existingValues: {
          spec: { environment: 'e1' }
        } as FlagConfigurationInputSetStepProps['existingValues']
      })

      expect(screen.getByText('cf.pipeline.flagConfiguration.flagChanges')).toBeInTheDocument()
      expect(screen.getByTestId('flag-changes-no-flag-selected')).toBeInTheDocument()
    })
  })
})
