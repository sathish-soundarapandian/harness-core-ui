/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import ConditionalExecutionPanel from '../ConditionalExecutionPanel'

jest.mock('@common/components/MonacoEditor/MonacoEditor')

describe('ConditionalExecutionPanel', () => {
  test('matches snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={() => void 0} formName="conditionalExecutionPanelForm">
          {formikProps => {
            return <ConditionalExecutionPanel mode={Modes.STEP} isReadonly={false} formikProps={formikProps} />
          }}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
