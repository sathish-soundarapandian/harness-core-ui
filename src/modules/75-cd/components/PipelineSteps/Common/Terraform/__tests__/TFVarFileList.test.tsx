/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MultiTypeInputType, Formik } from '@wings-software/uicore'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import TfVarFileList from '../Editview/TFVarFileList'

const varFiles: any[] = []

const formikValues = {
  values: {
    spec: {
      configuration: {
        spec: {
          varFiles: [
            {
              varFile: {
                identifier: 'plan var id',
                type: 'Remote',
                spec: {
                  type: 'Artifactory',
                  spec: {
                    repositoryName: '',
                    connectorRef: '',
                    artifactPaths: ''
                  }
                }
              }
            },
            {
              varFile: {
                identifier: 'plan id',
                type: 'Inline',
                spec: {
                  type: '',
                  spec: {
                    repositoryName: '',
                    connectorRef: '',
                    artifactPaths: ''
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}
const mockGetFunction = jest.fn()
const defaultProps = {
  formik: formikValues,
  isReadonly: false,
  getNewConnectorSteps: mockGetFunction,
  setSelectedConnector: mockGetFunction,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
}

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <Formik formName="TfVarFileList" onSubmit={noop} initialValues={{}}>
        <TfVarFileList {...props} />
      </Formik>
    </TestWrapper>
  )
}

describe('Test TfPlanVarFileList', () => {
  test(`renders without crashing with no initial data`, async () => {
    renderComponent(defaultProps)
    expect(screen).toMatchSnapshot()
  })

  test(`renders inline var file`, async () => {
    varFiles.push({
      identifier: 'test',
      spec: {
        content: 'test = 0'
      },
      type: 'Inline'
    })
    renderComponent(defaultProps)
    expect(screen).toMatchSnapshot()
  })

  test(`renders remote var file`, async () => {
    varFiles.push({
      varFile: {
        type: 'Remote',
        identifier: 'var file id',
        spec: {
          store: {
            type: 'Github',
            spec: {
              gitFetchType: 'Branch',
              repoName: 'test',
              branch: 'master',
              paths: ['test'],
              connectorRef: 'connectorRef'
            }
          }
        }
      }
    })

    renderComponent(defaultProps)
    expect(screen).toMatchSnapshot()
  })

  test(`renders var file popover`, async () => {
    renderComponent(defaultProps)
    const addButton = await screen.findByText('plusAdd')
    fireEvent.click(addButton)
    expect(screen).toMatchSnapshot()
  })

  test(`renders inline var file dialog`, async () => {
    renderComponent(defaultProps)
    const addButton = await screen.findByText('plusAdd')
    fireEvent.click(addButton)

    const addInlineButton = await screen.findByText('cd.addInline')
    fireEvent.click(addInlineButton)
    expect(screen).toMatchSnapshot()
  })

  test(`renders remote var file dialog`, async () => {
    renderComponent(defaultProps)
    const addButton = await screen.findByText('plusAdd')
    fireEvent.click(addButton)

    const addInlineButton = await screen.findByText('cd.addRemote')
    fireEvent.click(addInlineButton)
    expect(screen).toMatchSnapshot()
  })

  test(`renders with Artifactory connector`, async () => {
    const props = {
      formik: formikValues,
      isReadonly: false,
      getNewConnectorSteps: mockGetFunction,
      setSelectedConnector: mockGetFunction,
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME],
      selectedConnector: 'Artifactory'
    } as any
    const { container, getByText } = renderComponent(props)
    const editQueries = container.querySelectorAll('[data-icon="edit"]')
    // remote edit
    fireEvent.click(editQueries[0])
    // inline edit
    fireEvent.click(editQueries[1])

    const addButton = await getByText('plusAdd')
    fireEvent.click(addButton)
    const popover = findPopoverContainer()
    expect(popover).toMatchSnapshot()

    expect(getByText('cd.addInline')).toBeTruthy()
    fireEvent.click(getByText('cd.addInline'))

    expect(getByText('cd.addRemote')).toBeTruthy()
    fireEvent.click(getByText('cd.addRemote'))

    const dailog = findDialogContainer()
    expect(dailog).toMatchSnapshot()

    //close
    fireEvent.click(document.querySelector('[data-icon="cross"]') as HTMLElement)
    waitFor(() => expect(dailog).toBeFalsy())
    expect(container).toMatchSnapshot()
  })
})
