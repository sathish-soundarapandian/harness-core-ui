/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import type { ArtifactType, CustomArtifactSource } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { CustomArtifact } from '../CustomArtifact'

const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 2,
  nextStep: jest.fn(),
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'CustomArtifact' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes
}

const initialValues = {
  identifier: '',
  spec: {
    version: '123'
  }
}

const scriptInitValues = {
  identifier: '',
  spec: {
    version: '123',
    delegateSelectors: '<+input>',
    inputs: [
      {
        id: 'variable1',
        name: 'variable1',
        type: 'String',
        value: '<+input>'
      }
    ],
    timeout: '<+input>',
    scripts: {
      fetchAllArtifacts: {
        artifactsArrayPath: '<+input>',
        attributes: [
          {
            id: 'variable',
            name: 'variable',
            type: 'String',
            value: '<+input>'
          }
        ],
        versionPath: '<+input>',
        spec: {
          shell: 'BASH',
          source: {
            spec: {
              script: '<+input>'
            },
            type: '<+input>'
          }
        }
      }
    }
  }
}

// eslint-disable-next-line jest/no-disabled-tests
describe('Custom Artifact tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={initialValues as CustomArtifactSource} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test(`version should have default value of runtimeinput`, async () => {
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={initialValues as CustomArtifactSource} {...props} />
      </TestWrapper>
    )
    const checkbox = container.querySelector('input[type="checkbox"][value=manual]')

    fireEvent.click(checkbox!)

    const versionField = queryByNameAttribute('spec.version', container) as HTMLInputElement
    expect(versionField).toBeTruthy()
    fireEvent.change(versionField, { target: { value: '123' } })
    expect(versionField.value).toEqual('123')
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test(`able to submit form when the form is non empty`, async () => {
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={initialValues as CustomArtifactSource} {...props} />
      </TestWrapper>
    )

    const checkbox = container.querySelector('input[type="checkbox"][value=manual]')
    fireEvent.click(checkbox!)
    const versionField = queryByNameAttribute('spec.version', container) as HTMLInputElement
    expect(versionField).toBeTruthy()
    fireEvent.change(versionField, { target: { value: '123' } })

    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)

    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier', container)!, { target: { value: 'testidentifier' } })
    })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          version: '123'
        }
      })
    })
  })

  test('form able to render in edit case', async () => {
    const editValues = {
      ...initialValues,
      identifier: 'test-identifier'
    }
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={editValues as CustomArtifactSource} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render form when script pulled dynamically from artifact location', () => {
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={scriptInitValues as CustomArtifactSource} {...props} />
      </TestWrapper>
    )

    const checkbox = container.querySelector('input[type="checkbox"][value=script]')
    fireEvent.click(checkbox!)

    expect(container).toMatchSnapshot()
  })

  test('fill form with details - for script option', async () => {
    const scriptEditProps = {
      ...props,
      identifier: 'test-identifier',
      spec: {
        timeout: '2h',
        scripts: {
          fetchAllArtifacts: {
            artifactsArrayPath: 'tes',
            versionPath: 'test-versionPath'
          }
        },
        version: '1'
      }
    }
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={scriptInitValues as CustomArtifactSource} {...scriptEditProps} />
      </TestWrapper>
    )

    fireEvent.change(queryByNameAttribute('identifier', container)!, { target: { value: 'testidentifier' } })
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          version: '123'
        }
      })
    })
  })

  test(`should throw validation error on submit`, async () => {
    const formVals = {
      identifier: '',
      spec: {
        version: '',
        delegateSelectors: '<+input>',
        inputs: [
          {
            id: 'variable1',
            name: 'variable1',
            type: 'String',
            value: '<+input>'
          }
        ],
        timeout: '<+input>',
        scripts: {
          fetchAllArtifacts: {
            artifactsArrayPath: '<+input>',
            attributes: [
              {
                id: 'variable',
                name: 'variable',
                type: 'String',
                value: '<+input>'
              }
            ],
            versionPath: '<+input>',
            spec: {
              shell: 'BASH',
              source: {
                spec: {
                  script: '<+input>'
                },
                type: '<+input>'
              }
            }
          }
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={formVals as CustomArtifactSource} {...props} />
      </TestWrapper>
    )

    const checkbox = container.querySelector('input[type="checkbox"][value=manual]')
    fireEvent.click(checkbox!)

    const submitBtn = container.querySelector('button[type="submit"]')!

    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier', container)!, { target: { value: 'testidentifier' } })
    })
    fireEvent.click(submitBtn)

    expect(container).toMatchSnapshot()
  })

  test('should throw validation error for on submit - for script type', async () => {
    const scriptFormVal = {
      identifier: '',
      spec: {
        version: ''
      }
    }
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={scriptFormVal as CustomArtifactSource} {...props} />
      </TestWrapper>
    )

    const checkbox = container.querySelector('input[type="checkbox"][value=script]')
    fireEvent.click(checkbox!)

    const submitBtn = container.querySelector('button[type="submit"]')!

    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier', container)!, { target: { value: 'testidentifier' } })
    })
    fireEvent.click(submitBtn)

    expect(container).toMatchSnapshot()
  })
})
