/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { truncate } from 'lodash-es'
import { render, screen, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { InputOutputTab } from '../InputOutputTab'
import data from './io-1.json'

describe('<ExecutionStepInputOutputTab /> tests', () => {
  test('output snapshot test', async () => {
    const { container } = render(
      <TestWrapper>
        <InputOutputTab data={data.outcomes} mode="output" baseFqn="basefqn" />
      </TestWrapper>
    )
    await waitFor(() =>
      expect(
        container.querySelector('[data-fqn="basefqn.someotherkey.label.get(\\"part1.part2.part3\\")"')
      ).toBeVisible()
    )
    expect(container.querySelector('[data-fqn="basefqn.someotherkey.label.get(\\"part4-part5\\")"')).toBeVisible()
    expect(container).toMatchSnapshot()
  })

  test('output snapshot with no data', () => {
    const { container } = render(
      <TestWrapper>
        <InputOutputTab data={{}} mode="output" baseFqn="basefqn" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('input snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <InputOutputTab data={data.stepParameters} mode="input" baseFqn="basefqn" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should truncate rendered value based on maxValueLength', async () => {
    const maxValueLength = 20
    render(
      <TestWrapper>
        <InputOutputTab data={data.stepParameters} mode="input" baseFqn="basefqn" maxValueLength={maxValueLength} />
      </TestWrapper>
    )

    const truncatedValueToFind = truncate(
      data.stepParameters.pipelineInfrastructure.infrastructureDefinition.spec.connectorRef,
      { length: maxValueLength }
    )
    expect(await screen.findByText(truncatedValueToFind)).toBeInTheDocument()
  })
})
