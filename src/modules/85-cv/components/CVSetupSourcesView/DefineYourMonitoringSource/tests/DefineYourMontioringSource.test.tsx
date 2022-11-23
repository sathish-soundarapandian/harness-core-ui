/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { DefineYourMonitoringSource, DefineYourMonitoringSourceProps } from '../DefineYourMonitoringSource'

function WrapperComponent(props: Omit<DefineYourMonitoringSourceProps, 'formikProps'>): JSX.Element {
  return (
    <TestWrapper>
      <Formik onSubmit={() => undefined} initialValues={{}} formName="wrapperComponentTestForm">
        {formikProps => {
          return (
            <FormikForm>
              <DefineYourMonitoringSource {...props} formikProps={formikProps} />
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for DefineYourMonitoringSource', () => {
  test('Ensure card renders passed in props correctly', async () => {
    const { container } = render(
      <WrapperComponent
        iconLabel="New Relic"
        mainHeading="sdfsdfsd"
        subHeading="sdfsdf"
        sourceIcon={{ name: 'service-newrelic' }}
        stepLabelProps={{ stepNumber: 2, totalSteps: 3 }}
      />
    )
    await waitFor(() => expect(container.querySelector('[class*="defineMonitoringSource"]')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('Ensure that identifier is disabled oon edit', async () => {
    const { container } = render(
      <WrapperComponent
        iconLabel="New Relic"
        mainHeading="sdfsdfsd"
        subHeading="sdfsdf"
        sourceIcon={{ name: 'service-newrelic' }}
        stepLabelProps={{ stepNumber: 2, totalSteps: 3 }}
        isEdit={true}
      />
    )
    await waitFor(() => expect(container.querySelector('[class*="defineMonitoringSource"]')).not.toBeNull())
    expect(container.querySelector('[class*="txtIdContainer"] span[icon="edit"]')).toBeNull()
  })
})
