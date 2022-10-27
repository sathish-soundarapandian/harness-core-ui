/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import type { Target, Variation } from 'services/cf'
import ServeVariationToIndividualTarget, {
  ServeVariationToIndividualTargetProps,
  serveVariationToIndividualTargetSchema
} from '../ServeVariationToIndividualTarget'
import {
  getProfileInitials,
  mockServeVariationToIndividualTargetFieldValues as mockFieldValues,
  mockTargets,
  mockVariations,
  prefixInstructionField
} from './utils.mocks'

const renderComponent = (props: Partial<ServeVariationToIndividualTargetProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <ServeVariationToIndividualTarget
          fieldValues={mockFieldValues(mockTargets, mockVariations[0])}
          variations={mockVariations}
          targets={mockTargets}
          setField={jest.fn()}
          prefix={prefixInstructionField}
          subSectionSelector={<span />}
          {...props}
        />
      </Formik>
    </TestWrapper>
  )

describe('ServeVariationToIndividualTarget', () => {
  test('it should not display targets that are not part of the known targets', async () => {
    const fakeTarget = { name: 'NOT REAL', identifier: 'NOT_REAL' }
    const selectedTargets = [fakeTarget, mockTargets[0]] as Target[]
    const selectedVariation = mockVariations[0] as Variation

    renderComponent({
      fieldValues: mockFieldValues(selectedTargets, selectedVariation)
    })

    expect(screen.queryByText(getProfileInitials(fakeTarget.name))).not.toBeInTheDocument()
    expect(screen.getByText(getProfileInitials(selectedTargets[1].name))).toBeInTheDocument()
  })

  test('it should not display the variation if it is not part of the known variations', async () => {
    const fakeVariation = { name: 'NOT REAL', identifier: 'NOT_REAL' } as Variation
    const selectedTargets = [mockTargets[0], mockTargets[2]] as Target[]

    renderComponent({ fieldValues: mockFieldValues(selectedTargets, fakeVariation) })

    expect(screen.queryByText(fakeVariation.name as string)).not.toBeInTheDocument()
  })
})

describe('serveVariationToIndividualTargetSchema', () => {
  const getStringMock = jest.fn().mockImplementation(str => str)

  test('it should throw when targets and variation are not specified', async () => {
    expect(() => serveVariationToIndividualTargetSchema(getStringMock).validateSync({ spec: {} })).toThrow(
      'cf.featureFlags.flagPipeline.validation.serveVariationToIndividualTarget.variationTargets'
    )
  })

  test('it should not throw when targets and variation are specified', async () => {
    expect(() =>
      serveVariationToIndividualTargetSchema(getStringMock).validateSync({
        spec: { targets: ['abc'], variation: '123' }
      })
    ).not.toThrow()
  })
})
