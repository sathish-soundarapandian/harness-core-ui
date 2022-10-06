/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import WinRmAuthFormFields from '@secrets/components/WinRmAuthFormFields/WinRmAuthFormFields'
import type { WinRmAuthDTO } from 'services/cd-ng'

const defaultFormikValues: any = {
  domain: '',
  username: '',
  principal: '',
  realm: '',
  keyPath: '',
  port: 0,
  useSSL: false,
  useNoProfile: false,
  skipCertChecks: false
}

describe('Test WinRmAuthFormFields', () => {
  test(`renders winrm form fields with NTLM auth scheme`, async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <Formik formName="winRmForm" onSubmit={noop} initialValues={{}}>
          <FormikForm>
            <WinRmAuthFormFields
              formik={
                {
                  values: {
                    authScheme: 'NTLM' as WinRmAuthDTO['type'],
                    ...defaultFormikValues
                  }
                } as any
              }
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(queryByText('secrets.winRmAuthFormFields.domain')).toBeTruthy()
  })

  test(`renders winrm form fields with Kerberos auth scheme and tgt generation key`, async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <Formik formName="winRmForm" onSubmit={noop} initialValues={{}}>
          <FormikForm>
            <WinRmAuthFormFields
              formik={
                {
                  values: {
                    authScheme: 'Kerberos' as WinRmAuthDTO['type'],
                    ...defaultFormikValues,
                    tgtGenerationMethod: 'KeyTabFilePath'
                  }
                } as any
              }
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(queryByText('secrets.sshAuthFormFields.labelRealm')).toBeTruthy()
  })

  test(`renders winrm form fields with Kerberos auth scheme and tgt generation password`, async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <Formik formName="winRmForm" onSubmit={noop} initialValues={{}}>
          <FormikForm>
            <WinRmAuthFormFields
              formik={
                {
                  values: {
                    authScheme: 'Kerberos' as WinRmAuthDTO['type'],
                    ...defaultFormikValues,
                    tgtGenerationMethod: 'Password'
                  }
                } as any
              }
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(queryByText('secrets.sshAuthFormFields.labelRealm')).toBeTruthy()
  })
})
