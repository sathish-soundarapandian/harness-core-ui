/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import type { AnnotationProps } from '../Annotation'
import Annotation from '../Annotation'
import { SLO_WIDGETS } from '../../../TimelineRow.constants'
import { mockedSecondaryEventsDetailsResponse } from './Annotations.mock'

function WrapperComponent(props: AnnotationProps): JSX.Element {
  return (
    <TestWrapper>
      <Annotation {...props} />
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
  useGetSecondaryEventDetails: jest.fn().mockImplementation(() => ({
    data: mockedSecondaryEventsDetailsResponse,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useDeleteAnnotation: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteAccountLevelAnnotation: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Unit tests for Annotation', () => {
  const props = {
    widget: {
      endTime: 1678662000000,
      startTime: 1678654800000,
      icon: {
        height: 16,
        width: 16,
        url: '/images/d400ced.svg'
      },
      type: SLO_WIDGETS.ANNOTATION,
      identifiers: ['ptrX4E9tRWiVZB90ukt0Cg', 'aXuW7QBRSbi3wmP0C1pJRg', '_ZIRTphUQ96h0W8VLGf_zw'],
      leftOffset: 973.1828562855286
    },
    index: 0,
    addAnnotation: jest.fn(),
    fetchSecondaryEvents: jest.fn()
  }

  test('should be able to verify that Annotation component loads with annotations Icon', async () => {
    const { getByTestId } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByTestId('annotationsIcon')).toBeInTheDocument())
  })

  test('should render the view when addAnnotation handler is not passed', async () => {
    const updatedProps = { ...props, addAnnotation: undefined }
    const { getByTestId, getByText } = render(<WrapperComponent {...updatedProps} />)
    await waitFor(() => expect(getByTestId('annotationsIcon')).toBeInTheDocument())
    const annotationsIcon = getByTestId('annotationsIcon')

    // When annotationIcon is clicked user should be able to see all the data
    await userEvent.click(annotationsIcon)
    await waitFor(() => expect(getByText('cv.slos.sloDetailsChart.addAnnotation')).toBeInTheDocument())
    await userEvent.click(getByText('cv.slos.sloDetailsChart.addAnnotation'))
  })

  test('should be able to click on Add annotation link when annotations icon is clicked', async () => {
    const { getByText, getByTestId } = render(<WrapperComponent {...props} />)
    const annotationsIcon = getByTestId('annotationsIcon')
    await waitFor(() => expect(annotationsIcon).toBeInTheDocument())

    // When annotationIcon is clicked user should be able to see all the data
    await userEvent.click(annotationsIcon)
    await waitFor(() => expect(getByText('cv.slos.sloDetailsChart.addAnnotation')).toBeInTheDocument())
    await userEvent.click(getByText('cv.slos.sloDetailsChart.addAnnotation'))
    for (const annotation of mockedSecondaryEventsDetailsResponse.data.details.annotations) {
      expect(getByText(annotation.message)).toBeInTheDocument()
    }
  })

  test('should be able to click on Edit annotation link when annotations icon is clicked', async () => {
    const { getByTestId, getAllByTestId } = render(<WrapperComponent {...props} />)
    const annotationsIcon = getByTestId('annotationsIcon')

    await waitFor(() => expect(annotationsIcon).toBeInTheDocument())

    // When annotationIcon is clicked user should be able to see all the data
    await userEvent.click(annotationsIcon)
    const editAnnotationIcons = getAllByTestId('editAnnotations')
    expect(editAnnotationIcons.length).toEqual(mockedSecondaryEventsDetailsResponse.data.details.annotations.length)

    const editAnnotationIcon = editAnnotationIcons[0]
    await waitFor(() => expect(editAnnotationIcon).toBeInTheDocument())
    await userEvent.click(editAnnotationIcon)
  })

  test('should be able to click on delete annotation link when annotations icon is clicked', async () => {
    const { getByTestId, getAllByTestId, getByText } = render(<WrapperComponent {...props} />)
    const annotationsIcon = getByTestId('annotationsIcon')
    await waitFor(() => expect(annotationsIcon).toBeInTheDocument())

    // When annotationIcon is clicked user should be able to see all the data
    await userEvent.click(annotationsIcon)
    const deleteAnnotationIcons = getAllByTestId('deleteAnnotations')
    expect(deleteAnnotationIcons.length).toEqual(mockedSecondaryEventsDetailsResponse.data.details.annotations.length)

    const deleteAnnotationIcon = deleteAnnotationIcons[0]
    await waitFor(() => expect(deleteAnnotationIcon).toBeInTheDocument())
    await userEvent.click(deleteAnnotationIcon)
    expect(getByText('cv.slos.sloDetailsChart.deleteMessageConfirmation')).toBeInTheDocument()

    // Triggering the Delete
    await userEvent.click(getByText('delete'))
  })

  test('should be able to click on delete annotation link when annotations icon is clicked and cancel the delete', async () => {
    const { getByTestId, getAllByTestId, getByText } = render(<WrapperComponent {...props} />)
    const annotationsIcon = getByTestId('annotationsIcon')
    await waitFor(() => expect(annotationsIcon).toBeInTheDocument())

    // When annotationIcon is clicked user should be able to see all the data
    await userEvent.click(annotationsIcon)
    const deleteAnnotationIcons = getAllByTestId('deleteAnnotations')
    expect(deleteAnnotationIcons.length).toEqual(mockedSecondaryEventsDetailsResponse.data.details.annotations.length)

    const deleteAnnotationIcon = deleteAnnotationIcons[0]
    await waitFor(() => expect(deleteAnnotationIcon).toBeInTheDocument())
    await userEvent.click(deleteAnnotationIcon)
    expect(getByText('cv.slos.sloDetailsChart.deleteMessageConfirmation')).toBeInTheDocument()

    // Cancelling the Delete
    await userEvent.click(getByText('cancel'))
  })

  test('should render loading state when api to fetch annotation details is in loading state', async () => {
    jest.spyOn(cvServices, 'useGetSecondaryEventDetails').mockImplementationOnce(
      () =>
        ({
          data: null,
          loading: true,
          error: null
        } as any)
    )
    const { getByTestId } = render(<WrapperComponent {...props} />)
    const annotationsIcon = getByTestId('annotationsIcon')
    await waitFor(() => expect(annotationsIcon).toBeInTheDocument())

    // When annotationIcon is clicked user should be able to see the loading state
    await userEvent.click(annotationsIcon)
    expect(getByTestId('loading')).toBeInTheDocument()
  })

  test('should render error state when api to fetch annotation details errors out', async () => {
    jest.spyOn(cvServices, 'useGetSecondaryEventDetails').mockImplementationOnce(
      () =>
        ({
          data: null,
          loading: false,
          error: {
            message: 'Failed to fetch secondary event details'
          }
        } as any)
    )
    const { getByText } = render(<WrapperComponent {...props} />)
    expect(getByText('Failed to fetch secondary event details')).toBeInTheDocument()
  })
})
