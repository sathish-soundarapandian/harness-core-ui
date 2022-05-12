/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByAttribute } from '@testing-library/react'
import { Formik } from 'formik'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import ipsWithDefaultValues from './inputSetsWithDefaultValues.json'
import { CustomVariableInputSet, CustomVariablesData } from '../CustomVariableInputSet'

interface TestComponentProps {
  path?: string
  pathParams?: any
  initialValues: CustomVariablesData
  executionIdentifier?: string
  template?: CustomVariablesData
  allValues?: CustomVariablesData
}

function TestComponent(props: TestComponentProps): React.ReactElement {
  const { path, pathParams, ...rest } = props
  return (
    <TestWrapper path={path} pathParams={pathParams}>
      <Formik onSubmit={jest.fn()} initialValues={props.initialValues}>
        <CustomVariableInputSet
          {...rest}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]}
        />
      </Formik>
    </TestWrapper>
  )
}

describe('<CustomVariableInputSet /> tests', () => {
  test('default value is used when executionIdentifier, executionId, triggerIdentifier are not present', () => {
    const { container } = render(<TestComponent initialValues={{ variables: [] }} {...(ipsWithDefaultValues as any)} />)

    const queryByName = <T extends HTMLElement>(name: string): T | null =>
      queryByAttribute('name', container, name) as T

    expect(container).toMatchSnapshot()
    expect(queryByName<HTMLInputElement>('variables[0].value')?.value).toBe('')
    expect(queryByName<HTMLInputElement>('variables[1].value')?.value).toBe('value2')
    expect(queryByName<HTMLInputElement>('variables[2].value')?.value).toBe('value3')
    expect(queryByName<HTMLInputElement>('variables[3].value')?.value).toBe('')
    expect(queryByName<HTMLInputElement>('variables[4].value')?.value).toBe('')
  })

  test('default value is not  used when executionIdentifier is present', () => {
    const { container } = render(
      <TestComponent
        executionIdentifier={'TEST_ID'}
        initialValues={{
          variables: [
            { name: 'var4', type: 'String', value: 'oldvalue4' },
            { name: 'var1', type: 'String', value: 'oldvalue1' },
            { name: 'var3', type: 'String', value: 'oldvalue3' }
          ]
        }}
        {...(ipsWithDefaultValues as any)}
      />
    )

    const queryByName = <T extends HTMLElement>(name: string): T | null =>
      queryByAttribute('name', container, name) as T

    expect(container).toMatchSnapshot()
    expect(queryByName<HTMLInputElement>('variables[0].value')?.value).toBe('oldvalue1')
    expect(queryByName<HTMLInputElement>('variables[1].value')?.value).toBe('')
    expect(queryByName<HTMLInputElement>('variables[2].value')?.value).toBe('oldvalue3')
    expect(queryByName<HTMLInputElement>('variables[3].value')?.value).toBe('oldvalue4')
    expect(queryByName<HTMLInputElement>('variables[4].value')?.value).toBe('')
  })

  test('default value is not  used when triggerIdentifier is present', () => {
    const { container } = render(
      <TestComponent
        path="/triggers/:triggerIdentifier"
        pathParams={{ triggerIdentifier: 'Test_ID' }}
        initialValues={{
          variables: [
            { name: 'var4', type: 'String', value: 'oldvalue4' },
            { name: 'var1', type: 'String', value: 'oldvalue1' },
            { name: 'var3', type: 'String', value: 'oldvalue3' }
          ]
        }}
        {...(ipsWithDefaultValues as any)}
      />
    )

    const queryByName = <T extends HTMLElement>(name: string): T | null =>
      queryByAttribute('name', container, name) as T

    expect(container).toMatchSnapshot()
    expect(queryByName<HTMLInputElement>('variables[0].value')?.value).toBe('oldvalue1')
    expect(queryByName<HTMLInputElement>('variables[1].value')?.value).toBe('')
    expect(queryByName<HTMLInputElement>('variables[2].value')?.value).toBe('oldvalue3')
    expect(queryByName<HTMLInputElement>('variables[3].value')?.value).toBe('oldvalue4')
    expect(queryByName<HTMLInputElement>('variables[4].value')?.value).toBe('')
  })

  test('default value is used triggerIdentifier is "new"', () => {
    const { container } = render(
      <TestComponent
        path="/triggers/:triggerIdentifier"
        pathParams={{ triggerIdentifier: 'new' }}
        initialValues={{
          variables: [
            { name: 'var4', type: 'String', value: 'oldvalue4' },
            { name: 'var1', type: 'String', value: 'oldvalue1' },
            { name: 'var3', type: 'String', value: 'oldvalue3' }
          ]
        }}
        {...(ipsWithDefaultValues as any)}
      />
    )

    const queryByName = <T extends HTMLElement>(name: string): T | null =>
      queryByAttribute('name', container, name) as T

    expect(container).toMatchSnapshot()
    expect(queryByName<HTMLInputElement>('variables[0].value')?.value).toBe('oldvalue1')
    expect(queryByName<HTMLInputElement>('variables[1].value')?.value).toBe('value2')
    expect(queryByName<HTMLInputElement>('variables[2].value')?.value).toBe('oldvalue3')
    expect(queryByName<HTMLInputElement>('variables[3].value')?.value).toBe('oldvalue4')
    expect(queryByName<HTMLInputElement>('variables[4].value')?.value).toBe('')
  })
})
