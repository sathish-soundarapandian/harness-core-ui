/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Children, cloneElement, FC, ReactElement } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import type { Variation } from 'services/cf'
import ServePercentageRollout, {
  ServePercentageRolloutProps,
  servePercentageRolloutSchema
} from '../ServePercentageRollout'
import {
  mockServePercentageRolloutFieldValues,
  mockTargetGroups,
  mockVariations,
  prefixInstructionField
} from './utils.mocks'

const ComponentWrapper: FC = ({ children }) => (
  <TestWrapper>
    <Formik onSubmit={jest.fn()} initialValues={{ spec: { percentageRollout: { variation: {} } } }}>
      {({ values }) =>
        Children.toArray(children).map(child => cloneElement(child as ReactElement, { fieldValues: values }))
      }
    </Formik>
  </TestWrapper>
)

const Subject = ({
  variations,
  setField = jest.fn(),
  clearField = jest.fn(),
  ...props
}: Required<Pick<ServePercentageRolloutProps, 'variations'>> &
  Optional<Omit<ServePercentageRolloutProps, 'variations'>>): ReactElement => (
  <ServePercentageRollout
    variations={variations}
    targetGroups={mockTargetGroups}
    fieldValues={mockServePercentageRolloutFieldValues(variations)}
    clearField={clearField}
    setField={setField}
    prefix={prefixInstructionField}
    subSectionSelector={<span />}
    {...props}
  />
)

const renderComponent = (props: Partial<ServePercentageRolloutProps> = {}): RenderResult =>
  render(<Subject variations={mockVariations} {...props} />, { wrapper: ComponentWrapper })

describe('ServePercentageRollout', () => {
  test('it should render', async () => {
    renderComponent()

    expect(screen.getByText('cf.percentageRollout.toTargetGroup')).toBeInTheDocument()
  })

  test('it should set instruction fields when it renders', async () => {
    const setFieldMock = jest.fn()
    renderComponent({ setField: setFieldMock })

    await waitFor(() => {
      expect(setFieldMock).toHaveBeenCalledWith('identifier', 'AddRuleIdentifier')
      expect(setFieldMock).toHaveBeenCalledWith('type', 'AddRule')
      expect(setFieldMock).toHaveBeenCalledWith('spec.priority', 100)
      expect(setFieldMock).toHaveBeenCalledWith('spec.distribution.clauses[0].op', 'segmentMatch')
      expect(setFieldMock).toHaveBeenCalledWith('spec.distribution.clauses[0].attribute', '')
    })
  })

  test('it should set up a distribution variation for each passed variation', async () => {
    const setFieldMock = jest.fn()
    renderComponent({ variations: mockVariations, setField: setFieldMock })

    await waitFor(() => {
      mockVariations.forEach(({ identifier }, index) =>
        expect(setFieldMock).toHaveBeenCalledWith(expect.stringContaining(`variations[${index}].variation`), identifier)
      )
    })
  })

  test('it should prune unused variation values and set new ones when the variations list changes', async () => {
    const variations1: Variation[] = [
      { name: 'Test 1', identifier: 'test1', value: 'test1' },
      { name: 'Test 2', identifier: 'test2', value: 'test2' }
    ]

    const variations2: Variation[] = [
      { name: 'Test 3', identifier: 'test3', value: 'test3' },
      { name: 'Test 4', identifier: 'test4', value: 'test4' }
    ]

    const clearFieldMock = jest.fn()
    const setFieldMock = jest.fn()

    const { rerender } = renderComponent({
      variations: variations1,
      setField: setFieldMock,
      clearField: clearFieldMock
    })

    for (const { name, identifier } of variations1) {
      await userEvent.type(
        screen.getByText(name || identifier).parentElement?.parentElement?.querySelector('input') as HTMLInputElement,
        Math.floor(100 / variations1.length).toString()
      )
    }

    rerender(<Subject variations={variations2} setField={setFieldMock} clearField={clearFieldMock} />)

    await waitFor(() => {
      expect(clearFieldMock).toHaveBeenCalledWith('spec.distribution.variations')

      variations2.forEach(({ identifier }, index) => {
        expect(setFieldMock).toHaveBeenCalledWith(expect.stringContaining(`variations[${index}].variation`), identifier)
        expect(setFieldMock).toHaveBeenCalledWith(
          expect.stringContaining(`variations[${index}].weight`),
          expect.any(Number)
        )
      })
    })
  })

  test('it should automatically distribute weight between new passed variations', async () => {
    const variations1: Variation[] = [
      { name: 'Test 1', identifier: 'test1', value: 'test1' },
      { name: 'Test 2', identifier: 'test2', value: 'test2' }
    ]

    const variations2: Variation[] = [
      { name: 'Test 3', identifier: 'test3', value: 'test3' },
      { name: 'Test 4', identifier: 'test4', value: 'test4' },
      { name: 'Test 5', identifier: 'test5', value: 'test5' }
    ]

    const variations3: Variation[] = [
      { name: 'Test 6', identifier: 'test6', value: 'test6' },
      { name: 'Test 7', identifier: 'test7', value: 'test7' }
    ]

    const setFieldMock = jest.fn()
    const { rerender } = renderComponent({ variations: variations1, setField: setFieldMock })

    setFieldMock.mockClear()
    rerender(<Subject variations={variations2} setField={setFieldMock} />)

    await waitFor(() => {
      expect(setFieldMock).toHaveBeenCalledWith(expect.stringContaining(`variations[0]`), 33)
      expect(setFieldMock).toHaveBeenCalledWith(expect.stringContaining(`variations[1]`), 33)
      expect(setFieldMock).toHaveBeenCalledWith(expect.stringContaining(`variations[2]`), 34)
    })

    setFieldMock.mockClear()
    rerender(<Subject variations={variations3} setField={setFieldMock} />)

    await waitFor(() => {
      expect(setFieldMock).toHaveBeenCalledWith(expect.stringContaining(`variations[0]`), 50)
      expect(setFieldMock).toHaveBeenCalledWith(expect.stringContaining(`variations[1]`), 50)
    })
  })
})

