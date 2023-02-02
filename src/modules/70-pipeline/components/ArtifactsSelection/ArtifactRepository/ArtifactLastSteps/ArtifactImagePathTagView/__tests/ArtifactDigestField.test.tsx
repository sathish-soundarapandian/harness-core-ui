/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'

import * as cdng from 'services/cd-ng'

import { TestWrapper } from '@common/utils/testUtils'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import ArtifactDigestField from '../ArtifactDigestField'

const props = {
  selectedArtifact: 'DockerRegistry' as ArtifactType,
  formik: {},
  expressions: [''],
  isReadonly: false,
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  lastImagePath: '',
  connectorRefValue: 'connectorRef',
  connectorIdValue: 'connectorId',
  fetchTags: jest.fn(),
  isBuildDetailsLoading: false
}

const fetchDigests = jest.fn().mockReturnValue({
  data: {
    metadata: {
      SHA: 'test',
      SHAV2: 'test2'
    }
  }
})
jest.mock('services/cd-ng', () => ({
  useGetLastSuccessfulBuildForDocker: jest.fn().mockImplementation(() => {
    return {
      data: {
        metadata: {
          SHA: 'test',
          SHAV2: 'test2'
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
describe('ArtifactDigest tests', () => {
  test('initial render', () => {
    const { container } = render(
      <TestWrapper>
        <ArtifactDigestField {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when digest is filled', () => {
    const digestProps = {
      ...props,
      formik: {
        values: {
          digest: 'test'
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactDigestField {...digestProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when digest is runtime', () => {
    const digestProps = {
      ...props,
      formik: {
        values: {
          digest: '<+input>'
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactDigestField {...digestProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('api is getting called when digest is focussed', async () => {
    jest.spyOn(cdng, 'useGetLastSuccessfulBuildForDocker').mockImplementation((): any => {
      return {
        loading: true,
        data: null,
        refetch: fetchDigests
      }
    })
    const { container } = render(
      <TestWrapper>
        <ArtifactDigestField {...props} />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    expect(container).toMatchSnapshot()
    const packageDropdwnBtn = container.querySelectorAll('[data-icon="chevron-down"]')[0]
    userEvent.click(packageDropdwnBtn!)

    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')

    const loadingBucketsOption = await findByText(
      selectListMenu as HTMLElement,
      'pipeline.artifactsSelection.loadingDigest'
    )
    expect(loadingBucketsOption).toBeDefined()
  })

  test('api empty digest results', async () => {
    jest.spyOn(cdng, 'useGetLastSuccessfulBuildForDocker').mockImplementation((): any => {
      return {
        loading: false,
        data: [],
        refetch: fetchDigests
      }
    })
    const { container } = render(
      <TestWrapper>
        <ArtifactDigestField {...props} />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    expect(container).toMatchSnapshot()
    const packageDropdwnBtn = container.querySelectorAll('[data-icon="chevron-down"]')[0]
    userEvent.click(packageDropdwnBtn!)

    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')

    const loadingBucketsOption = await findByText(
      selectListMenu as HTMLElement,
      'pipeline.artifactsSelection.errors.nodigest'
    )
    expect(loadingBucketsOption).toBeDefined()
  })
})
