/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import moment from 'moment'
import { Link, useParams } from 'react-router-dom'
import { Card, Container, Heading, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SLOType } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.constants'
import { PeriodTypeEnum } from '@cv/pages/slos/common/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy.constants'
import type { KeyValuePairProps, ServiceDetailsProps } from '../DetailsPanel.types'
import { getEvaluationTitleAndValue } from '../DetailsPanel.utils'
import css from '../DetailsPanel.module.scss'

export const KeyValuePair: React.FC<KeyValuePairProps> = ({ label, value }) => {
  return (
    <Container>
      <Text data-testid={label} font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_400}>
        {label}
      </Text>
      <Text data-testid={`${label}_value`} font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_800}>
        {value}
      </Text>
    </Container>
  )
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ sloDashboardWidget }) => {
  const { getString } = useStrings()
  const { SRM_ENABLE_REQUEST_SLO: enableRequestSLO } = useFeatureFlags()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { sloType } = useQueryParams<{ sloType?: string }>()
  const isCompositeSLO = sloType === SLOType.COMPOSITE
  const getDate = (time: number): string => moment(new Date(time)).format('lll')
  const monitoredServicePathname = routes.toCVAddMonitoringServicesEdit({
    accountId,
    orgIdentifier,
    projectIdentifier,
    identifier: sloDashboardWidget.monitoredServiceIdentifier
  })

  const { title: Evaluationlabel, value: EvaluationValue } = useMemo(
    () => getEvaluationTitleAndValue(getString, sloDashboardWidget, enableRequestSLO),
    [sloDashboardWidget.type, enableRequestSLO]
  )

  return (
    <Card className={css.serviceDetailsCard}>
      <Text font={{ variation: FontVariation.CARD_TITLE }} color={Color.GREY_800} padding={{ bottom: 'medium' }}>
        {getString('cv.serviceDetails')}
      </Text>
      <Layout.Horizontal spacing="xlarge">
        {!isCompositeSLO && (
          <Container>
            <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_400}>
              {getString('connectors.cdng.monitoredService.label')}
            </Text>
            <Link to={monitoredServicePathname}>
              <Text
                font={{ variation: FontVariation.SMALL_BOLD }}
                color={Color.PRIMARY_7}
                data-testid="sloDashboardWidgetServiceName"
              >
                {sloDashboardWidget.serviceName}
                <Text
                  tag="span"
                  color={Color.GREY_800}
                  padding={{ left: 'xsmall' }}
                  data-testid="sloDashboardWidgetEnvironmentName"
                >
                  /{sloDashboardWidget.environmentName}
                </Text>
              </Text>
            </Link>
          </Container>
        )}

        {<KeyValuePair label={Evaluationlabel} value={EvaluationValue} />}
        {!isCompositeSLO && sloDashboardWidget?.healthSourceName && (
          <KeyValuePair
            label={getString('pipeline.verification.healthSourceLabel')}
            value={sloDashboardWidget.healthSourceName}
          />
        )}
        <KeyValuePair
          label={getString('cv.slos.sloTargetAndBudget.periodType')}
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
          <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_800} data-testid={'periodLength'}>
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
          <Heading
            level={2}
            color={Color.GREY_800}
            font={{ variation: FontVariation.H4 }}
            data-testid="errorBudgetRemainingPercentage"
          >
            {Number(sloDashboardWidget.errorBudgetRemainingPercentage).toFixed(2)}%
          </Heading>
        </Container>
        <Container width={140} padding="small" background={Color.GREY_100} style={{ borderRadius: '8px' }}>
          <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_600}>
            {getString('cv.timeRemaining')}
          </Text>
          <Heading
            inline
            level={2}
            color={Color.GREY_800}
            font={{ variation: FontVariation.H4 }}
            data-testid="timeRemainingDaysValue"
          >
            {sloDashboardWidget.timeRemainingDays}
          </Heading>
          &nbsp;
          <Text inline font={{ variation: FontVariation.FORM_HELP }} data-testid="timeRemainingDaysLabel">
            {Number(sloDashboardWidget.timeRemainingDays) < 2 ? getString('cv.day') : getString('cv.days')}
          </Text>
        </Container>
      </Layout.Horizontal>
    </Card>
  )
}

export default ServiceDetails
