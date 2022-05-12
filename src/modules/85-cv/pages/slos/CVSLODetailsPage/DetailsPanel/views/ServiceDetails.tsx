/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Link, useParams } from 'react-router-dom'
import { Card, Color, Container, FontVariation, Heading, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PeriodTypeEnum } from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy.constants'
import { SLITypeEnum } from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLI/SLI.constants'
import type { KeyValuePairProps, ServiceDetailsProps } from '../DetailsPanel.types'
import css from '../DetailsPanel.module.scss'

const KeyValuePair: React.FC<KeyValuePairProps> = ({ keyText, value }) => {
  return (
    <Container>
      <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_400}>
        {keyText}
      </Text>
      <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_800}>
        {value}
      </Text>
    </Container>
  )
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ sloDashboardWidget }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const getDate = (time: number): string => moment(new Date(time)).format('lll')
  const monitoredServicePathname = routes.toCVAddMonitoringServicesEdit({
    accountId,
    orgIdentifier,
    projectIdentifier,
    identifier: sloDashboardWidget.monitoredServiceIdentifier
  })

  return (
    <Card className={css.serviceDetailsCard}>
      <Text font={{ variation: FontVariation.CARD_TITLE }} color={Color.GREY_800} padding={{ bottom: 'medium' }}>
        {getString('cv.serviceDetails')}
      </Text>
      <Layout.Horizontal spacing="xlarge">
        <Container>
          <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_400}>
            {getString('connectors.cdng.monitoredService.label')}
          </Text>
          <Link to={monitoredServicePathname}>
            <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.PRIMARY_7}>
              {sloDashboardWidget.serviceName}
              <Text tag="span" color={Color.GREY_800} padding={{ left: 'xsmall' }}>
                /{sloDashboardWidget.environmentName}
              </Text>
            </Text>
          </Link>
        </Container>

        <KeyValuePair
          keyText={getString('cv.slos.sliType')}
          value={getString(
            sloDashboardWidget.type === SLITypeEnum.AVAILABILITY
              ? 'cv.slos.slis.type.availability'
              : 'cv.slos.slis.type.latency'
          )}
        />
        <KeyValuePair keyText={getString('cv.healthScore')} value={sloDashboardWidget.healthSourceName} />
        <KeyValuePair
          keyText={getString('cv.slos.sloTargetAndBudget.periodType')}
          value={getString(
            sloDashboardWidget.sloTargetType === PeriodTypeEnum.ROLLING
              ? 'cv.slos.sloTargetAndBudget.periodTypeOptions.rolling'
              : 'cv.slos.sloTargetAndBudget.periodTypeOptions.calendar'
          )}
        />

        <Container style={{ flexGrow: 1 }}>
          <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_400}>
            {getString('cv.periodLength')}
          </Text>
          <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_800}>
            {sloDashboardWidget.currentPeriodLengthDays}
            &nbsp;
            {Number(sloDashboardWidget.currentPeriodLengthDays) < 2 ? getString('cv.day') : getString('cv.days')}
            &nbsp;
            <Text tag="span" color={Color.GREY_600} font={{ variation: FontVariation.TINY_SEMI }}>
              ({getDate(sloDashboardWidget.currentPeriodStartTime)} - {getDate(sloDashboardWidget.currentPeriodEndTime)}
              )
            </Text>
          </Text>
        </Container>

        <Container width={140} padding="small" background={Color.GREY_100} style={{ borderRadius: '8px' }}>
          <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_600}>
            {getString('cv.errorBudgetRemaining')}
          </Text>
          <Heading level={2} color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
            {Number(sloDashboardWidget.errorBudgetRemainingPercentage).toFixed(2)}%
          </Heading>
        </Container>
        <Container width={140} padding="small" background={Color.GREY_100} style={{ borderRadius: '8px' }}>
          <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_600}>
            {getString('cv.timeRemaining')}
          </Text>
          <Heading inline level={2} color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
            {sloDashboardWidget.timeRemainingDays}
          </Heading>
          &nbsp;
          <Text inline font={{ variation: FontVariation.FORM_HELP }}>
            {Number(sloDashboardWidget.timeRemainingDays) < 2 ? getString('cv.day') : getString('cv.days')}
          </Text>
        </Container>
      </Layout.Horizontal>
    </Card>
  )
}

export default ServiceDetails
