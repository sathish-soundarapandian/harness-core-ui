/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import { Formik, FormikForm, Button } from '@harness/uicore'
import { renderHook } from '@testing-library/react-hooks'
import { useStrings } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'
import type { NGTriggerSourceV2 } from 'services/pipeline-ng'
import { getTriggerConfigDefaultProps, getTriggerConfigInitialValues } from './scheduleMockConstants'
import { getValidationSchema, TriggerTypes } from '../utils/TriggersWizardPageUtils'
import TriggerOverviewPanel from '../views/TriggerOverviewPanel'
const defaultTriggerConfigDefaultProps = getTriggerConfigDefaultProps({})

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik
        formName="wrapperComponentForm"
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={getValidationSchema(
          TriggerTypes.SCHEDULE as unknown as NGTriggerSourceV2['type'],
          result.current.getString
        )}
        onSubmit={jest.fn()}
      >
        {formikProps => {
          return (
            <FormikForm>
              <TriggerOverviewPanel {...defaultTriggerConfigDefaultProps} formikProps={formikProps} />
              <Button text="Submit" className="submitButton" type="submit" />
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

describe('TriggerOverviewPanel Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Trigger Overview Panel', async () => {
      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)
      await waitFor(() => queryByText(container, result.current.getString('triggers.triggerOverviewPanel.title')))
      expect(container).toMatchSnapshot()
    })
  })
})
