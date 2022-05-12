/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ArtifactType, TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { GCRImagePath } from '../GCRImagePath'

const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  context: 2,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'Gcr' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes
}

describe('GCR Image Path Artifact tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      registryHostname: ''
    }

    const { container } = render(
      <TestWrapper>
        <GCRImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders while adding step first time`, () => {
    const initialValues = {
      identifier: 'id',
      imagePath: 'library/nginx',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      registryHostname: ''
    }

    const { container } = render(
      <TestWrapper>
        <GCRImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'id',
      imagePath: 'library/nginx',
      tag: '',
      tagRegex: 'someregex',
      tagType: TagTypes.Regex,
      region: { name: 'region', value: 'region' }
    }

    const { container } = render(
      <TestWrapper>
        <GCRImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload ', async () => {
    const initialValues = {
      identifier: '',
      spec: {
        registryHostname: 'registryHostname-data'
      },
      type: 'Gcr',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: ''
    }

    const { container } = render(
      <TestWrapper>
        <GCRImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('imagePath')!, { target: { value: 'image-path' } })
      fireEvent.change(queryByNameAttribute('tagRegex')!, { target: { value: 'tag' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          imagePath: 'image-path',
          registryHostname: 'registryHostname-data',
          tagRegex: 'tag'
        }
      })
    })
  })

  test('submits with the right payload with Tagregex data ', async () => {
    const initialValues = {
      identifier: '',
      spec: {
        registryHostname: 'registryHostname-data1'
      },
      type: 'Gcr',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: ''
    }

    const { container } = render(
      <TestWrapper>
        <GCRImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier2' } })
      fireEvent.change(queryByNameAttribute('imagePath')!, { target: { value: 'image-path' } })
      fireEvent.change(queryByNameAttribute('registryHostname')!, { target: { value: 'registryHostname-data1' } })
      fireEvent.change(queryByNameAttribute('tagRegex')!, { target: { value: 'tag' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier2',
        spec: {
          connectorRef: '',
          imagePath: 'image-path',
          registryHostname: 'registryHostname-data1',
          tagRegex: 'tag'
        }
      })
    })
  })
})
