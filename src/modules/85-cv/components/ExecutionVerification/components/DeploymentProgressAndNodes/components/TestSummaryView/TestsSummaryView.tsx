/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@harness/uicore'
import moment from 'moment'
import { Link, useParams } from 'react-router-dom'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import type { VerificationOverview } from 'services/cv'
import BaselineStatusMessage from './components/BaselineStatusMessage'
import { defaultDateFormat } from '../../DeploymentProgressAndNodes.constants'
import { canShowRedirectLink, getTagName } from './TestsSummaryView.utils'
import styles from './TestsSummaryView.module.scss'

export interface TestsSummaryViewProps {
  baselineTestName: string
  baselineTestDate: number
  currentTestName: string
  currentTestDate: number
  isConsoleView?: boolean
  data: VerificationOverview | null
  activityId?: string
}

export default function TestsSummaryView({
  baselineTestName,
  baselineTestDate,
  currentTestName,
  currentTestDate,
  isConsoleView,
  data,
  activityId
}: TestsSummaryViewProps): JSX.Element {
  const { getString } = useStrings()

  const { accountId, orgIdentifier, projectIdentifier, pipelineIdentifier } = useParams<PipelinePathProps>()

  const { baselineOverview } = data || {}

  const isBaselineEnabled = useFeatureFlag(FeatureFlag.SRM_ENABLE_BASELINE_BASED_VERIFICATION)

  const handleRedirect = (): string => {
    return routes.toExecutionPipelineView({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId,
      module: 'cd',
      executionIdentifier: baselineOverview?.planExecutionId || '',
      source: 'executions'
    })
  }

  const showRedirectLink = canShowRedirectLink({
    isBaselineEnabled,
    baselineVerificationJobInstanceId: data?.baselineOverview?.baselineVerificationJobInstanceId,
    activityId
  })

  return (
    <Layout.Vertical>
      {isBaselineEnabled && <BaselineStatusMessage data={data} />}
      <Container margin={{ top: 'medium' }} className={cx({ [styles.testsSummaryView]: !isConsoleView })}>
        <Container className={styles.baselineTest}>
          {showRedirectLink && (
            <Link target="_blank" to={handleRedirect()}>
              <Text
                className={cx(styles.mainLabel, styles.redirectLink)}
                rightIcon="share"
                rightIconProps={{ size: 12, margin: { bottom: 'xsmall' } }}
              >
                {getString('pipeline.verification.baselineTest')}
              </Text>
            </Link>
          )}

          {!showRedirectLink && (
            <Text className={cx(styles.mainLabel)}>{getString('pipeline.verification.baselineTest')}</Text>
          )}

          <Text className={styles.subTitle}>{getString('connectors.cdng.artifactTag')}</Text>
          <Text data-testid="baselineTestName" lineClamp={1} margin={{ bottom: 'small' }}>
            {getTagName(baselineTestName)}
          </Text>

          <Text className={styles.subTitle}>{getString('pipeline.verification.testsRan')}:</Text>
          <Text>{(baselineTestDate && moment(baselineTestDate).format(defaultDateFormat)) || '-'}</Text>
        </Container>

        <Container>
          <Text className={styles.mainLabel}>{getString('pipeline.verification.currentTest')}</Text>

          <Text className={styles.subTitle}>{getString('connectors.cdng.artifactTag')}</Text>
          <Text data-testid="currentTestName" lineClamp={1} margin={{ bottom: 'small' }}>
            {getTagName(currentTestName)}
          </Text>

          <Text className={styles.subTitle}>{getString('pipeline.verification.testsRan')}:</Text>
          <Text>{(currentTestDate && moment(currentTestDate).format(defaultDateFormat)) || '-'}</Text>
        </Container>
      </Container>
    </Layout.Vertical>
  )
}
