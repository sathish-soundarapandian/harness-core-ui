/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import SetFlagSwitch, { SetFlagSwitchProps, setFlagSwitchSchema } from '../SetFlagSwitch'
import { prefixInstructionField } from './utils.mocks'

let formValues = {}

const renderComponent = (props: Partial<SetFlagSwitchProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <Formik onSubmit={jest.fn()} initialValues={{}}>
        {({ values }) => {
          formValues = values

          return (
            <SetFlagSwitch
              subSectionSelector={<span />}
              setField={jest.fn()}
              prefix={prefixInstructionField}
              {...props}
            />
          )
        }}
      </Formik>
    </TestWrapper>
  )

describe('SetFlagSwitch', () => {
  test('it should display a select box with On and Off options', async () => {
    renderComponent()

    expect(screen.getByText('cf.pipeline.flagConfiguration.switchTo')).toBeInTheDocument()

    const input = document.querySelector('[name$="spec.state"]') as HTMLInputElement
    expect(input).toBeInTheDocument()

    expect(screen.queryByText('common.ON')).not.toBeInTheDocument()
    expect(screen.queryByText('common.OFF')).not.toBeInTheDocument()

    userEvent.click(input)

    expect(screen.getByText('common.ON')).toBeInTheDocument()
    expect(screen.getByText('common.OFF')).toBeInTheDocument()
  })

  test('it should properly set the value of the input on selection', async () => {
    renderComponent()

    const input = document.querySelector('[name$="spec.state"]') as HTMLInputElement
    expect(input).not.toHaveValue()

    userEvent.click(input)
    userEvent.click(screen.getByText('common.ON'))

    expect(get(formValues, prefixInstructionField('spec.state'))).toBe('on')

    userEvent.click(input)
    userEvent.click(screen.getByText('common.OFF'))

    expect(get(formValues, prefixInstructionField('spec.state'))).toBe('off')
  })
})

describe('setFlagSwitchSchema', () => {
  const getStringMock = jest.fn().mockImplementation(str => str)

  test('it should throw when state is not specified', async () => {
    expect(() => setFlagSwitchSchema(getStringMock).validateSync({ spec: {} })).toThrow(
      'cf.featureFlags.flagPipeline.validation.setFlagSwitch.state'
    )
  })

  test('it should not throw when state is specified', async () => {
    expect(() => setFlagSwitchSchema(getStringMock).validateSync({ spec: { state: 'ON' } })).not.toThrow()
  })
})
