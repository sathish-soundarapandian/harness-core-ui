/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { Formik } from '@wings-software/uicore'

import { fireEvent, render } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { TFBackendConfigMonaco } from '../Editview/TFMonacoEditor'

const props = {} as any

describe('TFMonaco Editor ', () => {
  test('initial render', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop} formName="test">
          <TFBackendConfigMonaco {...props} />
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('test for open dailog', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop} formName="test">
          <TFBackendConfigMonaco {...props} />
        </Formik>
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-icon="fullscreen"]') as HTMLElement)

    const dailog = findDialogContainer()
    expect(dailog).toBeTruthy()
    expect(dailog).toMatchSnapshot()
    expect(container).toMatchSnapshot()
  })
})
