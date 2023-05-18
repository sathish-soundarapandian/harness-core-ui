/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { findByText, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cdng from 'services/cd-ng'

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

const fetchTags = jest.fn().mockReturnValue({
  data: {
    message: 'No tags'
  }
})

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

  test('when tagRegex is runtime', () => {
    const props = getArtifactImagePathTagViewProps(true)

    const formProps = {
      ...props,
      formik: {
        values: {
          tagType: 'regex',
          tagRegex: '<+input>'
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactImagePathTagView {...formProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when tagType is regex', () => {
    const props = getArtifactImagePathTagViewProps(true)

    const formProps = {
      ...props,
      formik: {
        values: {
          tagType: 'regex'
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactImagePathTagView {...formProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when tagType is value', () => {
    const props = getArtifactImagePathTagViewProps(true)

    const formProps = {
      ...props,
      formik: {
        values: {
          tagType: 'value'
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactImagePathTagView {...formProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when tagType is value and tag is runtime input', () => {
    const props = getArtifactImagePathTagViewProps(true)

    const formProps = {
      ...props,
      formik: {
        values: {
          tagType: 'value',
          tag: '<+input>',
          tagRegex: ''
        },
        setFieldValue: jest.fn()
      }
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactImagePathTagView {...formProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when tagType is value and tag is fixed input', () => {
    const props = getArtifactImagePathTagViewProps(true)

    const formProps = {
      ...props,
      formik: {
        values: {
          tagType: 'value',
          tag: 'tag-1.2',
          tagRegex: ''
        },
        setFieldValue: jest.fn()
      }
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactImagePathTagView {...formProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should make an api call-when artifact tag dropdown is clicked', async () => {
    jest.spyOn(cdng, 'useGetBuildDetailsForDocker').mockImplementation((): any => {
      return {
        loading: true,
        data: null,
        refetch: fetchTags
      }
    })

    const props = getArtifactImagePathTagViewProps(true)

    const formProps = {
      ...props,
      formik: {
        values: {
          tagType: 'value'
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactImagePathTagView {...formProps} />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    expect(container).toMatchSnapshot()
    const packageDropdwnBtn = container.querySelectorAll('[data-icon="chevron-down"]')[0]
    await userEvent.click(packageDropdwnBtn!)

    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')

    const noTags = await findByText(selectListMenu as HTMLElement, 'pipelineSteps.deploy.errors.notags')
    expect(noTags).toBeDefined()
  })
})
