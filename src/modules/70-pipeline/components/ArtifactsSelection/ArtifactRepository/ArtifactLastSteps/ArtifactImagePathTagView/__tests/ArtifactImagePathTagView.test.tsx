/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type {
  ArtifactType,
  ArtifactImagePathTagViewProps
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { DockerBuildDetailsDTO } from 'services/cd-ng'
import ArtifactImagePathTagView, { NoTagResults, selectItemsMapper } from '../ArtifactImagePathTagView'

const getArtifactImagePathTagViewProps = (isArtifactPath = false): ArtifactImagePathTagViewProps => {
  return {
    selectedArtifact: 'DockerRegistry' as ArtifactType,
    formik: {},
    expressions: [''],
    isReadonly: false,
    allowableTypes: [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ] as AllowedTypesWithRunTime[],
    connectorIdValue: 'connectorId',
    fetchTags: jest.fn(),
    buildDetailsLoading: false,
    tagList: undefined,
    setTagList: jest.fn(),
    tagError: null,
    tagDisabled: false,
    isArtifactPath
  }
}

describe('ArtifactImagePathTagView tests', () => {
  test('check if artifactimagetagView renders correctly', () => {
    const props = getArtifactImagePathTagViewProps()
    const { container } = render(
      <TestWrapper>
        <ArtifactImagePathTagView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('check if artifactimagetagView renders with isArtifactPath set to true', () => {
    const props = getArtifactImagePathTagViewProps(true)
    const { container } = render(
      <TestWrapper>
        <ArtifactImagePathTagView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('check if NoTagResults renders correctly and custom tagErrorMessage exists in the document', () => {
    const props = {
      tagError: {
        data: { message: 'tagErrorMessage', data: '' },
        message: ''
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <NoTagResults {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(getByText('tagErrorMessage')).toBeInTheDocument()
  })
  test('check if tagError is null, default error message should render instead of custom error message', () => {
    const props = {
      tagError: null
    }
    const { getByText } = render(
      <TestWrapper>
        <NoTagResults {...props} />
      </TestWrapper>
    )
    expect(getByText('pipelineSteps.deploy.errors.notags')).toBeInTheDocument()
  })
  test('check selectItemsMapper function', () => {
    const emptyTagList: DockerBuildDetailsDTO[] = []
    const mappedEmptyTagList = selectItemsMapper(emptyTagList)
    expect(mappedEmptyTagList).toEqual([])

    const tagList: DockerBuildDetailsDTO[] = [{ tag: 'abc' }, { tag: 'xyz' }]
    const mappedTagList = selectItemsMapper(tagList)
    expect(mappedTagList).toEqual([
      { label: 'abc', value: 'abc' },
      { label: 'xyz', value: 'xyz' }
    ])
  })
})
