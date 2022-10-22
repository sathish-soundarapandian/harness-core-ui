/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, findByText } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import ConfigFilesListView from '../ConfigFilesListView'

jest.useFakeTimers()

const defaultProps = {
  allowableTypes: ['FIXED', 'RUNTIME'],
  deploymentType: 'Ssh',
  isPropagating: false,
  isReadonly: false,
  isReadonlyServiceMode: false,
  selectedConfig: 'Harness',
  selectedServiceResponse: null,
  serviceCacheId: 'test1',
  setSelectedConfig: jest.fn(),
  stage: {
    stage: {
      name: 'stage name',
      identifier: 'id_1',
      spec: {
        serviceConfig: {
          serviceDefinition: {
            spec: {
              configFiles: [
                {
                  configFile: {
                    identifier: 'a1',
                    spec: {
                      store: {
                        spec: {
                          files: ['account:/test'],
                          secretFiles: []
                        },
                        type: 'Harness'
                      }
                    }
                  }
                }
              ],
              type: 'Ssh'
            }
          },
          serviceRef: 'asdasd2'
        }
      }
    }
  }
}

function WrapperComponent(props: any): JSX.Element {
  const { initialErrors } = props || {}
  const commonProps = {
    ...defaultProps,
    ...props
  }
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
            <ConfigFilesListView {...formikProps} {...commonProps} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Define Config Files list view', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render config list files', async () => {
    const renderObj = render(<WrapperComponent />)
    const addBtn = await renderObj.findByText('pipeline.configFiles.addConfigFile')
    fireEvent.click(addBtn)
    const closeBtn = document.body.querySelector('.bp3-button') as HTMLElement
    fireEvent.click(closeBtn)
    expect(renderObj.container).toBeDefined()
  })
  test('should render edit config files', async () => {
    const { container } = render(<WrapperComponent />)

    const editBtn = document.body.querySelector('.bp3-button') as HTMLElement
    fireEvent.click(editBtn)
    const dialog = document.body.querySelector('.bp3-dialog') as HTMLElement
    const continueBtn = await findByText(dialog, 'continue')
    fireEvent.click(continueBtn)
    expect(container).toBeDefined()
  })
})
