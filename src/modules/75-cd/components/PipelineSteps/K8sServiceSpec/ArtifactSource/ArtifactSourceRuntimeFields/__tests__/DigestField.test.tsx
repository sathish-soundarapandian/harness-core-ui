/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import { props } from './mocks'
import DigestField from '../DigestField'

const digestProps = {
  ...props,
  fetchingDigest: false,
  fetchDigestError: null,
  fetchDigest: jest.fn(),
  expressions: [''],
  stageIdentifier: 'stageId',
  digestData: null
}
describe('Digest Field tests', () => {
  test('initial render snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <DigestField
          {...digestProps}
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should match snapshot with error and buildDetailsList', async () => {
    const { container } = render(
      <TestWrapper>
        <DigestField
          {...digestProps}
          fetchDigestError={'DEFAULT_ERROR_CODE' as any}
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when digest call is not empty', async () => {
    const digesttestProps = {
      ...props,
      fetchingDigest: false,
      fetchDigestError: null,
      fetchDigest: jest.fn(),
      expressions: [''],
      stageIdentifier: 'stageId',
      digestData: {
        data: {
          metadata: {
            SHA: 'test1',
            SHAV2: 'test2'
          }
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <DigestField
          {...digesttestProps}
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when digest is runtime input', async () => {
    const digesttestProps = {
      ...props,
      fetchingDigest: false,
      fetchDigestError: null,
      fetchDigest: jest.fn(),
      expressions: [''],
      stageIdentifier: 'stageId',
      digestData: {
        data: {
          metadata: {
            SHA: 'test1',
            SHAV2: 'test2'
          }
        }
      },
      artifactPath: 'sidecars[5].sidecar'
    }
    const { container } = render(
      <TestWrapper>
        <DigestField
          {...digesttestProps}
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
