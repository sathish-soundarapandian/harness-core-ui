/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { Text } from '@harness/uicore'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { CVStepper } from '../CVStepper'

const Wrapped = ({
  isStepValid,
  runValidationOnMount
}: {
  isStepValid: (stepId: string) => boolean
  runValidationOnMount?: boolean
}): React.ReactElement => {
  const [selectedStepId, setSelectedStepId] = React.useState<string>('Step1')
  const onChangeStep = (stepId: string, skipValidation?: boolean) => {
    setSelectedStepId(stepId)
    if (skipValidation) {
      noop()
    }
  }

  return (
    <CVStepper
      id="createSLOTabs"
      selectedStepId={selectedStepId}
      isStepValid={isStepValid}
      runValidationOnMount={runValidationOnMount}
      onChange={(stepId, skipValidation) => {
        onChangeStep(stepId, skipValidation)
      }}
      stepList={[
        {
          id: 'Step1',
          title: 'This is Step 1',
          panel: (
            <>
              <Text>Panel Step 1</Text>
            </>
          )
        },
        {
          id: 'Step2',
          title: 'This is Step 2',
          panel: (
            <>
              <Text>Panel Step 2</Text>
            </>
          )
        },
        {
          id: 'Step3',
          title: 'This is Step 3',
          panel: (
            <>
              <Text>Panel Step 3</Text>
            </>
          )
        }
      ]}
    />
  )
}

describe('Validate CVStepper', () => {
  test('render in create mode', () => {
    const isStepValid = jest.fn().mockReturnValue(true)
    const { container } = render(
      <TestWrapper>
        <Wrapped isStepValid={isStepValid} />
      </TestWrapper>
    )
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="edit"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="ring"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="ring"]')).toBeInTheDocument()
    expect(screen.getByText('next')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="backButton"]')).not.toBeInTheDocument()
    userEvent.click(screen.getByText('next'))
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="edit"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="ring"]')).toBeInTheDocument()
    expect(screen.getByText('back')).toBeInTheDocument()
    expect(screen.getByText('next')).toBeInTheDocument()
    userEvent.click(screen.getByText('next'))
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="edit"]')).toBeInTheDocument()
    expect(screen.getByText('back')).toBeInTheDocument()
    userEvent.click(screen.getByText('save'))
    expect(container.querySelector('[data-testid="nextButton"]')).toBeInTheDocument()

    // goto step 1 ( edit icon not visible on selected one as status is available )
    userEvent.click(container.querySelector('[data-testid="steptitle_Step1"]')!)
    // expect(container).toMatchSnapshot()
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="tick-circle"]')).toBeInTheDocument()
    userEvent.click(container.querySelector('[data-testid="steptitle_Step2"]')!)
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="tick-circle"]')).toBeInTheDocument()
    userEvent.click(container.querySelector('[data-testid="steptitle_Step3"]')!)
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
  })

  test('render in edit mode', () => {
    const isStepValid = (stepId: string) => {
      if (stepId === 'Step3') {
        return false
      } else {
        return true
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <Wrapped isStepValid={isStepValid} runValidationOnMount={true} />
      </TestWrapper>
    )

    // load with status with status
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="error"]')).toBeInTheDocument()

    // directly jump to step 3 in error state
    userEvent.click(container.querySelector('[data-testid="steptitle_Step3"]')!)
    expect(container).toMatchSnapshot()
    expect(getByText('Panel Step 3')).toBeInTheDocument()
    userEvent.click(screen.getByText('back'))
    expect(getByText('Panel Step 2')).toBeInTheDocument()
    userEvent.click(screen.getByText('back'))
    expect(getByText('Panel Step 1')).toBeInTheDocument()
  })
})
