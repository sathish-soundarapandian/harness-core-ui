/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from '@wings-software/uicore'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SelectHealthSourceServices from '../SelectHealthSourceServices'
import { labelNamesResponse, metricPackResponse } from './SelectHealthSourceServices.mock'

describe('Validate SelectHealthSourceServices', () => {
  test('should render RiskProfile when continuousVerification and healthScore are true', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik
          initialValues={{ continuousVerification: true, healthScore: true }}
          onSubmit={jest.fn()}
          formName="runtimeInputsTest"
        >
          <SelectHealthSourceServices
            values={{ continuousVerification: true, healthScore: true, sli: false }}
            labelNamesResponse={labelNamesResponse as any}
            metricPackResponse={metricPackResponse as any}
          />
        </Formik>
      </TestWrapper>
    )
    expect(container.querySelector('input[name="sli"')).not.toBeChecked()
    expect(container.querySelector('input[name="healthScore"')).toBeChecked()
    expect(container.querySelector('input[name="continuousVerification"')).toBeChecked()
    expect(getByText('cv.monitoringSources.riskCategoryLabel')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.serviceInstanceIdentifier')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
  test('should not render RiskProfile when continuousVerification and healthScore are false', () => {
    const { container } = render(
      <TestWrapper>
        <Formik
          initialValues={{ continuousVerification: false, healthScore: false, sli: true }}
          onSubmit={jest.fn()}
          formName="runtimeInputsTest"
        >
          <SelectHealthSourceServices
            values={{ continuousVerification: false, healthScore: false, sli: true }}
            labelNamesResponse={labelNamesResponse as any}
            metricPackResponse={metricPackResponse as any}
          />
        </Formik>
      </TestWrapper>
    )
    expect(container.querySelector('input[name="sli"')).toBeChecked()
    expect(container.querySelector('input[name="healthScore"')).not.toBeChecked()
    expect(container.querySelector('input[name="continuousVerification"')).not.toBeChecked()
    expect(container.querySelector('label[for="riskCategory"]')).not.toBeInTheDocument()
    expect(container.querySelector('span[data-tooltip-id="mapPrometheus_serviceInstance"]')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render SLI if showOnlySLI prop is passed', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{ sli: true }} onSubmit={jest.fn()} formName="runtimeInputsTest">
          <SelectHealthSourceServices
            values={{ sli: true }}
            labelNamesResponse={labelNamesResponse as any}
            metricPackResponse={metricPackResponse as any}
            showOnlySLI
            hideCV
            hideSLIAndHealthScore
            hideServiceIdentifier
          />
        </Formik>
      </TestWrapper>
    )
    expect(container.querySelector('input[name="sli"')).toBeInTheDocument()
    expect(container.querySelector('input[name="healthScore"')).not.toBeInTheDocument()
    expect(container.querySelector('input[name="continuousVerification"')).not.toBeInTheDocument()
    expect(container.querySelector('label[for="riskCategory"]')).not.toBeInTheDocument()
    expect(container.querySelector('span[data-tooltip-id="mapPrometheus_serviceInstance"]')).not.toBeInTheDocument()
  })
})
