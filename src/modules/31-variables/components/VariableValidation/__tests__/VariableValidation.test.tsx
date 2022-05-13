/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'

import { render } from '@testing-library/react'

import { Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { Validation } from '@variables/utils/VariablesUtils'
import VariableValidation from '../VariableValidation'

describe('VariableValidation', () => {
  test.only('render component for Fixed', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop} formName="allowedValueTest">
          {formik => (
            <FormikForm>
              <VariableValidation formik={formik as any} />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'valueType',
        type: InputTypes.RADIOS,
        value: Validation.FIXED
      }
    ])
    expect(container).toMatchSnapshot()
  })

  test('render component for Fixed Set', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop} formName="allowedValueTest">
          {formik => (
            <FormikForm>
              <VariableValidation formik={formik as any} />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'valueType',
        type: InputTypes.RADIOS,
        value: Validation.FIXED_SET
      }
    ])
    expect(container).toMatchSnapshot()
  })

  test('render component for regex', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop} formName="allowedValueTest">
          {formik => (
            <FormikForm>
              <VariableValidation formik={formik as any} />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'valueType',
        type: InputTypes.RADIOS,
        value: Validation.REGEX
      }
    ])
    expect(container).toMatchSnapshot()
  })
})
