/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Container, Heading, Page, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useGetSLODetails } from 'services/cv'
import { useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ChangesSourceCard from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesSourceCard/ChangesSourceCard'
import ChangesTable from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/ChangesTable'
import ServiceDetails from './views/ServiceDetails'
import type { DetailsPanelProps } from './DetailsPanel.types'
import SLOCardContent from '../../SLOCard/SLOCardContent'
import CompositeSLOConsumption from './views/CompositeSLOConsumption/CompositeSLOConsumption'
import { SLOType } from '../../components/CVCreateSLOV2/CVCreateSLOV2.constants'
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
  const { sloType } = useQueryParams<{ sloType?: string }>()
  const isCompositeSLO = sloType === SLOType.COMPOSITE
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId
  const { currentPeriodStartTime = 0, currentPeriodEndTime = 0, monitoredServiceDetails } = sloDashboardWidget ?? {}
  const [chartTimeRange, setChartTimeRange] = useState<{ startTime: number; endTime: number }>()
  const [sliderTimeRange, setSliderTimeRange] = useState<{ startTime: number; endTime: number }>()

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
        <Container padding="xlarge">
          <ServiceDetails sloDashboardWidget={sloDashboardWidget} />
          <SLOCardContent
            isCardView
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
              <CompositeSLOConsumption startTime={consumptionStartTime} endTime={consumptionEndTime} />
              <Container padding={{ bottom: 'xlarge' }} />
            </>
          )}
          {!isAccountLevel && (
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
                monitoredServiceIdentifiers={
                  sloDashboardWidget?.monitoredServiceDetails?.map(
                    serviceDetails => serviceDetails.monitoredServiceIdentifier || ''
                  ) || []
                }
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
          )}
        </Container>
      )}
    </Page.Body>
  )
}

export default DetailsPanel
