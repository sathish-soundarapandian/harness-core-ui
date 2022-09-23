/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ArtifactType, TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { mockSubscriptions, mockRegistries, mockRepositories } from './mocks'
import { ACRArtifact } from '../ACRArtifact'

const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: ModalViewFor.SIDECAR,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'Acr' as ArtifactType,
  selectedDeploymentType: 'Kubernetes'
}

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetBuildDetailsForACRRepository: jest.fn().mockImplementation(() => {
    return { data: mockRepositories, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetAzureSubscriptions: jest.fn().mockImplementation(() => {
    return {
      data: mockSubscriptions,
      refetch: jest.fn().mockReturnValue(mockSubscriptions),
      error: null,
      loading: false
    }
  }),
  useGetACRRegistriesBySubscription: jest.fn().mockImplementation(() => {
    return { data: mockRegistries, refetch: jest.fn().mockReturnValue(mockRegistries), error: null, loading: false }
  }),
  useGetACRRepositories: jest.fn().mockImplementation(() => {
    return { data: mockRepositories, refetch: jest.fn().mockReturnValue(mockRepositories), error: null, loading: false }
  })
}))

describe('Acr Artifact tests', () => {
  test('Should match snapshot for primary artifact', () => {
    const initialValues = {
      identifier: '',
      tag: '<+input>',
      tagRegex: '',
      repository: '',
      subscriptionId: '',
      registry: '',
      tagType: TagTypes.Value
    }

    const { container } = render(
      <TestWrapper>
        <ACRArtifact
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
          context={ModalViewFor.PRIMARY}
        />
      </TestWrapper>
    )

    expect(container.querySelector('input[name="identifier"]')!).not.toBeInTheDocument()
    expect(container.querySelector('input[name="subscriptionId"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="registry"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="repository"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="tag"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="tagRegex"]')!).not.toBeInTheDocument()
  })

  test('Should match snapshot for sidecar artifact', () => {
    const initialValues = {
      identifier: '',
      tag: '<+input>',
      tagRegex: '',
      repository: '',
      subscriptionId: '',
      registry: '',
      tagType: TagTypes.Value
    }

    const { container } = render(
      <TestWrapper>
        <ACRArtifact
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
        />
      </TestWrapper>
    )

    expect(container.querySelector('input[name="identifier"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="subscriptionId"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="registry"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="repository"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="tag"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="tagRegex"]')!).not.toBeInTheDocument()
  })

  test('Should render correctly in edit case', async () => {
    const initialValues = {
      spec: {
        connectorRef: 'validnonaks',
        tag: '<+input>',
        subscriptionId: '20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0',
        registry: 'reg1',
        repository: 'rep1'
      },
      identifier: 'S3',
      tag: '<+input>',
      tagRegex: '',
      tagType: TagTypes.Value,
      type: 'Acr'
    }

    const { container } = render(
      <TestWrapper>
        <ACRArtifact
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
        />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalled()
    })

    expect(container).toMatchSnapshot()
  })

  test('Should render correctly in edit case for runtime fields', async () => {
    const initialValues = {
      spec: {
        connectorRef: 'validnonaks',
        tag: '<+input>',
        subscriptionId: '<+input>',
        registry: '<+input>',
        repository: '<+input>'
      },
      identifier: 'S3',
      tag: '<+input>',
      tagRegex: '',
      tagType: TagTypes.Value,
      type: 'Acr'
    }

    const { container, getByText } = render(
      <TestWrapper>
        <ACRArtifact
          key={'key'}
          previousStep={jest.fn()}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
        />
      </TestWrapper>
    )

    expect(container.querySelector('input[name="subscriptionId"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="registry"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="repository"]')!).toBeInTheDocument()
    expect(container.querySelector('input[value="value"]')!).toBeChecked()

    await act(() => {
      fireEvent.click(getByText('back')!)
    })

    expect(container).toMatchSnapshot()
  })

  test('Should render correctly in edit case for runtime fields regex', async () => {
    const initialValues = {
      spec: {
        connectorRef: 'validnonaks',
        subscriptionId: '<+input>',
        registry: '<+input>',
        repository: '<+input>',
        tagRegex: '<+input>'
      },
      identifier: 'S3',
      tag: '',
      tagRegex: '<+input>',
      tagType: TagTypes.Regex,
      type: 'Acr'
    }

    const { container } = render(
      <TestWrapper>
        <ACRArtifact
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
        />
      </TestWrapper>
    )

    expect(container.querySelector('input[name="subscriptionId"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="registry"]')!).toBeInTheDocument()
    expect(container.querySelector('input[name="repository"]')!).toBeInTheDocument()
    expect(container.querySelector('input[value="regex"]')!).toBeChecked()
  })
})
