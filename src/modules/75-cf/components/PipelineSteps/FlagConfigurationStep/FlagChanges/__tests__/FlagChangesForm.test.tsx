/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { act, getByRole, getByTestId, render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as ffServices from 'services/cf'
import type { FeatureFlagConfigurationInstruction, FlagConfigurationStepFormDataValues } from '../../types'
import {
  mockDefaultRulesFieldValues,
  mockServePercentageRolloutFieldValues,
  mockServeVariationToIndividualTargetFieldValues,
  mockServeVariationToTargetGroupsFieldValues,
  mockSetFlagSwitchFieldValues,
  mockTargetAttributes,
  mockTargetGroups,
  mockTargets,
  mockVariations
} from '../subSections/__tests__/utils.mocks'
import FlagChangesForm, { allSubSections, FlagChangesFormProps } from '../FlagChangesForm'

const mockFeature = {
  name: 'f1',
  identifier: 'f1',
  variations: mockVariations
} as ffServices.Feature

const mockInitialValues = {
  identifier: 'step',
  name: 'step',
  type: 'type',
  spec: {
    feature: 'feature',
    environment: 'env'
  }
}

const renderComponent = (
  props: Partial<FlagChangesFormProps> = {},
  initialValues: Partial<FlagConfigurationStepFormDataValues> = mockInitialValues
): RenderResult =>
  render(
    <TestWrapper>
      <Formik<FlagConfigurationStepFormDataValues>
        formName="test"
        onSubmit={jest.fn()}
        initialValues={initialValues as FlagConfigurationStepFormDataValues}
      >
        {({ values, setFieldValue }) => {
          if (props.setField) {
            if (jest.isMockFunction(props.setField)) {
              props.setField.mockImplementation((fieldName: string, value: unknown) => {
                setFieldValue(fieldName, value)
              })
            } else {
              const propSetField = props.setField
              props.setField = (fieldName: string, value) => {
                setFieldValue(fieldName, value)
                propSetField(fieldName, value)
              }
            }
          }

          if (props.clearField) {
            if (jest.isMockFunction(props.clearField)) {
              props.clearField.mockImplementation((fieldName: string) => {
                setFieldValue(fieldName, undefined)
              })
            } else {
              const propClearField = props.clearField
              props.clearField = (fieldName: string) => {
                setFieldValue(fieldName, undefined)
                propClearField(fieldName)
              }
            }
          }

          return (
            <FlagChangesForm
              clearField={fieldName => setFieldValue(fieldName, undefined)}
              setField={(fieldName, value) => setFieldValue(fieldName, value)}
              prefix={fieldName => fieldName}
              fieldValues={values}
              initialInstructions={get(initialValues, 'spec.instructions')}
              selectedFeature={mockFeature}
              environmentIdentifier="e1"
              {...props}
            />
          )
        }}
      </Formik>
    </TestWrapper>
  )

const getConfigureMoreButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'cf.pipeline.flagConfiguration.configureMore' })

