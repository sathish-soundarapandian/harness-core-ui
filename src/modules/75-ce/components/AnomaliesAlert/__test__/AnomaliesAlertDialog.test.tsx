/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { act, fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { Provider } from 'urql'
import { Dialog, Formik, StepWizard } from '@harness/uicore'
import type { IDialogProps } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { FetchPerspectiveListDocument } from 'services/ce/services'
import type { CCMPerspectiveNotificationChannelsDTO } from 'services/ce'
import PerspectiveList from './PerspectiveList.json'
import PerspectiveSelection from '../PerspectiveSelection'
import NotificationMethod, { NotificationValues } from '../NotificationMethod'
import useAnomaliesAlertDialog from '../AnomaliesAlertDialog'

const selectedAlert: CCMPerspectiveNotificationChannelsDTO = {
  perspectiveId: 'perspectiveId',
  channels: [
    {
      notificationChannelType: 'SLACK',
      channelUrls: []
    }
  ]
}

const params = {
  accountId: 'TEST_ACC'
}

const modalPropsLight: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1100,
    position: 'relative',
    minHeight: 600,
    borderLeft: 0,
    paddingBottom: 0,
    overflow: 'hidden'
  }
}

const handleSubmit = jest.fn().mockImplementation(async () => {
  try {
    await Promise.resolve(true)
  } catch (err) {
    expect(err).toBeTruthy()
  }
})

const hideAnomaliesAlertModal = jest.fn()

jest.mock('services/ce', () => {
  return {
    useCreateNotificationSetting: jest.fn().mockImplementation(() => ({
      mutate: async () => {
        return {
          status: 'SUCCESS',
          data: {}
        }
      }
    })),
    useUpdateNotificationSetting: jest.fn().mockImplementation(() => ({
      mutate: async () => {
        return {
          status: 'SUCCESS',
          data: {}
        }
      }
    }))
  }
})

const Wrapped = (): React.ReactElement => {
  const { openAnomaliesAlertModal } = useAnomaliesAlertDialog({
    setRefetchingState: jest.fn(),
    selectedAlert: selectedAlert
  })
  const onBtnClick = () => {
    openAnomaliesAlertModal()
  }

  return (
    <>
      <button className="opnModal" onClick={onBtnClick} />
      <Dialog {...modalPropsLight} onClose={hideAnomaliesAlertModal}>
        <Formik<NotificationValues>
          initialValues={{
            perspective: defaultTo(selectedAlert.perspectiveId, ''),
            alertList: []
          }}
          formName={'createNotificationAlert'}
          onSubmit={data => handleSubmit(data)}
        >
          {formikProps => {
            return (
              <StepWizard>
                <PerspectiveSelection
                  name={''}
                  onClose={hideAnomaliesAlertModal}
                  items={[]}
                  formikProps={formikProps}
                />
                <NotificationMethod name={''} onClose={hideAnomaliesAlertModal} formikProps={formikProps} />
              </StepWizard>
            )
          }}
        </Formik>
      </Dialog>
    </>
  )
}

describe('Test case for anomalies alert dialog', () => {
  test('should work as expected', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        }
        return fromValue({})
      }
    }
    const { container, getByText, getAllByText } = render(
      <Provider value={responseState as any}>
        <TestWrapper>
          <Wrapped />
        </TestWrapper>
      </Provider>
    )

    const openModal = container.querySelector('.opnModal')
    await act(async () => {
      fireEvent.click(openModal!)
    })

    const modal = findDialogContainer()
    expect(modal).toBeDefined()

    expect(getAllByText('ce.anomalyDetection.notificationAlerts.selectPerspective')).toBeDefined()

    const saveAndContinueBtn = getAllByText('saveAndContinue')[0]
    act(() => {
      fireEvent.click(saveAndContinueBtn!)
    })
    expect(getByText('ce.anomalyDetection.notificationAlerts.notificationStepSubtext')).toBeDefined()

    const submitFormBtn = modal?.querySelector('[data-testid="submitForm"]')
    expect(submitFormBtn).toBeDefined()
    act(() => {
      fireEvent.click(submitFormBtn!)
    })

    expect(modal).toMatchSnapshot()
  })

  test('Should be able to close the dialog on close', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        }
        return fromValue({})
      }
    }

    render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <Wrapped />
        </Provider>
      </TestWrapper>
    )

    const modal = findDialogContainer()
    expect(modal).toBeDefined()

    await waitFor(() => Promise.resolve())

    const crossIcon = modal?.querySelector('.closeBtn')
    act(() => {
      fireEvent.click(crossIcon!)
    })

    expect(hideAnomaliesAlertModal).toBeCalled()
  })
})
