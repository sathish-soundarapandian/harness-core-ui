/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { Form } from 'formik'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import AnnotationDetails, { AnnotationDetailsProps } from '../AnnotationDetails'
import { AnnotationDetailsFields } from '../AnnotationDetails.constants'

function WrapperComponent(props: AnnotationDetailsProps): JSX.Element {
  return (
    <TestWrapper>
      <Formik formName="annotationDetails-form" initialValues={{}} onSubmit={jest.fn()}>
        <Form>
          <AnnotationDetails {...props} />
        </Form>
      </Formik>
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
  useSaveAnnotation: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useSaveAccountLevelAnnotation: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useUpdateAnnotation: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useUpdateAccountLevelAnnotation: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Unit tests for AnnotationDetails', () => {
  const props = {
    hideDrawer: jest.fn(),
    sloIdentifier: 'slo-1',
    fetchSecondaryEvents: jest.fn()
  }

  test('should be able to verify that AnnotationDetails component loads in create annotation mode', async () => {
    const { getByText, container } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('cv.slos.sloDetailsChart.addAnnotation')).toBeInTheDocument())

    setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: AnnotationDetailsFields.ANNOTATION_MESSAGE,
      value: 'New annotation'
    })
    await userEvent.click(getByText('save'))

    // should be able to click on cancel
    await userEvent.click(getByText('cancel'))
  })

  test('should be able to verify that AnnotationDetails component loads in edit annotation mode', async () => {
    const updatedProps = {
      ...props,
      annotationMessage: {
        message: 'new update',
        startTime: 1679033100000,
        endTime: 1679726100000,
        id: 'cyFcAac-TBSqOaBs_tneMQ'
      }
    }
    const { getByText, container } = render(<WrapperComponent {...updatedProps} />)
    await waitFor(() => expect(getByText('cv.slos.sloDetailsChart.editAnnotation')).toBeInTheDocument())

    setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: AnnotationDetailsFields.ANNOTATION_MESSAGE,
      value: 'New annotation updated'
    })

    await userEvent.click(getByText('save'))
  })
})
