/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { render, fireEvent, act, waitFor, screen } from '@testing-library/react'
import { useFormikContext } from 'formik'
import userEvent from '@testing-library/user-event'
import routes from '@common/RouteDefinitions'
import * as featureFlags from '@common/hooks/useFeatureFlag'
import * as ConnectorComponent from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { FeatureFlag } from '@common/featureFlags'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import DefineHealthSource from '../DefineHealthSource'
import { workspaceIdqueryParamsExpected, workspaceMock } from './DefineHealthSource.mock'

const createModeProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: {},
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

const fetchWorkspaceIdMock = jest.fn()

jest.mock('services/cv', () => ({
  useGetAllAwsRegions: jest.fn().mockImplementation(() => {
    return { data: { data: ['region 1', 'region 2'] } } as any
  }),
  useGetPrometheusWorkspaces: jest.fn().mockImplementation(() => {
    return { data: workspaceMock, refetch: fetchWorkspaceIdMock } as any
  })
}))

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({
    isInitializingDB: false,
    dbInstance: {
      put: jest.fn(),
      get: jest.fn().mockReturnValue(undefined)
    }
  }),
  CVObjectStoreNames: {}
}))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ data: {} })),
  useGetConnectorCatalogue: jest.fn().mockImplementation(() => {
    return { data: [], loading: false }
  })
}))
jest.mock('@connectors/pages/connectors/hooks/useGetConnectorsListHook/useGetConectorsListHook', () => ({
  useGetConnectorsListHook: jest.fn().mockReturnValue({
    loading: true,
    categoriesMap: {}
  })
}))

