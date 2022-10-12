/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByAttribute, findByText as findByTextGlobal, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import { times } from 'lodash-es'
import * as Yup from 'yup'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import { FormMultiTypeMultiSelectDropDown } from './MultiTypeMultiSelectDropDown'

const items = times(5, i => ({ label: `Item ${i}`, value: `item_${i}` }))

describe('<MultiTypeMultiSelectDropDown /> tests', () => {
  test('Fixed Input', () => {
    const { container } = render(
      <Formik initialValues={{ foo: items.slice(0, 2) }} onSubmit={jest.fn()}>
        <FormMultiTypeMultiSelectDropDown
          name="foo"
          label="Foo"
          dropdownProps={{ items }}
          multiTypeProps={{ className: 'foo' }}
        />
      </Formik>
    )
    expect(container).toMatchSnapshot()
    expect(queryByAttribute('data-icon', container, 'fixed-input')).toBeInTheDocument()
  })

  test('Fixed Input with error', () => {
    const { container, queryByText } = render(
      <Formik
        initialValues={{ foo: items.slice(0, 2) }}
        onSubmit={jest.fn()}
        initialErrors={{ foo: 'required' }}
        initialTouched={{ foo: [] }}
      >
        <FormMultiTypeMultiSelectDropDown
          name="foo"
          label="Foo"
          dropdownProps={{ items }}
          multiTypeProps={{ className: 'foo' }}
        />
      </Formik>
    )
    expect(container).toMatchSnapshot()
    expect(queryByText('required')).toBeInTheDocument()
  })

  test('Runtime Input', () => {
    const { container } = render(
      <Formik initialValues={{ foo: '<+input>' }} onSubmit={jest.fn()}>
        <FormMultiTypeMultiSelectDropDown name="foo" label="Foo" dropdownProps={{ items }} />
      </Formik>
    )
    expect(container).toMatchSnapshot()
    expect(queryByAttribute('data-icon', container, 'runtime-input')).toBeInTheDocument()
  })

  test('Expression Input', () => {
    const { container } = render(
      <Formik initialValues={{ foo: '<+pipeline.name>' }} onSubmit={jest.fn()}>
        <FormMultiTypeMultiSelectDropDown name="foo" label="Foo" dropdownProps={{ items }} />
      </Formik>
    )
    expect(container).toMatchSnapshot()
    expect(queryByAttribute('data-icon', container, 'expression-input')).toBeInTheDocument()
  })

  test('Runtime Input - Configuration Options', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{ foo: '<+input>' }} onSubmit={jest.fn()}>
          <FormMultiTypeMultiSelectDropDown name="foo" label="Foo" dropdownProps={{ items }} enableConfigureOptions />
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(queryByAttribute('data-icon', container, 'runtime-input')).toBeInTheDocument()
    expect(queryByAttribute('data-icon', container, 'cog')).toBeInTheDocument()
  })

  test('Change to runtime works', async () => {
    const { container } = render(
      <Formik initialValues={{ foo: items.slice(0, 2) }} onSubmit={jest.fn()}>
        <FormMultiTypeMultiSelectDropDown name="foo" label="Foo" dropdownProps={{ items }} />
      </Formik>
    )

    const fixedIcon = container.querySelector('.MultiTypeInput--btn')!
    userEvent.click(fixedIcon)

    const runtimeMenu = await findByTextGlobal(document.body, 'Runtime input')
    userEvent.click(runtimeMenu)

    await waitFor(() => expect(queryByAttribute('placeholder', container, '<+input>')).toBeInTheDocument())
  })

  test('Change to expression works', async () => {
    const { container } = render(
      <Formik initialValues={{ foo: items.slice(0, 2) }} onSubmit={jest.fn()}>
        <FormMultiTypeMultiSelectDropDown name="foo" label="Foo" dropdownProps={{ items }} />
      </Formik>
    )

    const fixedIcon = container.querySelector('.MultiTypeInput--btn')!
    userEvent.click(fixedIcon)

    const runtimeMenu = await findByTextGlobal(document.body, 'Expression')
    userEvent.click(runtimeMenu)

    await waitFor(() => expect(queryByAttribute('placeholder', container, '<+expression>')).toBeInTheDocument())
  })

  test('validation', async () => {
    const { container, findByText } = render(
      <Formik initialValues={{}} onSubmit={jest.fn()} validationSchema={Yup.object({ foo: Yup.string().required() })}>
        {formik => (
          <div>
            <FormMultiTypeMultiSelectDropDown
              name="foo"
              label="Foo"
              dropdownProps={{ items }}
              multiTypeProps={{ className: 'foo' }}
            />
            <button onClick={formik.submitForm}>submit</button>
          </div>
        )}
      </Formik>
    )

    const submit = await findByText('submit')

    userEvent.click(submit)

    await waitFor(() => expect(container.querySelector('.hasError')).toBeInTheDocument())

    expect(container).toMatchSnapshot()
  })
})
