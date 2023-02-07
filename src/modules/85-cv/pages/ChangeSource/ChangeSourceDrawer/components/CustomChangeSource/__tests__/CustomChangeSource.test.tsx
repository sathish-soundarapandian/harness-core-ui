/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import CustomChangeSource from '../CustomChangeSource'
import { customDeployData } from '../../../__tests__/ChangeSourceDrawer.mock'

const WrapperComponent = ({ value }: { value?: any }): JSX.Element => {
  return (
    <TestWrapper>
      <Formik initialValues={value} formName="test" onSubmit={noop}>
        {() => {
          return (
            <FormikForm>
              <CustomChangeSource />
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}
describe('Validate CustomChangeSource', () => {
  test('Should render with data', () => {
    const { getByText } = render(<WrapperComponent value={customDeployData} />)
    expect(getByText(customDeployData.spec.webhookUrl)).toBeInTheDocument()
    expect(getByText(customDeployData.spec.webhookCurlCommand)).toBeInTheDocument()
    render(<WrapperComponent />)
    render(<WrapperComponent value={{}} />)
    render(<WrapperComponent value={{ spec: {} }} />)
  })
})
