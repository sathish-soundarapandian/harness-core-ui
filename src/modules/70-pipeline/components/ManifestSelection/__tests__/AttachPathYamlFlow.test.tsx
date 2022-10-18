/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText, fireEvent, waitFor, act } from '@testing-library/react'
import { Formik, FormikForm, MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import AttachPathYamlFlow from '../ManifestListView/AttachPathYamlFlow'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  getNode: jest.fn(),
  useDownloadFile: jest.fn().mockImplementation(() => ({ data: null, loading: false })),
  useCreate: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useUpdate: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false }))
}))

jest.useFakeTimers()
const attachPathYaml = jest.fn()

const defaultProps = {
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  attachPathYaml,
  expressions: ['org.identifier'],
  isReadonly: false,
  manifestStore: 'Harness',
  manifestType: 'K8sManifest',
  removeValuesYaml: jest.fn(),
  renderConnectorField: jest.fn(),
  valuesPaths: ['account:/vit', 'account:/vit1']
}

function WrapperComponent(props: any): JSX.Element {
  const { initialErrors } = props || {}
  return (
    <TestWrapper>
      <Formik
        initialErrors={initialErrors}
        initialValues={{ valuesPath: ['account:/vit', 'account:/vit1'] }}
        onSubmit={() => undefined}
        formName="TestWrapper"
      >
        {formikProps => (
          <FormikForm>
            <AttachPathYamlFlow
              renderConnectorField={<div></div>}
              manifestType="K8sManifest"
              manifestStore="Harness"
              removeValuesYaml={jest.fn()}
              attachPathYaml={jest.fn()}
              expressions={['org.identifier']}
              allowableTypes={['FIXED']}
              {...formikProps}
              {...props}
            />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Define attach path yaml', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render attach path field, with harness store', async () => {
    const props = { ...defaultProps }

    const { container } = render(<WrapperComponent {...props} />)
    expect(container).toBeDefined()
    const attachBtn = await findByText(container, 'pipeline.manifestType.attachPath')
    fireEvent.click(attachBtn)
    expect(attachBtn).toBeInTheDocument()
    const dialog = document.body.querySelector('.bp3-dialog') as HTMLElement
    const submitBtn = await findByText(dialog, 'submit')
    act(() => {
      fireEvent.click(submitBtn)
    })
    waitFor(() => expect(attachPathYaml).toHaveBeenCalled())
  })
  test('should render attach path field, with git store', async () => {
    const props = { ...defaultProps, manifestStore: 'Git', valuesPaths: ['a'] }
    const { container } = render(<WrapperComponent {...props} />)
    expect(container).toBeDefined()
    const attachBtn = await findByText(container, 'pipeline.manifestType.attachPath')
    fireEvent.click(attachBtn)
    expect(attachBtn).toBeInTheDocument()

    const submitBtn = await findByText(document.body, 'submit')
    expect(submitBtn).toBeInTheDocument()
    act(() => {
      fireEvent.click(submitBtn)
    })
  })
})
