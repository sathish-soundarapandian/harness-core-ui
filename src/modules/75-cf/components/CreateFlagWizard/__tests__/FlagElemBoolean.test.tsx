/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SelectOption } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { FlagTypeVariations } from '@cf/components/CreateFlagDialog/FlagDialogUtils'
import { FeatureFlagMutivariateKind } from '@cf/utils/CFUtils'
import FlagElemBoolean, { FlagElemBooleanProps } from '../FlagElemBoolean'

const renderComponent = (props: Partial<FlagElemBooleanProps> = {}): void => {
  const flagTypeOptionsMock: SelectOption[] = [
    { label: 'boolean', value: FlagTypeVariations.booleanFlag },
    { label: 'multivariate', value: FeatureFlagMutivariateKind.string }
  ]

  const TOTAL_WIZARD_STEPS = (): number => 2

  render(
    <TestWrapper
      path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagElemBoolean
        name="Create Boolean Flag Step 1"
        toggleFlagType={jest.fn()}
        flagTypeOptions={flagTypeOptionsMock}
        projectIdentifier="dummy"
        setModalErrorHandler={() => jest.fn()}
        isLoadingCreateFeatureFlag={false}
        previousStep={jest.fn()}
        nextStep={jest.fn()}
        currentStep={TOTAL_WIZARD_STEPS}
        totalSteps={TOTAL_WIZARD_STEPS}
        prevStepData={{}}
        {...props}
      />
    </TestWrapper>
  )
}

describe('FlagElemBoolean', () => {
  test('it should render flag type options and handle change correctly', () => {
    const flagToggleMock = jest.fn()
    renderComponent({ toggleFlagType: flagToggleMock })

    const kindDropdown = document.getElementsByName('kind')[0]
    expect(kindDropdown).toHaveValue('boolean')

    userEvent.click(kindDropdown)

    expect(screen.getByText('boolean')).toBeInTheDocument()
    expect(screen.getByText('multivariate')).toBeInTheDocument()

    userEvent.click(screen.getByText('boolean'))

    expect(flagToggleMock).toHaveBeenCalled()
  })

  test('it should update "True" value on input change', () => {
    renderComponent()

    const trueValueInput = document.getElementsByName('variations[0].name')[0]
    expect(trueValueInput).toHaveValue('True')

    userEvent.clear(trueValueInput)
    userEvent.type(trueValueInput, 'newTrueValue')

    expect(trueValueInput).toHaveValue('newTrueValue')
  })

  test('it should update "False" value on input change', () => {
    renderComponent()

    const falseValueInput = document.getElementsByName('variations[1].name')[0]
    expect(falseValueInput).toHaveValue('False')

    userEvent.clear(falseValueInput)
    userEvent.type(falseValueInput, 'newFalseValue')

    expect(falseValueInput).toHaveValue('newFalseValue')
  })

  test('it should call previousStep callback on "back" click', () => {
    const previousStepMock = jest.fn()
    const previouStepDataMock = { name: 'test 1' }
    renderComponent({ previousStep: previousStepMock, prevStepData: previouStepDataMock })

    const backButton = screen.getByText('back')
    expect(backButton).toBeInTheDocument()

    userEvent.click(backButton)

    expect(previousStepMock).toHaveBeenCalledWith(previouStepDataMock)
  })

  test('it should display "Save and Close" button if at end of wizard', async () => {
    const nextStepMock = jest.fn()
    const nextStepDataMock = {
      defaultOffVariation: 'false',
      defaultOnVariation: 'true',
      kind: 'boolean',
      variations: [
        {
          identifier: 'true',
          name: 'True',
          value: 'true'
        },
        {
          identifier: 'false',
          name: 'False',
          value: 'false'
        }
      ]
    }

    renderComponent({ nextStep: nextStepMock })

    const nextButton = screen.getByText('cf.creationModal.saveAndClose')
    expect(nextButton).toBeInTheDocument()

    userEvent.click(nextButton)

    await waitFor(() => expect(nextStepMock).toHaveBeenCalledWith(nextStepDataMock))
  })

  test('it should display "Next" button if more steps available', async () => {
    const nextStepMock = jest.fn()

    renderComponent({ nextStep: nextStepMock, totalSteps: () => 3 })

    const nextButton = screen.getByText('next')
    expect(nextButton).toBeInTheDocument()

    userEvent.click(nextButton)

    await waitFor(() => expect(nextStepMock).toHaveBeenCalled())
  })
})