describe('servePercentageRolloutSchema', () => {
  const getStringMock = jest.fn().mockImplementation(str => str)
  const validVariations = [{ weight: 50 }, { weight: 50 }]
  const validTargetGroup = [{ values: ['tg1'] }]

  test('it should throw when a Target Group is not specified', async () => {
    expect(() =>
      servePercentageRolloutSchema(getStringMock).validateSync(
        { spec: { distribution: { variations: validVariations } } },
        { abortEarly: false }
      )
    ).toThrow('cf.featureFlags.flagPipeline.validation.servePercentageRollout.targetGroup')
  })

  test('it should throw when variations are not specified', async () => {
    expect(() =>
      servePercentageRolloutSchema(getStringMock).validateSync(
        { spec: { distribution: { clauses: validTargetGroup } } },
        { abortEarly: false }
      )
    ).toThrow('cf.percentageRollout.invalidTotalError')
  })

  test('it should throw when variations are less than 100', async () => {
    expect(() =>
      servePercentageRolloutSchema(getStringMock).validateSync(
        { spec: { distribution: { clauses: validTargetGroup, variations: [{ weight: 10 }, { weight: 10 }] } } },
        { abortEarly: false }
      )
    ).toThrow('cf.percentageRollout.invalidTotalError')
  })

  test('it should throw when variations are more than 100', async () => {
    expect(() =>
      servePercentageRolloutSchema(getStringMock).validateSync(
        { spec: { distribution: { clauses: validTargetGroup, variations: [{ weight: 60 }, { weight: 60 }] } } },
        { abortEarly: false }
      )
    ).toThrow('cf.percentageRollout.invalidTotalError')
  })

  test('it should not throw when variations are equal to 100', async () => {
    expect(() =>
      servePercentageRolloutSchema(getStringMock).validateSync(
        { spec: { distribution: { clauses: validTargetGroup, variations: validVariations } } },
        { abortEarly: false }
      )
    ).not.toThrow()
  })

  test('it should throw with 2 errors when neither the Target Group nor variations are correct', async () => {
    expect(() =>
      servePercentageRolloutSchema(getStringMock).validateSync({ spec: { distribution: {} } }, { abortEarly: false })
    ).toThrow('2 errors occurred')
  })
})
