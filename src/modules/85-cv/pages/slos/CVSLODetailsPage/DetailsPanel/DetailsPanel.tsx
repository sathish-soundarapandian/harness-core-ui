/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Container, Heading, Page, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useGetSecondaryEvents, useGetSLODetails } from 'services/cv'
import { useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getMonitoredServiceIdentifiers } from '@cv/utils/CommonUtils'
import ChangesSourceCard from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesSourceCard/ChangesSourceCard'
import ChangesTable from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/ChangesTable'
import ServiceDetails from './views/ServiceDetails'
import type { DetailsPanelProps } from './DetailsPanel.types'
import SLOCardContent from '../../SLOCard/SLOCardContent'
import CompositeSLOConsumption from './views/CompositeSLOConsumption/CompositeSLOConsumption'
import { SLOType } from '../../components/CVCreateSLOV2/CVCreateSLOV2.constants'
import { EvaluationType } from '../../components/CVCreateSLOV2/CVCreateSLOV2.types'
import { TWENTY_FOUR_HOURS } from './DetailsPanel.constants'
import DowntimeBanner from './views/DowntimeBanner'
import SLOErrorBanner from './views/SLOErrorBanner'
import { getDownTimeStartTimeAndEndTime } from './DetailsPanel.utils'
import css from './DetailsPanel.module.scss'

const DetailsPanel: React.FC<DetailsPanelProps> = ({
  loading,
  errorMessage,
  retryOnError,
  sloDashboardWidget,
  timeRangeFilters
}) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId
  const { sloType } = useQueryParams<{ sloType?: string }>()
  const isCompositeSLO = sloType === SLOType.COMPOSITE
  const isRequestBased = sloDashboardWidget?.evaluationType === EvaluationType.REQUEST

  const {
    currentPeriodStartTime = 0,
    currentPeriodEndTime = 0,
    monitoredServiceDetails,
    calculatingSLI,
    recalculatingSLI
  } = sloDashboardWidget ?? {}
  const [chartTimeRange, setChartTimeRange] = useState<{ startTime: number; endTime: number }>()
  const [sliderTimeRange, setSliderTimeRange] = useState<{ startTime: number; endTime: number }>()
  const [showDowntimeBanner, setShowDowntimeBanner] = useState(true)

  const { startTime = currentPeriodStartTime, endTime = currentPeriodEndTime } = sliderTimeRange ?? chartTimeRange ?? {}

  const consumptionStartTime = startTime === endTime ? currentPeriodStartTime : startTime
  const consumptionEndTime = startTime === endTime ? currentPeriodEndTime : endTime

  const { data } = useGetSLODetails({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      startTime: chartTimeRange?.startTime,
      endTime: chartTimeRange?.endTime
    }
  })

  const monitoredServiceIdentifiers = useMemo(
    () => getMonitoredServiceIdentifiers(isAccountLevel, sloDashboardWidget?.monitoredServiceDetails),
    [isAccountLevel, sloDashboardWidget?.monitoredServiceDetails]
  )

  const { downtimeStartTime, downtimeEndTime } = useMemo(
    () => getDownTimeStartTimeAndEndTime(chartTimeRange, sloDashboardWidget),
    [chartTimeRange, sloDashboardWidget]
  )

  const {
    data: sloWidgetsData,
    loading: sloWidgetsDataLoading,
    refetch: fetchSecondaryEvents
  } = useGetSecondaryEvents({
    identifier,
    lazy: true
  })

  useEffect(() => {
    if (identifier && sloDashboardWidget) {
      fetchSecondaryEvents({
        queryParams: {
          startTime: downtimeStartTime,
          endTime: new Date(downtimeEndTime + TWENTY_FOUR_HOURS).getTime(),
          accountId,
          orgIdentifier,
          projectIdentifier
        }
      })
    }
  }, [identifier, downtimeEndTime, downtimeStartTime, sloDashboardWidget])

  const bannerData = useMemo(
    () => sloWidgetsData?.data?.filter(instance => (instance?.startTime || 0) > downtimeEndTime / 1000),
    [sloWidgetsData, downtimeEndTime]
  )

  const shouldRenderDowntimeBanner = showDowntimeBanner && !calculatingSLI && !recalculatingSLI
  const shouldRenderSLOErrorBanner = sloDashboardWidget?.sloError?.failedState

  return (
    <Page.Body
      loading={loading}
      error={errorMessage}
      retryOnError={retryOnError}
      noData={{
        when: () => !sloDashboardWidget
      }}
    >
      {sloDashboardWidget && (
        <>
          {shouldRenderDowntimeBanner && !!bannerData?.length && (
            <DowntimeBanner showBanner={setShowDowntimeBanner} bannerData={bannerData} />
          )}
          {shouldRenderSLOErrorBanner && <SLOErrorBanner sloError={sloDashboardWidget?.sloError} />}
          <Container padding="xlarge">
            <ServiceDetails sloDashboardWidget={sloDashboardWidget} />
            <SLOCardContent
              isCardView
              sloWidgetsData={sloWidgetsData?.data}
              sloWidgetsDataLoading={sloWidgetsDataLoading}
              fetchSecondaryEvents={fetchSecondaryEvents}
              chartTimeRange={chartTimeRange}
              setChartTimeRange={setChartTimeRange}
              sliderTimeRange={sliderTimeRange}
              setSliderTimeRange={setSliderTimeRange}
              serviceLevelObjective={sloDashboardWidget}
              filteredServiceLevelObjective={data?.data?.sloDashboardWidget}
              timeRangeFilters={timeRangeFilters}
              showUserHint
            />
            <Container padding={{ bottom: 'xlarge' }} />
            {isCompositeSLO && (
              <>
                <CompositeSLOConsumption
                  startTime={consumptionStartTime}
                  endTime={consumptionEndTime}
                  isRequestBased={isRequestBased}
                />
                <Container padding={{ bottom: 'xlarge' }} />
              </>
            )}

            <Card className={css.changesCard}>
              <Heading
                level={2}
                color={Color.GREY_800}
                padding={{ bottom: 'medium' }}
                font={{ variation: FontVariation.CARD_TITLE }}
              >
                {getString('changes')}
              </Heading>
              <ChangesSourceCard
                startTime={startTime}
                endTime={endTime}
                monitoredServiceIdentifier={sloDashboardWidget.monitoredServiceIdentifier}
                monitoredServiceIdentifiers={monitoredServiceIdentifiers}
              />
              <Text
                icon="info"
                color={Color.GREY_600}
                iconProps={{ size: 12, color: Color.PRIMARY_7 }}
                font={{ variation: FontVariation.SMALL }}
                padding={{ top: 'small', bottom: 'small' }}
              >
                {getString('cv.theTrendIsDeterminedForTheSelectedPeriodOverPeriod')}
              </Text>
              <ChangesTable
                isCardView={false}
                hasChangeSource
                startTime={startTime}
                endTime={endTime}
                monitoredServiceIdentifier={sloDashboardWidget.monitoredServiceIdentifier}
                monitoredServiceDetails={monitoredServiceDetails || []}
              />
            </Card>
          </Container>
        </>
      )}
    </Page.Body>
  )
}

export default DetailsPanel
