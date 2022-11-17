/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import { Container, Layout, Text, Icon } from '@harness/uicore'
import { FontVariation, Color, Intent } from '@harness/design-system'
import { useGetMonitoredServiceScores } from 'services/cv'
import { RiskValues, getErrorMessage } from '@cv/utils/CommonUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { RiskTagWithLabel } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.utils'
import { StringKeys, useStrings } from 'framework/strings'
import ErrorTooltip from '@common/components/ErrorTooltip/ErrorTooltip'
import type { HealthScoreCardProps } from './HealthScoreCard.types'
import css from './HealthScoreCard.module.scss'

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ monitoredServiceIdentifier, monitoredServiceLoading }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & { identifier: string }>()

  const queryParams = {
    accountId,
    orgIdentifier,
    projectIdentifier
  }

  const {
    data: healthScoreData,
    refetch: fetchHealthScore,
    loading,
    error
  } = useGetMonitoredServiceScores({
    identifier: '',
    lazy: true
  })

  useEffect(() => {
    if (monitoredServiceIdentifier) {
      fetchHealthScore({
        pathParams: {
          identifier: monitoredServiceIdentifier
        },
        queryParams
      })
    }
  }, [monitoredServiceIdentifier])

  if (loading || monitoredServiceLoading) {
    return (
      <Layout.Horizontal spacing="small" flex data-testid="loading-healthScore">
        <Container height={30} width={30} className={Classes.SKELETON} />
        <Container height={15} width={90} className={Classes.SKELETON} />
        <Container height={30} width={30} className={Classes.SKELETON} />
        <Container height={15} width={122} className={Classes.SKELETON} />
      </Layout.Horizontal>
    )
  }

  if (error) {
    return (
      <Layout.Horizontal flex spacing="xsmall">
        <Icon name="warning-sign" size={10} intent={Intent.DANGER} />
        <Text color={Color.GREY_500} font={{ variation: FontVariation.TINY_SEMI }}>
          {getString('cv.monitoredServices.failedToFetchHealthScore')}
        </Text>
        <ErrorTooltip message={getErrorMessage(error)} onRetry={() => fetchHealthScore({ queryParams })} width={400}>
          <Text
            inline
            font={{ variation: FontVariation.TINY_SEMI }}
            color={Color.PRIMARY_7}
            rightIcon="chevron-right"
            rightIconProps={{ color: Color.PRIMARY_7, size: 10 }}
            className={css.textLink}
          >
            {getString('common.seeDetails')}
          </Text>
        </ErrorTooltip>
      </Layout.Horizontal>
    )
  }

  const { currentHealthScore, dependentHealthScore } = healthScoreData?.data ?? {}

  const NoHealthScoreData = (): JSX.Element | null => {
    let label: StringKeys | undefined
    const noServiceHealthData = !currentHealthScore || currentHealthScore.riskStatus === RiskValues.NO_DATA
    const noDependencyHealthData = !dependentHealthScore || dependentHealthScore?.riskStatus === RiskValues.NO_DATA

    if (noServiceHealthData && noDependencyHealthData) {
      label = 'cv.monitoredServices.healthScoreDataNotAvailable'
    } else if (noServiceHealthData) {
      label = 'cv.monitoredServices.serviceHealthScoreDataNotAvailable'
    } else if (noDependencyHealthData) {
      label = 'cv.monitoredServices.dependencyHealthScoreDataNotAvailable'
    }

    if (label) {
      return (
        <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500} flex>
          {getString(label)}
        </Text>
      )
    }

    return null
  }

  return (
    <Layout.Horizontal spacing="small">
      <NoHealthScoreData />
      <RiskTagWithLabel
        riskData={currentHealthScore}
        label={getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
      />
      <RiskTagWithLabel riskData={dependentHealthScore} label={getString('cv.monitoredServices.dependencyHealth')} />
    </Layout.Horizontal>
  )
}

export default HealthScoreCard
