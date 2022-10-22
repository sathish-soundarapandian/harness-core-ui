/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { act } from 'react-test-renderer'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  DynatraceHealthSourcePropsMock,
  DynatraceMockHealthSourceData,
  MockDynatraceMetricDataWithCustomMetric,
  mockUseGetDynatraceServices
} from '@cv/pages/health-source/connectors/Dynatrace/__tests__/DynatraceHealthSource.mock'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DynatraceHealthSource from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource'
import type { DynatraceHealthSourceProps } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import * as cvService from 'services/cv'
import type { DynatraceMetricPacksToServiceProps } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceMetricPacksToService/DynatraceMetricPacksToService.types'
import * as DynatraceHealthSourceUtils from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'

import type { FooterCTAProps } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

jest.mock('@common/hooks/useFeatureFlag')

jest.mock('@cv/pages/health-source/common/DrawerFooter/DrawerFooter', () => (props: FooterCTAProps) => {
  useEffect(() => {
    props.onNext?.()
  }, [])
  return (
    <>
      <button
        data-testid={'triggerPreviousButtonMock'}
        onClick={() => {
          props.onPrevious?.()
        }}
      />
    </>
  )
})
const customMetricsComponentRenderMock = jest.fn()
jest.mock(
  '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics',
  () => () => {
    useEffect(() => {
      customMetricsComponentRenderMock()
    }, [])
    return <></>
  }
)

const dynatraceMetricPacksMappingRenderMock = jest.fn()
jest.mock(
  '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceMetricPacksToService/DynatraceMetricPacksToService',
  () => (props: DynatraceMetricPacksToServiceProps) => {
    useEffect(() => {
      dynatraceMetricPacksMappingRenderMock(props)
    }, [])
    return <></>
  }
)

function WrapperComponent(props: DynatraceHealthSourceProps): JSX.Element {
  return (
    <TestWrapper
      path={routes.toCVActivitySourceEditSetup({
        ...accountPathProps,
        ...projectPathProps
      })}
      pathParams={{
        accountId: projectPathProps.accountId,
        projectIdentifier: projectPathProps.projectIdentifier,
        orgIdentifier: projectPathProps.orgIdentifier,
        activitySource: '1234_activitySource',
        activitySourceId: '1234_sourceId'
      }}
    >
      <SetupSourceTabs data={DynatraceMockHealthSourceData} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <DynatraceHealthSource {...props} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Validate DynatraceHealthSource', () => {
  beforeAll(() => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(cvService, 'useGetDynatraceServices').mockReturnValue(mockUseGetDynatraceServices as any)
    jest.spyOn(cvService, 'useGetMetricPacks').mockReturnValue({ data: { data: [] }, refetch: jest.fn() } as any)
    jest
      .spyOn(cvService, 'useGetRiskCategoryForCustomHealthMetric')
      .mockReturnValue({ data: { data: [] }, refetch: jest.fn() } as any)
  })

  test('should render DynatraceMetricPacksToService', async () => {
    render(<WrapperComponent {...DynatraceHealthSourcePropsMock} />)
    expect(dynatraceMetricPacksMappingRenderMock).toHaveBeenCalledTimes(1)
  })

  test('should not call onSubmitDynatraceData, if the form has errors', async () => {
    const onSubmitDynatraceDataMock = jest.spyOn(DynatraceHealthSourceUtils, 'onSubmitDynatraceData')
    const { getByTestId } = render(<WrapperComponent {...DynatraceHealthSourcePropsMock} />)
    // As it has form errors, the onSubmitDynatraceDataMock will not be called
    expect(onSubmitDynatraceDataMock).toHaveBeenCalledTimes(0)
    act(() => {
      fireEvent.click(getByTestId('triggerPreviousButtonMock'))
    })
  })

  test('should be able to delete all metrics and add again with default name', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DynatraceHealthSource
          dynatraceFormData={MockDynatraceMetricDataWithCustomMetric}
          onSubmit={jest.fn()}
          onPrevious={jest.fn()}
          connectorIdentifier="dynatrace"
        />
      </TestWrapper>
    )
    expect(getByText('Dynatrace metric custom')).toBeInTheDocument()
    userEvent.click(container.querySelector('[data-icon="main-delete"]')!)
    expect(getByText('cv.healthSource.connectors.customMetrics')).toBeInTheDocument()
    userEvent.click(getByText('cv.monitoringSources.addMetric'))
    expect(getByText('cv.healthSource.connectors.Dynatrace.defaultMetricName')).toBeInTheDocument()
  })

  describe('Metric thresholds', () => {
    test('should render metric thresholds', async () => {
      render(
        <TestWrapper>
          <DynatraceHealthSource
            dynatraceFormData={MockDynatraceMetricDataWithCustomMetric}
            onSubmit={jest.fn()}
            onPrevious={jest.fn()}
            connectorIdentifier="dynatrace"
          />
        </TestWrapper>
      )
      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (0)')).toBeInTheDocument()
      expect(screen.getByText('cv.monitoringSources.appD.failFastThresholds (0)')).toBeInTheDocument()

      const addButton = screen.getByTestId('AddThresholdButton')

      expect(addButton).toBeInTheDocument()

      fireEvent.click(addButton)

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (1)')).toBeInTheDocument()
    })
    test('should not render metric thresholds, if feature flag is turned off', async () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)
      render(
        <TestWrapper>
          <DynatraceHealthSource
            dynatraceFormData={MockDynatraceMetricDataWithCustomMetric}
            onSubmit={jest.fn()}
            onPrevious={jest.fn()}
            connectorIdentifier="dynatrace"
          />
        </TestWrapper>
      )
      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()
    })
  })
})