describe('DefineHealthSource', () => {
  test('should have proper validation', async () => {
    const { getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )
    // next button visible
    expect(getByText('next')).not.toBeNull()
    await act(async () => {
      //click next
      fireEvent.click(getByText('next'))
      // check error texts
      await waitFor(() => expect(getByText('cv.onboarding.selectProductScreen.validationText.source')).not.toBeNull())
      await waitFor(() => expect(getByText('cv.onboarding.selectProductScreen.validationText.name')).not.toBeNull())
    })
  })

  test('Click on custom health card', async () => {
    const { getByText, container } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('CustomHealth')).not.toBeNull())
    fireEvent.click(container.querySelector('[data-icon="service-custom-connector"]')!)
    await waitFor(() => expect(container.querySelector('[class*="Card--badge"]')).not.toBeNull())
    expect(container.querySelector('input[placeholder="- cv.healthSource.featurePlaceholder -"]')).not.toBeNull()
  })

  test('Click on cloud watch card', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlag').mockImplementation(flag => {
      if (flag === FeatureFlag.SRM_ENABLE_HEALTHSOURCE_CLOUDWATCH_METRICS) {
        return true
      }
      return false
    })
    const { getByText, container } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('CloudWatch')).not.toBeNull())

    act(() => {
      userEvent.click(container.querySelector('[data-icon="service-aws"]')!)
    })

    await waitFor(() => expect(container.querySelector('[class*="Card--badge"]')).not.toBeNull())
    expect(container.querySelector('input[placeholder="- cv.healthSource.featurePlaceholder -"]')).not.toBeNull()
  })

  test('should not render Cloud watch option, if feature flag is disabled', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlag').mockImplementation(flag => {
      if (flag === FeatureFlag.SRM_ENABLE_HEALTHSOURCE_CLOUDWATCH_METRICS) {
        return false
      }
      return true
    })
    render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )

    await waitFor(() => expect(screen.queryByText('CloudWatch Metrics')).toBeNull())
  })

  test('Verify connector has only Account tab when template is account level', async () => {
    const accountLevelProps: TestWrapperProps = {
      path: routes.toTemplateStudio({ ...accountPathProps }),
      pathParams: { accountId: '1234_accountId' }
    }
    const { container } = render(
      <TestWrapper {...accountLevelProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await act(() => {
      userEvent.click(container.querySelector('span[data-icon="service-appdynamics"]')!)
    })
    await act(() => {
      userEvent.click(container.querySelector('button[data-testid="cr-field-connectorRef"]')!)
    })
    await waitFor(() => expect(document.querySelector('.bp3-dialog div[data-tab-id="account"]')).toBeInTheDocument())
    await waitFor(() => expect(document.querySelector('.bp3-dialog div[data-tab-id="org"]')).not.toBeInTheDocument())
    await waitFor(() =>
      expect(document.querySelector('.bp3-dialog div[data-tab-id="project"]')).not.toBeInTheDocument()
    )
  })

  test('Verify connector has only Account tab and Org tab when template is Org level', async () => {
    const accountLevelProps: TestWrapperProps = {
      path: routes.toTemplateStudio({ ...accountPathProps, ...orgPathProps }),
      pathParams: { accountId: '1234_accountId', orgIdentifier: '1234_org' }
    }
    const { container } = render(
      <TestWrapper {...accountLevelProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await act(() => {
      userEvent.click(container.querySelector('span[data-icon="service-appdynamics"]')!)
    })
    await act(() => {
      userEvent.click(container.querySelector('button[data-testid="cr-field-connectorRef"]')!)
    })
    await waitFor(() => expect(document.querySelector('.bp3-dialog div[data-tab-id="account"]')).toBeInTheDocument())
    await waitFor(() =>
      expect(document.querySelector('.bp3-dialog div[data-tab-id="organization"]')).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(document.querySelector('.bp3-dialog div[data-tab-id="project"]')).not.toBeInTheDocument()
    )
  })

  test('should render data source type thumbnail select, if feature flag is turned on', async () => {
    const mockAddListener = jest.spyOn(ConnectorComponent, 'FormConnectorReferenceField' as never)

    mockAddListener.mockImplementation(() => {
      const formik = useFormikContext()

      useEffect(() => {
        formik.setFieldValue('connectorRef', 'abc')
      }, [formik.values])

      return (<h1 data-testid="formConnectorReferenceField">connector</h1>) as never
    })

    jest.spyOn(featureFlags, 'useFeatureFlag').mockImplementation(flag => {
      if (flag === FeatureFlag.SRM_ENABLE_HEALTHSOURCE_AWS_PROMETHEUS) {
        return true
      }
      return false
    })

    const onSubmitMock = jest.fn()

    const accountLevelProps: TestWrapperProps = {
      path: routes.toTemplateStudio({ ...accountPathProps, ...orgPathProps, ...projectPathProps }),
      pathParams: { accountId: '1234_accountId', orgIdentifier: '1234_org', projectIdentifier: 'abc' }
    }

    const { container } = render(
      <TestWrapper {...accountLevelProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource onSubmit={onSubmitMock} />
        </SetupSourceTabs>
      </TestWrapper>
    )

    expect(screen.queryByTestId('dataSourceTypeSelector')).not.toBeInTheDocument()

    act(() => {
      userEvent.click(container.querySelector('span[data-icon="service-prometheus"]')!)
    })

    await waitFor(() => {
      expect(fetchWorkspaceIdMock).not.toHaveBeenCalled()
    })

    expect(screen.getByTestId('dataSourceTypeSelector')).toBeInTheDocument()

    act(() => {
      userEvent.click(screen.getByText(/next/))
    })

    await waitFor(() => {
      expect(screen.getByText(/cv.healthSource.dataSourceTypeValidation/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/- cv.healthSource.featurePlaceholder -/)).toBeDisabled()
    })

    await act(() => {
      userEvent.click(screen.getByText(/cv.healthSource.awsDataSourceName/))
    })

    await waitFor(() => {
      expect(screen.queryByText(/cv.healthSource.dataSourceTypeValidation/)).not.toBeInTheDocument()
      expect(screen.getByText(/cv.healthSource.awsRegionLabel/)).toBeInTheDocument()
      expect(screen.getByText(/cv.healthSource.awsWorkspaceLabel/)).toBeInTheDocument()
    })

    act(() => {
      userEvent.type(screen.getByPlaceholderText(/cv.healthSource.namePlaceholder/), 'testName')
    })

    act(() => {
      userEvent.click(screen.getByPlaceholderText(/- cv.healthSource.connectors.CloudWatch.awsSelectorPlaceholder -/))
    })

    await waitFor(() => {
      expect(screen.getByText(/region 1/)).toBeInTheDocument()
    })

    act(() => {
      userEvent.click(screen.getByText(/region 1/))
    })

    await waitFor(() => {
      expect(fetchWorkspaceIdMock).toHaveBeenCalledWith(workspaceIdqueryParamsExpected)
    })

    act(() => {
      userEvent.click(screen.getByPlaceholderText(/- cv.healthSource.awsWorkspacePlaceholderText -/))
    })

    await waitFor(() => {
      expect(screen.getByText(/Workspace 1/)).toBeInTheDocument()
    })

    act(() => {
      userEvent.click(screen.getByText(/Workspace 1/))
    })

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/- cv.healthSource.awsWorkspacePlaceholderText -/)).toHaveValue('Workspace 1')
    })

    act(() => {
      userEvent.click(screen.getByText(/next/))
    })

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        connectorRef: 'abc',
        dataSourceType: 'AWS_PROMETHEUS',
        healthSourceIdentifier: 'testName',
        healthSourceName: 'testName',
        product: { label: 'apm', value: 'connectors.prometheusLabel' },
        region: 'region 1',
        sourceType: 'Prometheus',
        workspaceId: 'sjksm43455n-34x53c45vdssd-fgdfd232sdfad'
      })
    })
  })

  test('should not render data source type thumbnail select, if feature flag is turned off', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlag').mockImplementation(flag => {
      if (flag === FeatureFlag.SRM_ENABLE_HEALTHSOURCE_AWS_PROMETHEUS) {
        return false
      }
      return true
    })
    const accountLevelProps: TestWrapperProps = {
      path: routes.toTemplateStudio({ ...accountPathProps, ...orgPathProps }),
      pathParams: { accountId: '1234_accountId', orgIdentifier: '1234_org' }
    }
    const { container } = render(
      <TestWrapper {...accountLevelProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )

    expect(screen.queryByTestId('dataSourceTypeSelector')).not.toBeInTheDocument()

    await act(() => {
      userEvent.click(container.querySelector('span[data-icon="service-prometheus"]')!)
    })

    expect(screen.queryByText(/dataSourceTypeSelector/)).not.toBeInTheDocument()
    expect(screen.queryByText(/cv.healthSource.awsRegionLabel/)).not.toBeInTheDocument()
    expect(screen.queryByText(/cv.healthSource.awsWorkspaceLabel/)).not.toBeInTheDocument()
  })
})