describe('FlagChangesForm', () => {
  beforeEach(() => {
    jest
      .spyOn(ffServices, 'useGetAllSegments')
      .mockReturnValue({ data: { segments: mockTargetGroups }, loading: false, error: null, refetch: jest.fn() } as any)
    jest
      .spyOn(ffServices, 'useGetAllTargetAttributes')
      .mockReturnValue({ data: mockTargetAttributes, loading: false, error: null, refetch: jest.fn() } as any)
    jest
      .spyOn(ffServices, 'useGetAllTargets')
      .mockReturnValue({ data: { targets: mockTargets }, loading: false, error: null, refetch: jest.fn() } as any)
  })

  test('it should show the loading indicator when an API is loading', async () => {
    jest
      .spyOn(ffServices, 'useGetAllSegments')
      .mockReturnValue({ data: null, loading: true, error: null, refetch: jest.fn() } as any)

    renderComponent()

    expect(screen.getByTestId('flag-changes-form-loading')).toBeInTheDocument()
  })

  test('it should show the error screen when an API fails to load', async () => {
    jest
      .spyOn(ffServices, 'useGetAllSegments')
      .mockReturnValue({ data: null, loading: false, error: { message: 'ERROR' }, refetch: jest.fn() } as any)

    renderComponent()

    expect(screen.getByTestId('flag-changes-form-error')).toBeInTheDocument()
  })

  test('it should display the first sub-section when initially rendered', async () => {
    const { container } = renderComponent()

    expect(screen.queryByTestId('flag-changes-form-loading')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.subSection')).toHaveLength(1)
  })

  test('it should add another sub-section when the Configure More button is pressed', async () => {
    const { container } = renderComponent()

    expect(container.querySelectorAll('.subSection')).toHaveLength(1)

    const configureMoreButton = getConfigureMoreButton()
    expect(configureMoreButton).toBeInTheDocument()

    userEvent.click(configureMoreButton)
    await waitFor(() => {
      expect(container.querySelectorAll('.subSection')).toHaveLength(2)
    })
  })

  test('it should hide the Configure More button when all sub-sections are displayed', async () => {
    const expectedSubSections = allSubSections.length
    const { container } = renderComponent()

    const configureMoreButton = getConfigureMoreButton()

    await act(async () => {
      for (let clicks = 0; clicks < expectedSubSections - 1; clicks++) {
        await userEvent.click(configureMoreButton)
      }
    })

    expect(container.querySelectorAll('.subSection')).toHaveLength(expectedSubSections)
    expect(configureMoreButton).not.toBeInTheDocument()
  })

  test('it should display a remove sub-section button for each sub-section only when there is more than one sub-section', async () => {
    renderComponent()
    expect(screen.queryAllByTestId('flagChanges-removeSubSection')).toHaveLength(0)

    userEvent.click(getConfigureMoreButton())
    await waitFor(() => {
      expect(screen.getAllByTestId('flagChanges-removeSubSection')).toHaveLength(2)
    })
  })

  test('it should remove the sub-section which contains the remove sub-section button that is clicked', async () => {
    renderComponent()

    userEvent.click(getConfigureMoreButton())

    const setFlagSwitchSubSection = screen.getByTestId('flagChanges-setFlagSwitch')

    userEvent.click(getByTestId(setFlagSwitchSubSection, 'flagChanges-removeSubSection'))
    await waitFor(() => {
      expect(screen.queryByTestId('flagChanges-setFlagSwitch')).not.toBeInTheDocument()
    })
  })

  test('it should call the setField function when the sub-section is removed', async () => {
    const setFieldMock = jest.fn()
    renderComponent({ setField: setFieldMock })

    userEvent.click(getConfigureMoreButton())

    const setFlagSwitchSubSection = screen.getByTestId('flagChanges-setFlagSwitch')

    expect(setFieldMock).not.toHaveBeenCalledWith('spec.instructions', expect.anything())

    userEvent.click(getByTestId(setFlagSwitchSubSection, 'flagChanges-removeSubSection'))
    await waitFor(() => {
      expect(setFieldMock).toHaveBeenLastCalledWith('spec.instructions', expect.anything())
      expect([...setFieldMock.mock.calls].pop()[1]).toHaveLength(1)
    })
  })

  test('it should replace the sub-section when the sub-section selector is changed', async () => {
    const clearFieldMock = jest.fn()
    renderComponent({ clearField: clearFieldMock })

    const setFlagSwitchSubSection = screen.getByTestId('flagChanges-setFlagSwitch')
    expect(setFlagSwitchSubSection).toBeInTheDocument()
    expect(screen.queryByTestId('flagChanges-servePercentageRollout')).not.toBeInTheDocument()

    userEvent.click(getByRole(setFlagSwitchSubSection, 'button'))
    userEvent.click(screen.getByText('cf.pipeline.flagConfiguration.servePercentageRollout'))

    await waitFor(() => {
      expect(setFlagSwitchSubSection).not.toBeInTheDocument()
      expect(screen.getByTestId('flagChanges-servePercentageRollout')).toBeInTheDocument()
      expect(clearFieldMock).toHaveBeenCalledWith('spec.instructions[0]')
    })
  })

  test('it should render the correct sub-sections based on the initial spec', async () => {
    renderComponent({
      initialInstructions: [
        mockSetFlagSwitchFieldValues().spec?.instructions?.[0],
        mockDefaultRulesFieldValues(mockVariations[0], mockVariations[1]).spec?.instructions?.[0],
        mockServePercentageRolloutFieldValues(mockVariations).spec?.instructions?.[0],
        mockServeVariationToIndividualTargetFieldValues(mockTargets, mockVariations[0]).spec?.instructions?.[0],
        mockServeVariationToTargetGroupsFieldValues(mockTargetGroups, mockVariations[0]).spec?.instructions?.[0]
      ] as FeatureFlagConfigurationInstruction[]
    })

    await waitFor(() => {
      expect(screen.getByTestId('flagChanges-setFlagSwitch')).toBeInTheDocument()
      expect(screen.getByTestId('flagChanges-defaultRules')).toBeInTheDocument()
      expect(screen.getByTestId('flagChanges-servePercentageRollout')).toBeInTheDocument()
      expect(screen.getByTestId('flagChanges-serveVariationToIndividualTarget')).toBeInTheDocument()
      expect(screen.getByTestId('flagChanges-serveVariationToTargetGroup')).toBeInTheDocument()
    })
  })
})
