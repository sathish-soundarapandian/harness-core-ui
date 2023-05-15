/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { useMutateAsGet } from '@common/hooks'
import { ArtifactType, TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { ECRArtifact } from '../ECRArtifact'
import { imagesListData } from './mock'

const mockRegions = {
  resource: [{ name: 'region1', value: 'region1' }]
}

const fetchImages = jest.fn().mockReturnValue(imagesListData)

jest.mock('services/cd-ng', () => ({
  useGetImagesListForEcr: jest.fn().mockImplementation(() => {
    return { data: null, refetch: fetchImages, error: null, loading: false }
  }),
  useGetBuildDetailsForEcr: () =>
    jest.fn().mockImplementation(() => {
      return { data: { data: { buildDetailsList: [] } }, refetch: jest.fn(), error: null }
    })
}))
jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: mockRegions, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: null, refetch: fetchImages, error: null, loading: false }
  })
}))

const onSubmit = jest.fn()
const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 2,
  handleSubmit: onSubmit,
  artifactIdentifiers: [],
  selectedArtifact: 'Ecr' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes,
  prevStepData: {
    connectorId: {
      value: 'testConnector'
    }
  }
}

describe('ECR Artifact tests', () => {
  beforeEach(() => {
    fetchImages.mockReset()
    onSubmit.mockReset()
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: null, refetch: fetchImages, error: null, loading: false }
    })
  })

  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      region: { name: '', value: '' }
    }

    const { container } = render(
      <TestWrapper>
        <ECRArtifact key={'key'} initialValues={initialValues} {...props} />
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
      region: { name: '', value: '' }
    }

    const { container } = render(
      <TestWrapper>
        <ECRArtifact key={'key'} initialValues={initialValues} {...props} />
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
        <ECRArtifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload including Tag Regex data', async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: imagesListData, refetch: fetchImages, error: null, loading: false }
    })

    const initialValues = {
      identifier: '',
      spec: {
        region: 'region1',
        imagePath: ''
      },
      type: 'Ecr',
      tag: '',
      tagType: TagTypes.Regex,
      tagRegex: ''
    }

    const { container } = render(
      <TestWrapper>
        <ECRArtifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    // Name
    fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
    // Image Path
    await waitFor(() => expect(fetchImages).toHaveBeenCalledTimes(0))
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const imagePathDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    await userEvent.click(imagePathDropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    await waitFor(() => expect(fetchImages).toHaveBeenCalledTimes(1))
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const secondImageOption = await findByText(selectListMenu as HTMLElement, 'harnesscie-testing3')
    expect(secondImageOption).toBeInTheDocument()
    await userEvent.click(secondImageOption)
    // Tag Regex
    fireEvent.change(queryByNameAttribute('tagRegex')!, { target: { value: 'tagRegex' } })

    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: 'testConnector',
          imagePath: 'harnesscie-testing3',
          region: 'region1',
          tagRegex: 'tagRegex'
        }
      })
    })
  })

  test(`Image Path field should allow creating new items and should not make API call when region is Runtime input`, async () => {
    const initialValues = {
      identifier: '',
      type: ENABLED_ARTIFACT_TYPES.Ecr,
      spec: {
        region: RUNTIME_INPUT_VALUE,
        imagePath: 'harnesscie-testing3'
      },
      tag: undefined,
      tagType: TagTypes.Regex,
      tagRegex: ''
    }

    const { container, getByText } = render(
      <TestWrapper>
        <ECRArtifact key={'key1'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // Name
    fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testECR' } })

    // Image Path
    const imagePathInput = queryByNameAttribute('imagePath') as HTMLInputElement
    expect(imagePathInput.value).toBe('harnesscie-testing3')
    expect(getByText('pipeline.imagePathHelperText')).toBeInTheDocument()
    // Only one dropdown field should be rendered - Image Path
    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(1)
    await userEvent.click(dropdownIcons[0])
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDivImagePath = portalDivs[0]
    await waitFor(() => expect(fetchImages).toHaveBeenCalledTimes(0))
    const selectListMenu = dropdownPortalDivImagePath.querySelector('.bp3-menu')
    const noImagesOption = await findByText(selectListMenu as HTMLElement, 'pipeline.noImagesFound')
    expect(noImagesOption).toBeInTheDocument()
    await userEvent.type(imagePathInput, 'abc')
    const abcOption = await findByText(selectListMenu as HTMLElement, 'abc')
    expect(abcOption).toBeInTheDocument()
    await userEvent.click(abcOption)
    await waitFor(() => expect(imagePathInput.value).toBe('abc'))

    // Tag Regex
    fireEvent.change(queryByNameAttribute('tagRegex')!, { target: { value: 'tagRegex' } })

    const submitBtn = getByText('submit')
    await userEvent.click(submitBtn)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        identifier: 'testECR',
        spec: {
          connectorRef: 'testConnector',
          imagePath: 'abc',
          region: RUNTIME_INPUT_VALUE,
          tagRegex: 'tagRegex'
        }
      })
    })
  })

  test(`Image Path field should show Loading options when API is in progress`, async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: null, refetch: fetchImages, error: null, loading: true }
    })

    const initialValues = {
      identifier: '',
      type: ENABLED_ARTIFACT_TYPES.Ecr,
      spec: {
        region: 'region1',
        imagePath: ''
      },
      tag: undefined,
      tagType: TagTypes.Regex,
      tagRegex: ''
    }

    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <ECRArtifact key={'key1'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // Name
    fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testECR' } })

    // Image Path
    const imagePathInput = queryByNameAttribute('imagePath') as HTMLInputElement
    expect(imagePathInput.value).toBe('')
    expect(queryByText('pipeline.imagePathHelperText')).not.toBeInTheDocument()
    // Only one dropdown field should be rendered - Image Path
    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(2)
    await userEvent.click(dropdownIcons[1])
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDivImagePath = portalDivs[0]
    await waitFor(() => expect(fetchImages).toHaveBeenCalledTimes(0))
    const selectListMenu = dropdownPortalDivImagePath.querySelector('.bp3-menu')
    const loadingOption = await findByText(selectListMenu as HTMLElement, 'loading')
    expect(loadingOption).toBeInTheDocument()
    expect(imagePathInput.value).toBe('')

    // Tag Regex
    fireEvent.change(queryByNameAttribute('tagRegex')!, { target: { value: 'tagRegex' } })

    const submitBtn = getByText('submit')
    await userEvent.click(submitBtn)
    await waitFor(() => {
      expect(onSubmit).not.toBeCalled()
    })
    await waitFor(() => expect(getByText('pipeline.artifactsSelection.validation.imagePath')).toBeInTheDocument())
  })
})
