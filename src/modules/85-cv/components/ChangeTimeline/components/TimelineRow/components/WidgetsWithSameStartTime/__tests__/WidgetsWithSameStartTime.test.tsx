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
import type { WidgetsWithSameStartTimeProps } from '../WidgetsWithSameStartTime'
import WidgetsWithSameStartTime from '../WidgetsWithSameStartTime'
import { mockedProps, mockedSecondaryEventsDetailsResponse } from './WidgetsWithSameStartTime.mock'
import { getWidgetsGroupedByType } from '../WidgetsWithSameStartTime.utils'

function WrapperComponent(props: WidgetsWithSameStartTimeProps): JSX.Element {
  return (
    <TestWrapper>
      <WidgetsWithSameStartTime {...props} />
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
  useDeleteAnnotation: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Unit tests for WidgetsWithSameStartTime', () => {
  test('should be able to verify that WidgetsWithSameStartTime component loads with annotations Icon', async () => {
    const { getByTestId, getByText } = render(<WrapperComponent {...mockedProps} />)
    await waitFor(() => expect(getByTestId('multiWidgetsIcon')).toBeInTheDocument())

    userEvent.click(getByTestId('multiWidgetsIcon'))
    expect(getByText('cv.sloDowntime.label')).toBeInTheDocument()

    // Verify if nested annotation is present
    expect(getByText('cv.slos.sloDetailsChart.annotation')).toBeInTheDocument()
    userEvent.click(getByText('cv.slos.sloDetailsChart.annotation'))
    for (const annotation of mockedSecondaryEventsDetailsResponse.data.details.annotations) {
      expect(getByText(annotation.message)).toBeInTheDocument()
    }
  })

  test('should render the view when addAnnotation handler is not passed', async () => {
    const updatedProps = { ...mockedProps, addAnnotation: undefined }
    const { getByTestId, getByText } = render(<WrapperComponent {...updatedProps} />)
    await waitFor(() => expect(getByTestId('multiWidgetsIcon')).toBeInTheDocument())
    const multiWidgetsIcon = getByTestId('multiWidgetsIcon')

    userEvent.click(multiWidgetsIcon)
    expect(getByText('cv.sloDowntime.label')).toBeInTheDocument()

    // Verify if nested annotation is present
    expect(getByText('cv.slos.sloDetailsChart.annotation')).toBeInTheDocument()
    userEvent.click(getByText('cv.slos.sloDetailsChart.annotation'))
  })

  test('should be able to click on Edit annotation link when annotations icon is clicked for nested annotations card', async () => {
    const { getByTestId, getByText, getAllByTestId } = render(<WrapperComponent {...mockedProps} />)
    await waitFor(() => expect(getByTestId('multiWidgetsIcon')).toBeInTheDocument())

    userEvent.click(getByTestId('multiWidgetsIcon'))
    expect(getByText('cv.sloDowntime.label')).toBeInTheDocument()

    // Verify if nested annotation is present
    expect(getByText('cv.slos.sloDetailsChart.annotation')).toBeInTheDocument()
    userEvent.click(getByText('cv.slos.sloDetailsChart.annotation'))

    const editAnnotationIcons = getAllByTestId('editAnnotations')
    expect(editAnnotationIcons.length).toEqual(mockedSecondaryEventsDetailsResponse.data.details.annotations.length)

    const editAnnotationIcon = editAnnotationIcons[0]
    await waitFor(() => expect(editAnnotationIcon).toBeInTheDocument())
    userEvent.click(editAnnotationIcon)
  })

  test('should be able to click on delete annotation link when annotations icon is clicked for nested annotations card', async () => {
    const { getByTestId, getByText, getAllByTestId } = render(<WrapperComponent {...mockedProps} />)
    await waitFor(() => expect(getByTestId('multiWidgetsIcon')).toBeInTheDocument())

    userEvent.click(getByTestId('multiWidgetsIcon'))
    expect(getByText('cv.sloDowntime.label')).toBeInTheDocument()

    // Verify if nested annotation is present
    expect(getByText('cv.slos.sloDetailsChart.annotation')).toBeInTheDocument()
    userEvent.click(getByText('cv.slos.sloDetailsChart.annotation'))

    const deleteAnnotationIcons = getAllByTestId('deleteAnnotations')
    expect(deleteAnnotationIcons.length).toEqual(mockedSecondaryEventsDetailsResponse.data.details.annotations.length)

    const deleteAnnotationIcon = deleteAnnotationIcons[0]
    await waitFor(() => expect(deleteAnnotationIcon).toBeInTheDocument())
    userEvent.click(deleteAnnotationIcon)

    expect(getByText('cv.slos.sloDetailsChart.deleteMessageConfirmation')).toBeInTheDocument()

    // Triggering the Delete
    userEvent.click(getByText('delete'))
  })

  test('should be able to click on delete annotation link when annotations icon is clicked for nested annotations card and cancel the delete', async () => {
    const { getByTestId, getByText, getAllByTestId } = render(<WrapperComponent {...mockedProps} />)
    await waitFor(() => expect(getByTestId('multiWidgetsIcon')).toBeInTheDocument())

    userEvent.click(getByTestId('multiWidgetsIcon'))
    expect(getByText('cv.sloDowntime.label')).toBeInTheDocument()

    // Verify if nested annotation is present
    expect(getByText('cv.slos.sloDetailsChart.annotation')).toBeInTheDocument()
    userEvent.click(getByText('cv.slos.sloDetailsChart.annotation'))

    const deleteAnnotationIcons = getAllByTestId('deleteAnnotations')
    expect(deleteAnnotationIcons.length).toEqual(mockedSecondaryEventsDetailsResponse.data.details.annotations.length)

    const deleteAnnotationIcon = deleteAnnotationIcons[0]
    await waitFor(() => expect(deleteAnnotationIcon).toBeInTheDocument())
    userEvent.click(deleteAnnotationIcon)

    expect(getByText('cv.slos.sloDetailsChart.deleteMessageConfirmation')).toBeInTheDocument()

    // Cancelling the Delete
    userEvent.click(getByText('cancel'))
  })

  test('should render loading state when api to fetch annotation details is in loading state for nested annotations', async () => {
    jest.spyOn(cvServices, 'useGetSecondaryEventDetails').mockImplementationOnce(
      () =>
        ({
          data: null,
          loading: true,
          error: null
        } as any)
    )

    const { getByTestId, getByText } = render(<WrapperComponent {...mockedProps} />)
    await waitFor(() => expect(getByTestId('multiWidgetsIcon')).toBeInTheDocument())

    // Verify if downtime is present
    userEvent.click(getByTestId('multiWidgetsIcon'))
    expect(getByText('cv.sloDowntime.label')).toBeInTheDocument()

    // Verify if nested annotation is present
    expect(getByText('cv.slos.sloDetailsChart.annotation')).toBeInTheDocument()

    // When annotationIcon is clicked user should be able to see the loading state
    userEvent.click(getByText('cv.slos.sloDetailsChart.annotation'))
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

    const { getByTestId, getByText } = render(<WrapperComponent {...mockedProps} />)
    await waitFor(() => expect(getByTestId('multiWidgetsIcon')).toBeInTheDocument())

    // Verify if downtime is present
    userEvent.click(getByTestId('multiWidgetsIcon'))
    expect(getByText('cv.sloDowntime.label')).toBeInTheDocument()

    // Verify if nested annotation is present
    expect(getByText('cv.slos.sloDetailsChart.annotation')).toBeInTheDocument()

    // When annotationIcon is clicked user should be able to see the loading state
    userEvent.click(getByText('cv.slos.sloDetailsChart.annotation'))
    expect(getByText('Failed to fetch secondary event details')).toBeInTheDocument()
  })

  test('should render valid state when api to fetch annotation details gives empty results', async () => {
    jest.spyOn(cvServices, 'useGetSecondaryEventDetails').mockImplementationOnce(
      () =>
        ({
          data: {},
          loading: false,
          error: {}
        } as any)
    )

    const { getByTestId, getByText } = render(<WrapperComponent {...mockedProps} />)
    await waitFor(() => expect(getByTestId('multiWidgetsIcon')).toBeInTheDocument())

    // Verify if downtime is present
    userEvent.click(getByTestId('multiWidgetsIcon'))
    expect(getByText('cv.sloDowntime.label')).toBeInTheDocument()
  })

  test('should be able to render list of downtimes when no annotation is present', async () => {
    const updatedProps = {
      ...mockedProps,
      widgets: [
        {
          endTime: 1679230800000,
          startTime: 1679229000000,
          icon: {
            height: 16,
            width: 16,
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTciIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNyAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHg9IjAuNSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iOCIgZmlsbD0iIzdENEREMyIgLz4KICAgIDxwYXRoCiAgICAgIGQ9Ik04LjgwMTQ3IDYuNjQwMTdDOS4xMjY1OSA1LjY4NTk0IDguOTAzMDkgNC41ODk2NCA4LjEzMDk4IDMuODE4MUM3LjQ2MDQ5IDMuMTQ4MTEgNi41NDYxOSAyLjg4NDEgNS42OTI4NyAzLjA0NjU2QzUuNDY5MzcgMy4wODcyIDUuMzg4MTYgMy4zNzE0MyA1LjU1MDU4IDMuNTMzODZMNi41MDU1MiA0LjQ4ODA5QzYuOTMyMjcgNC45MTQ1MiA2LjkzMjI3IDUuNTg0MzYgNi41MDU1MiA2LjAxMDc5QzYuMDc4NzcgNi40MzcyMiA1LjQwODQzIDYuNDM3MjIgNC45ODE2OCA2LjAxMDc5TDQuMDI2NzQgNS4wNTY1NkMzLjg2NDE4IDQuODk0MTIgMy41Nzk3NCA0Ljk3NTQxIDMuNTM5MDcgNS4xOTg3NUMzLjM5Njc4IDYuMDUxNDYgMy42NDA2OSA2Ljk4NTQyIDQuMzExMTkgNy42MzUwNEM1LjA4MzMgOC40MDY1OCA2LjE4MDQzIDguNjA5NTMgNy4xMzUzNyA4LjMwNTAzTDExLjQ4MzQgMTIuNjQ5OEMxMS45NTA3IDEzLjExNjcgMTIuNzAyNSAxMy4xMTY3IDEzLjE0OTUgMTIuNjQ5OEMxMy42MTY4IDEyLjE4MjkgMTMuNjE2OCAxMS40MzE2IDEzLjE0OTUgMTAuOTg0OUw4LjgwMTQ3IDYuNjQwMTdaIgogICAgICBmaWxsPSJ3aGl0ZSIKICAgIC8+CiAgPC9zdmc+'
          },
          type: 'Downtime',
          identifiers: ['yEudIuKcQ_Cnd4TTzluxxg'],
          leftOffset: 471.3019313602891
        }
      ]
    }
    const { getByTestId, getByText, queryByText } = render(<WrapperComponent {...updatedProps} />)
    await waitFor(() => expect(getByTestId('multiWidgetsIcon')).toBeInTheDocument())

    // Verify if downtime is present
    userEvent.click(getByTestId('multiWidgetsIcon'))
    expect(getByText('cv.sloDowntime.label')).toBeInTheDocument()

    // Verify if nested annotation is not  present
    expect(queryByText('cv.slos.sloDetailsChart.annotation')).not.toBeInTheDocument()
  })

  test('should be able to verify getWidgetsGroupedByType', async () => {
    expect(getWidgetsGroupedByType(mockedProps.widgets)).toEqual({
      widgetsWithAnnotationType: [
        {
          endTime: 1679580900000,
          icon: {
            height: 16,
            url: '/images/d400ced.svg',
            width: 16
          },
          identifiers: ['2fq95fHDS_6If0_QRixu6w', 'YXrDFNNcSPC3kS9J1V8pPw'],
          leftOffset: 471.3019313602891,
          startTime: 1679229000000,
          type: 'Annotation'
        }
      ],
      widgetsWithDownTimeType: [
        {
          endTime: 1679230800000,
          icon: {
            height: 16,
            url: 'images/downtime',
            width: 16
          },
          identifiers: ['yEudIuKcQ_Cnd4TTzluxxg'],
          leftOffset: 471.3019313602891,
          startTime: 1679229000000,
          type: 'Downtime'
        }
      ]
    })
  })
})
