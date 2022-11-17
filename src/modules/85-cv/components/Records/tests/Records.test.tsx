/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { FormikForm } from '@harness/uicore'
import { Formik } from 'formik'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { Records } from '../Records'
import type { RecordsProps } from '../types'

function WrapperComponent(props: RecordsProps): any {
  return (
    <TestWrapper>
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <FormikForm>
          <Records {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for Records component', () => {
  test('Verify that loading state is rendering correctly for Records', async () => {
    jest.spyOn(cvService, 'useGetStackdriverLogSampleData').mockReturnValue({} as any)
    const fetchRecordsMock = jest.fn()
    const { container } = render(<WrapperComponent fetchRecords={fetchRecordsMock} loading={true} />)
    expect(container.querySelector('[data-icon="steps-spinner"]')).not.toBeNull()
  })

  test('Verify that error state is rendering correctly for Records', async () => {
    const refetchMock = jest.fn().mockImplementation()
    jest.spyOn(cvService, 'useGetStackdriverLogSampleData').mockReturnValue({
      error: { data: { message: 'mockError' } },
      refetch: refetchMock as unknown
    } as any)
    const fetchRecordsMock = jest.fn()
    const { getByText } = render(
      <WrapperComponent fetchRecords={fetchRecordsMock} error={{ data: { message: 'mockError' } }} />
    )
    // check for error
    expect(getByText('mockError')).not.toBeNull()
  })

  test('Verify that Query not executed state is rendering correctly for Records', async () => {
    jest.spyOn(cvService, 'useGetStackdriverLogSampleData').mockReturnValue({} as any)
    const fetchRecordsMock = jest.fn()
    const { getByText } = render(<WrapperComponent fetchRecords={fetchRecordsMock} isQueryExecuted={false} />)

    expect(getByText('cv.monitoringSources.gcoLogs.submitQueryToSeeRecords')).not.toBeNull()
  })

  test('Verify that No Records state is rendering correctly for Records', async () => {
    jest.spyOn(cvService, 'useGetStackdriverLogSampleData').mockReturnValue({} as any)
    const fetchRecordsMock = jest.fn()
    const { getByText } = render(<WrapperComponent fetchRecords={fetchRecordsMock} data={[]} isQueryExecuted={true} />)
    expect(getByText('cv.monitoringSources.gcoLogs.noRecordsForQuery')).not.toBeNull()
  })

  test('Verify that valid records state is rendering correctly for Records', async () => {
    jest.spyOn(cvService, 'useGetStackdriverLogSampleData').mockReturnValue({} as any)
    const fetchRecordsMock = jest.fn()
    const { container } = render(
      <WrapperComponent
        fetchRecords={fetchRecordsMock}
        data={[
          {
            insertId: 's0w7sqfbplb0y',
            jsonPayload: {
              message: 'Testing connectivity',
              timestamp: '2021-06-10 09:19:40.014 +0000',
              logger: 'io.harness.network.Http',
              harness: {
                taskId: 'xJ_l7tvoRCCW1kscHJ60Nw',
                URL: 'https://vaultqa.harness.io'
              },
              thread: 'sync-task-84'
            },
            resource: {
              type: 'global',
              labels: {
                project_id: 'prod-setup-205416'
              }
            },
            timestamp: '2021-06-10T09:19:40.015Z',
            severity: 'INFO',
            labels: {
              managerHost: 'vanityapp.harness.io',
              delegateId: 'FNWebBo9RliMlOvByac3TA',
              processId: '17034',
              version: '1.0.69405',
              accountId: '9cf5LhAtQImdNYNlq5Hm1g',
              app: 'delegate',
              source: 'cdc-automationfour-kerberos-delegate-winrm-1.us-central1-a.c.qa-target.internal'
            },
            logName: 'projects/prod-setup-205416/logs/delegate',
            receiveTimestamp: '2021-06-10T09:19:40.198475585Z'
          }
        ]}
        isQueryExecuted={true}
      />
    )
    expect(container.getElementsByClassName('recordContainer').length).toBe(1)
  })
})
