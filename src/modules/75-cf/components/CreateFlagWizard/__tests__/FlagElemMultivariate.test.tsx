/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SelectOption } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { FlagTypeVariations } from '@cf/components/CreateFlagDialog/FlagDialogUtils'
import { FeatureFlagMutivariateKind } from '@cf/utils/CFUtils'
import FlagElemMultivariate, { FlagElemMultivariateProps } from '../FlagElemMultivariate'

const renderComponent = (props: Partial<FlagElemMultivariateProps> = {}): void => {
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
      <FlagElemMultivariate
        name={'Create Boolean Flag Step 1'}
        toggleFlagType={jest.fn()}
        flagTypeOptions={flagTypeOptionsMock}
        projectIdentifier="dummy"
        setModalErrorHandler={jest.fn()}
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

const setDefaultVariations = (): void => {
  const variationOption1Name = document.getElementsByName('variations.0.name')[0]
  const variationOption1Value = document.getElementsByName('variations.0.value')[0]

  userEvent.type(variationOption1Name, 'variation one')
  userEvent.type(variationOption1Value, 'On')

  const variationOption2Name = document.getElementsByName('variations.1.name')[0]
  const variationOption2Value = document.getElementsByName('variations.1.value')[0]

  userEvent.type(variationOption2Name, 'variation two')
  userEvent.type(variationOption2Value, 'Off')
}

describe('FlagElemMultivariate', () => {
  test('it should render flag type options and handle change correctly', () => {
    const flagToggleMock = jest.fn()
    renderComponent({ toggleFlagType: flagToggleMock })

    const kindDropdown = document.getElementsByName('kind')[0]
    expect(kindDropdown).toHaveValue('multivariate')

    userEvent.click(kindDropdown)

    expect(screen.getByText('boolean')).toBeInTheDocument()
    expect(screen.getByText('multivariate')).toBeInTheDocument()

    userEvent.click(screen.getByText('boolean'))

    expect(flagToggleMock).toHaveBeenCalled()
  })

  test('it should render data type options and handle change correctly', () => {
    renderComponent()

    const dataTypeDropdown = document.getElementsByName('dataTypes')[0]
    expect(dataTypeDropdown).toHaveValue('string')

    userEvent.click(dataTypeDropdown)

    expect(screen.getByText('string')).toBeInTheDocument()
    expect(screen.getByText('cf.creationModal.jsonType')).toBeInTheDocument()
    expect(screen.getByText('number')).toBeInTheDocument()

    userEvent.click(screen.getByText('number'))

    expect(dataTypeDropdown).toHaveValue('number')
  })

  test('it should render 2 empty variation options by default', () => {
    renderComponent()

    expect(document.getElementsByName('variations.0.name')[0]).toBeInTheDocument()
    expect(document.getElementsByName('variations.1.name')[0]).toBeInTheDocument()
  })

  test('it should add another variation option when add variation button clicked ', () => {
    renderComponent()

    const addVariationButton = screen.getByText('cf.shared.variation')
    expect(addVariationButton).toBeInTheDocument()

    userEvent.click(addVariationButton)

    const newVariationOption = document.getElementsByName('variations.2.name')[0]
    expect(newVariationOption).toBeInTheDocument()
  })

  test('it should delete variation option when delete icon clicked', () => {
    renderComponent()

    // add another variation
    const addVariationButton = screen.getByText('cf.shared.variation')
    expect(addVariationButton).toBeInTheDocument()

    userEvent.click(addVariationButton)

    const newVariationOption = document.getElementsByName('variations.2.name')[0]
    expect(newVariationOption).toBeInTheDocument()

    // assert
    const deleteButton = screen.getByTestId('delete_icon_2')
    expect(deleteButton).toBeInTheDocument()

    userEvent.click(deleteButton)

    expect(newVariationOption).not.toBeInTheDocument()
  })

  test('it should populate default ON rules dropdown with variation values', () => {
    renderComponent()

    setDefaultVariations()

    // assert
    const defaultOnVariationDropdown = document.getElementsByName('defaultOnVariation')[0]
    userEvent.click(defaultOnVariationDropdown)
    userEvent.click(screen.getByText('variation one'))

    expect(defaultOnVariationDropdown).toHaveValue('variation one')
  })

  test('it should populate default OFF rules dropdown with variation values', () => {
    renderComponent()

    setDefaultVariations()

    // assert
    const defaultOffVariationDropdown = document.getElementsByName('defaultOffVariation')[0]
    userEvent.click(defaultOffVariationDropdown)
    userEvent.click(screen.getByText('variation two'))

    expect(defaultOffVariationDropdown).toHaveValue('variation two')
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('it should display "Save and Close" button if at end of wizard', async () => {
    const nextStepMock = jest.fn()
    const nextStepDataMock = {
      defaultOffVariation: 'variation_one',
      defaultOnVariation: 'variation_one',
      kind: 'string',
      variations: [
        {
          identifier: 'variation_one',
          name: 'variation one',
          value: 'On'
        },
        {
          identifier: 'variation_two',
          name: 'variation two',
          value: 'Off'
        }
      ]
    }

    renderComponent({ nextStep: nextStepMock })

    setDefaultVariations()

    // select default rules
    const defaultOnVariationDropdown = document.getElementsByName('defaultOnVariation')[0]
    userEvent.click(defaultOnVariationDropdown)
    userEvent.click(screen.getAllByText('variation one')[0])

    const defaultOffVariationDropdown = document.getElementsByName('defaultOffVariation')[0]
    userEvent.click(defaultOffVariationDropdown)
    userEvent.click(screen.getAllByText('variation one')[1])

    const nextButton = screen.getByText('cf.creationModal.saveAndClose')
    expect(nextButton).toBeInTheDocument()

    userEvent.click(nextButton)

    await waitFor(() => expect(nextStepMock).toHaveBeenCalledWith(nextStepDataMock))
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

  test('it should display "Next" button if more steps available', async () => {
    const nextStepMock = jest.fn()

    const WIZARD_FINAL_STEP = 3
    renderComponent({ nextStep: nextStepMock, totalSteps: () => WIZARD_FINAL_STEP })

    const nextButton = screen.getByText('next')
    expect(nextButton).toBeInTheDocument()
  })
})
