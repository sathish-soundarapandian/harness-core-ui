/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { ContentText, CustomButtonContainer } from '../useEntityDeleteErrorHandlerDialog'

const commonProp = {
  titleText: 'titleText',
  entity: { type: 'connector', name: 'test connector' },
  redirectToReferencedBy: noop
}

const forceDeleteCallbackMock = jest.fn()
const setForcedDeleteEnabledMock = jest.fn()
const redirectToReferencedByMock = jest.fn()
const closeDialogMock = jest.fn()

describe('useEntityDeleteErrorHandlerDialog test', () => {
  beforeEach(() => {
    forceDeleteCallbackMock.mockReset()
    setForcedDeleteEnabledMock.mockReset()
    redirectToReferencedByMock.mockReset()
    closeDialogMock.mockReset()
  })

  test('should render error without forcedDeleteSupport', async () => {
    const { queryByText } = render(
      <TestWrapper
        path={routes.toConnectors({
          accountId: ':accountId'
        })}
        pathParams={{ accountId: 'account' }}
      >
        <ContentText
          entity={commonProp.entity}
          forcedDeleteEnabled={false}
          setForcedDeleteEnabled={setForcedDeleteEnabledMock}
        />
      </TestWrapper>
    )

    expect(queryByText('common.forcedDeleteLabel')).not.toBeInTheDocument()
  })

  test('should render error with forcedDeleteSupport', async () => {
    const { container, queryByText } = render(
      <TestWrapper
        path={routes.toConnectors({
          accountId: ':accountId'
        })}
        pathParams={{ accountId: 'account' }}
      >
        <ContentText
          entity={commonProp.entity}
          forceDeleteCallback={forceDeleteCallbackMock}
          forcedDeleteEnabled={false}
          setForcedDeleteEnabled={setForcedDeleteEnabledMock}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    expect(queryByText('common.forcedDeleteLabel')).toBeInTheDocument()
    expect(queryByText('common.forcedDeleteWarning')).not.toBeInTheDocument()
    expect(setForcedDeleteEnabledMock).toBeCalledTimes(0)

    act(() => {
      setFieldValue({ container, type: InputTypes.CHECKBOX, fieldId: 'forcedDelete', value: 'true' })
    })
    expect(setForcedDeleteEnabledMock).toBeCalledTimes(1)
  })

  test('CustomButtons should not have delete without support', async () => {
    const { queryByText } = render(
      <TestWrapper
        path={routes.toConnectors({
          accountId: ':accountId'
        })}
        pathParams={{ accountId: 'account' }}
      >
        <CustomButtonContainer
          closeDialog={noop}
          redirectToReferencedBy={redirectToReferencedByMock}
          forcedDeleteEnabled={false}
        />
      </TestWrapper>
    )

    expect(queryByText('delete')).not.toBeInTheDocument()
    const viewReferenceButton = queryByText('common.referenceButtonText') as HTMLElement
    act(() => {
      fireEvent.click(viewReferenceButton)
    })
    expect(redirectToReferencedByMock).toBeCalledTimes(1)
  })

  test('CustomButtons: forceDeleteCallbac should be called', async () => {
    const { container, queryByText } = render(
      <TestWrapper
        path={routes.toConnectors({
          accountId: ':accountId'
        })}
        pathParams={{ accountId: 'account' }}
      >
        <CustomButtonContainer
          closeDialog={noop}
          redirectToReferencedBy={redirectToReferencedByMock}
          forceDeleteCallback={forceDeleteCallbackMock}
          forcedDeleteEnabled={true}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const deleteButton = queryByText('delete') as HTMLElement
    expect(deleteButton).toBeInTheDocument()

    act(() => {
      fireEvent.click(deleteButton)
    })
    expect(forceDeleteCallbackMock).toBeCalledTimes(1)
  })

  test('CustomButtons: Cancel button test', async () => {
    const { queryByText } = render(
      <TestWrapper
        path={routes.toConnectors({
          accountId: ':accountId'
        })}
        pathParams={{ accountId: 'account' }}
      >
        <CustomButtonContainer
          closeDialog={closeDialogMock}
          redirectToReferencedBy={redirectToReferencedByMock}
          forcedDeleteEnabled={false}
        />
      </TestWrapper>
    )

    const cancelButton = queryByText('cancel') as HTMLElement
    expect(cancelButton).toBeInTheDocument()

    act(() => {
      fireEvent.click(cancelButton)
    })
    expect(forceDeleteCallbackMock).toBeCalledTimes(0)
    expect(redirectToReferencedByMock).toBeCalledTimes(0)
    expect(closeDialogMock).toBeCalledTimes(1)
  })
})
