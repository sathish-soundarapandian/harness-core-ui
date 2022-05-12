/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PlatformEntryType, SupportPlatforms } from '@cf/components/LanguageSelection/LanguageSelection'
import mockImport from 'framework/utils/mockImport'
import { OnboardingDetailPage } from '../OnboardingDetailPage'
import { CreateAFlagView } from '../views/CreateAFlagView'
import { SetUpYourApplicationView } from '../views/SetUpYourApplicationView'
import { TestYourFlagView } from '../views/TestYourFlagView'
import { SelectEnvironmentView } from '../views/SelectEnvironmentView'

jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: jest.fn() })
}))

describe('OnboardingDetailPage', () => {
  test('OnboardingDetailPage empty state should be rendered properly', () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: true,
        refetch: jest.fn(),
        EnvironmentSelect: <div />,
        environments: [
          {
            accountId: 'harness',
            identifier: 'foo',
            name: 'bar',
            type: 'Production'
          }
        ]
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <OnboardingDetailPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should be able to create a flag', () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: true,
        refetch: jest.fn(),
        EnvironmentSelect: <div />,
        environments: [
          {
            accountId: 'harness',
            identifier: 'foo',
            name: 'bar',
            type: 'Production'
          }
        ]
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <OnboardingDetailPage />
      </TestWrapper>
    )

    const flagName = 'test-boolean-flag'

    fireEvent.input(container.querySelector('input') as HTMLInputElement, { target: { value: flagName } })

    waitFor(() =>
      expect(container.querySelector('button[class*=Button--button]:not(:first-of-type)[class*=disabled]')).toBeNull()
    )

    fireEvent.click(container.querySelector('button[class*=Button--button]:not(:first-of-type)') as HTMLButtonElement)

    // waitFor(() => expect(container.querySelector('button[class*=LanguageSelection-module_button')).not.toBeNull())

    expect(container).toMatchSnapshot()
  })

  test('CreateAFlagView', () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: true,
        refetch: jest.fn(),
        EnvironmentSelect: <div />,
        environments: [
          {
            accountId: 'harness',
            identifier: 'foo',
            name: 'bar',
            type: 'Production'
          }
        ]
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CreateAFlagView
          flagInfo={{
            project: 'dummy',
            name: 'test-flag',
            identifier: 'test_flag',
            kind: 'boolean',
            archived: false,
            variations: [
              { identifier: 'true', name: 'True', value: 'true' },
              { identifier: 'false', name: 'False', value: 'false' }
            ],
            defaultOnVariation: 'true',
            defaultOffVariation: 'false',
            permanent: false
          }}
          setFlagName={jest.fn()}
          isCreated={true}
          goNext={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('SetUpYourApplicationView', () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: true,
        refetch: jest.fn(),
        EnvironmentSelect: <div />,
        environments: [
          {
            accountId: 'harness',
            identifier: 'foo',
            name: 'bar',
            type: 'Production'
          }
        ]
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SetUpYourApplicationView
          flagInfo={{
            project: 'dummy',
            name: 'test-flag',
            identifier: 'test_flag',
            kind: 'boolean',
            archived: false,
            variations: [
              { identifier: 'true', name: 'True', value: 'true' },
              { identifier: 'false', name: 'False', value: 'false' }
            ],
            defaultOnVariation: 'true',
            defaultOffVariation: 'false',
            permanent: false
          }}
          language={SupportPlatforms[1]}
          setLanguage={jest.fn()}
          apiKey={{
            name: 'xxx-xxx-xxx',
            apiKey: 'xxx-xxx-xxx',
            identifier: 'xxx-xxx-xxx',
            type: 'server'
          }}
          setApiKey={jest.fn()}
          setEnvironmentIdentifier={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('TestYourFlagViewView', () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: true,
        refetch: jest.fn(),
        EnvironmentSelect: <div />,
        environments: [
          {
            accountId: 'harness',
            identifier: 'foo',
            name: 'bar',
            type: 'Production'
          }
        ]
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <TestYourFlagView
          flagInfo={{
            project: 'dummy',
            name: 'test-flag',
            identifier: 'test_flag',
            kind: 'boolean',
            archived: false,
            variations: [
              { identifier: 'true', name: 'True', value: 'true' },
              { identifier: 'false', name: 'False', value: 'false' }
            ],
            defaultOnVariation: 'true',
            defaultOffVariation: 'false',
            permanent: false
          }}
          language={SupportPlatforms[1]}
          apiKey={{
            name: 'xxx-xxx-xxx',
            apiKey: 'xxx-xxx-xxx',
            identifier: 'xxx-xxx-xxx',
            type: 'server'
          }}
          environmentIdentifier="foo-123-bar"
          testDone={false}
          setTestDone={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('SelectEnvironmentView should render loading correctly', async () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({ loading: true, refetch: jest.fn() })
    })

    const { container } = render(
      <SelectEnvironmentView
        language={{
          name: 'foo',
          icon: 'bar',
          type: PlatformEntryType.CLIENT,
          readmeStringId: 'cf.onboarding.readme.java'
        }}
        apiKey={undefined}
        setApiKey={jest.fn()}
        setEnvironmentIdentifier={jest.fn()}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('SelectEnvironmentView should render data correctly', async () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: true,
        refetch: jest.fn(),
        EnvironmentSelect: <div />,
        environments: [
          {
            accountId: 'harness',
            identifier: 'foo',
            name: 'bar',
            type: 'Production'
          }
        ]
      })
    })

    const { container } = render(
      <SelectEnvironmentView
        language={{
          name: 'foo',
          icon: 'bar',
          type: PlatformEntryType.CLIENT,
          readmeStringId: 'cf.onboarding.readme.java'
        }}
        apiKey={undefined}
        setApiKey={jest.fn()}
        setEnvironmentIdentifier={jest.fn()}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
