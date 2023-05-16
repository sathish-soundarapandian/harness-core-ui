/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Formik } from 'formik'

import { TestWrapper } from '@common/utils/testUtils'

import type { MultiTypeFieldSelectorProps } from './MultiTypeFieldSelector';
import MultiTypeFieldSelector from './MultiTypeFieldSelector'

export default {
  title: 'Forms / MultiTypeFieldSelector',
  component: MultiTypeFieldSelector,
  argTypes: {
    label: { control: { type: 'text' } },
    name: { control: { type: 'text' } },
    disableTypeSelection: { control: { type: 'boolean' } },
    defaultValueToReset: { control: { type: 'text' } }
  }
} as Meta

export const Basic: Story<MultiTypeFieldSelectorProps> = args => {
  return (
    <TestWrapper>
      <Formik<Record<string, string>> initialValues={{}} onSubmit={() => void 0}>
        {formik => {
          return (
            <MultiTypeFieldSelector
              disableTypeSelection={args.disableTypeSelection}
              label={args.label}
              name={args.name}
              defaultValueToReset={args.defaultValueToReset}
            >
              <input
                style={{ width: '100%' }}
                type="text"
                name={args.name}
                value={formik.values[args.name] || ''}
                onChange={formik.handleChange}
              />
            </MultiTypeFieldSelector>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

Basic.args = {
  label: 'Field Label',
  name: 'fieldName',
  disableTypeSelection: false,
  defaultValueToReset: ''
}
