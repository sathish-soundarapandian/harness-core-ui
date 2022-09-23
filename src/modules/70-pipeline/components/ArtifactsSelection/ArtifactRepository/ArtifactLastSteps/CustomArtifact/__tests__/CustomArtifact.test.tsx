/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
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
  test.skip(`version should have default value of runtimeinput`, async () => {
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={initialValues as CustomArtifactSource} {...props} />
      </TestWrapper>
    )
    const versionField = queryByNameAttribute('spec.version', container) as HTMLInputElement
    expect(versionField).toBeTruthy()
    expect(versionField.value).toEqual('123')

    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(`able to submit form when the form is non empty`, async () => {
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={initialValues as CustomArtifactSource} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)

    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier', container)!, { target: { value: 'testidentifier' } })
    })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(props.nextStep).toBeCalled()
      expect(props.nextStep).toHaveBeenCalledWith({
        ...initialValues,
        identifier: 'testidentifier'
      })
    })
  })

  test(`form renders correctly in Edit Case`, async () => {
    const filledInValues = {
      identifier: 'nexusSidecarId',
      version: 'artifact-version'
    }
    const { container } = render(
      <TestWrapper>
        <CustomArtifact key={'key'} initialValues={filledInValues as CustomArtifactSource} {...props} />
      </TestWrapper>
    )
    const versionField = container.querySelector('input[name="spec.version"]')
    expect(versionField).not.toBeNull()

    expect(container).toMatchSnapshot()
  })
})
