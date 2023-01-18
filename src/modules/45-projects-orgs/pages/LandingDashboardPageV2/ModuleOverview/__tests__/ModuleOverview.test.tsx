/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DEFAULT_TIME_RANGE } from '@common/utils/momentUtils'
import { ModuleName } from 'framework/types/ModuleName'
import ModuleOverview from '../ModuleOverview'

jest.mock('../modules/CDModuleOverview', () => {
  return (props: any) =>
    props.isExpanded ? <div>CD module overview expanded</div> : <div>CD module overview collapsed</div>
})

jest.mock('../modules/CIModuleOverview', () => {
  return (props: any) => (props.isEmpty ? <div>CI module empty state</div> : <div>CI module data state</div>)
})

jest.mock('../modules/CFModuleOverview', () => {
  return () => <div>CF module overview</div>
})

jest.mock('../modules/ChaosModuleOverview', () => {
  return () => <div>Chaos module overview</div>
})

jest.mock('../modules/STOModuleOverview', () => {
  return () => <div>STO module overview</div>
})

jest.mock('../modules/CEModuleOverview', () => {
  return () => <div>CE module overview</div>
})

jest.mock('../modules/SLOModuleOverview', () => {
  return () => <div>SLO module overview</div>
})

describe('module overview grid test', () => {
  test('test collapsed empty state', () => {
    const { queryByText } = render(
      <TestWrapper>
        <ModuleOverview timeRange={DEFAULT_TIME_RANGE} module={ModuleName.CD} isExpanded={false} />
      </TestWrapper>
    )

    expect(queryByText('CD module overview collapsed')).not.toBeNull()
  })

  test('test expanded empty state', () => {
    const { queryByText } = render(
      <TestWrapper>
        <ModuleOverview timeRange={DEFAULT_TIME_RANGE} module={ModuleName.CD} isExpanded={true} />
      </TestWrapper>
    )

    expect(queryByText('CD module overview expanded')).not.toBeNull()
  })

  test('test collapsed data state', () => {
    const { queryByText } = render(
      <TestWrapper
        defaultLicenseStoreValues={{
          licenseInformation: {
            CI: { edition: 'ENTERPRISE', status: 'ACTIVE', id: 'adcad' }
          }
        }}
      >
        <ModuleOverview timeRange={DEFAULT_TIME_RANGE} module={ModuleName.CI} isExpanded={false} />
      </TestWrapper>
    )

    expect(queryByText('CI module data state')).not.toBeNull()
  })

  test('test expanded data state', () => {
    const { queryByText } = render(
      <TestWrapper
        defaultLicenseStoreValues={{
          licenseInformation: {
            CI: { edition: 'ENTERPRISE', status: 'ACTIVE', id: 'adcad' }
          }
        }}
      >
        <ModuleOverview timeRange={DEFAULT_TIME_RANGE} module={ModuleName.CI} isExpanded={true} />
      </TestWrapper>
    )

    expect(queryByText('CI module data state')).not.toBeNull()
  })

  test('test code module empty state', () => {
    const { queryByText } = render(
      <TestWrapper
        defaultLicenseStoreValues={{
          licenseInformation: {
            CODE: { edition: 'ENTERPRISE', status: 'ACTIVE', id: 'adcad' }
          }
        }}
      >
        <ModuleOverview timeRange={DEFAULT_TIME_RANGE} module={ModuleName.CODE} isExpanded={false} />
      </TestWrapper>
    )

    expect(queryByText('moduleOverviewDataState')).toBeNull()
  })
})
