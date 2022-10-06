/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryAllByAttribute, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MultiTypeTagSelector from '../MultiTypeTagSelector'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const tagsFieldName = 'tags'

const formik = {
  setErrors: jest.fn(),
  errors: {},
  setFieldTouched: jest.fn(),
  setFieldValue: jest.fn(),
  values: {
    [tagsFieldName]: {}
  }
}

const initialTagsMock = {
  tag1: 'tag1Value'
}

describe('Test MultiTypeTagSelector component render', () => {
  test('test empty component render and click add', async () => {
    const { container } = render(
      <TestWrapper>
        <MultiTypeTagSelector
          allowableTypes={[]}
          formik={formik as any}
          tags={[]}
          isLoadingTags={false}
          name={tagsFieldName}
          initialTags={{}}
        />
      </TestWrapper>
    )

    const addBtn = queryAllByAttribute('type', container, 'button')[1]
    addBtn?.click()
    const inputElements = container.querySelectorAll('input')
    expect(inputElements.length).toBe(2)
  })
  test('test component with predefined tags', async () => {
    const { container } = render(
      <TestWrapper>
        <MultiTypeTagSelector
          allowableTypes={[]}
          formik={formik as any}
          tags={[]}
          isLoadingTags={false}
          name={tagsFieldName}
          initialTags={initialTagsMock}
        />
      </TestWrapper>
    )

    const inputElements = container.querySelectorAll('input')
    expect(inputElements.length).toBe(2)
  })

  test('test component with predefined tags and remove it', async () => {
    const { container } = render(
      <TestWrapper>
        <MultiTypeTagSelector
          allowableTypes={[]}
          formik={formik as any}
          tags={[]}
          isLoadingTags={false}
          name={tagsFieldName}
          initialTags={initialTagsMock}
        />
      </TestWrapper>
    )

    const removeBtn = queryAllByAttribute('type', container, 'button')[1]
    removeBtn?.click()
    const inputElements = container.querySelectorAll('input')
    expect(inputElements.length).toBe(0)
  })

  test('test component with multiple predefined tags', async () => {
    const { container } = render(
      <TestWrapper>
        <MultiTypeTagSelector
          allowableTypes={[]}
          formik={formik as any}
          tags={[]}
          isLoadingTags={false}
          name={tagsFieldName}
          initialTags={{
            tag1: 'tag1',
            tag2: 'tag2',
            tag3: 'tag3'
          }}
        />
      </TestWrapper>
    )

    const inputElements = container.querySelectorAll('input')
    expect(inputElements.length).toBe(6)
  })

  test('test component with loading tags', async () => {
    const { container } = render(
      <TestWrapper>
        <MultiTypeTagSelector
          allowableTypes={[]}
          formik={formik as any}
          tags={[]}
          isLoadingTags={true}
          name={tagsFieldName}
          initialTags={initialTagsMock}
        />
      </TestWrapper>
    )

    const inputElements = container.querySelectorAll('input')
    expect(inputElements.length).toBe(2)
  })
})
