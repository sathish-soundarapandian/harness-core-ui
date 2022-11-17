/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Icon, Text, Container, Layout, Heading, timeToDisplayText, HarnessDocTooltip } from '@harness/uicore'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { Duration } from '@common/exports'
import { renderFailureRate } from './TestsUtils'
import css from './BuildTests.module.scss'

interface TestsOverviewProps {
  totalTests: number
  skippedTests: number
  failedTests?: number // when provided, no TI
  timeSavedMS?: number
  durationMS?: number
  testsCountDiff?: number
}

const now = Date.now()

export function TestsOverview({
  totalTests,
  skippedTests,
  failedTests,
  timeSavedMS,
  durationMS,
  testsCountDiff
}: TestsOverviewProps): React.ReactElement {
  const { getString } = useStrings()

  const selectedTests = totalTests - skippedTests
  const failureRate = failedTests && failedTests / (totalTests || 1)
  const failureRateDisplay =
    typeof failureRate !== 'undefined' ? (failureRate && renderFailureRate(failureRate)) + `%` : undefined

  const timeSavedToDisplay: string = useMemo(() => {
    if (!timeSavedMS) {
      return '0'
    }

    const timeToDisplay = timeToDisplayText(timeSavedMS)

    // Checking if the value contains hours, if yes, then we need to remove ms and s. If no, then only ms
    if (/(\d+h)/.test(timeToDisplay)) {
      return timeToDisplay
        .replace(/(\d+ms)$/, '')
        .trim()
        .replace(/(\d+s)$/, '')
    } else {
      return timeToDisplay.replace(/(\d+ms)$/, '')
    }
  }, [timeSavedMS])

  return (
    <div className={cx(css.widgetWrapper, css.overview)}>
      <Container
        flex={{ justifyContent: 'flex-start' }}
        margin={{ bottom: 'xsmall' }}
        style={{ height: 32, flexShrink: 0 }}
      >
        <Heading level={6} style={{ fontWeight: 600 }} color={Color.GREY_600} margin={{ right: 'medium' }}>
          {getString('pipeline.testsReports.executionOverview')}
          <HarnessDocTooltip tooltipId="testExecutionOverview" useStandAlone={true} />
        </Heading>
      </Container>
      <Container height="100%">
        <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium' }}>
          <Text
            className={css.stats}
            padding="medium"
            color={Color.GREY_700}
            style={{ backgroundColor: 'var(--white)' }}
          >
            <Text className={cx(css.statsTitle)} margin={{ bottom: 'large' }}>
              {getString('pipeline.testsReports.totalTests')}
            </Text>
            <span className={cx(css.statsNumber, css.row)}>
              {totalTests}
              {typeof testsCountDiff !== 'undefined' ? (
                <span className={cx(css.diff, { [css.diffNegative]: testsCountDiff < 0 })}>
                  <Icon name={testsCountDiff < 0 ? 'arrow-down' : 'arrow-up'} size={11} />
                  &nbsp;
                  {Math.abs(testsCountDiff)}%
                </span>
              ) : null}
            </span>
          </Text>
          {typeof durationMS !== 'undefined' ? (
            <Text
              className={css.stats}
              padding="medium"
              color={Color.GREY_700}
              style={{ backgroundColor: 'var(--white)' }}
            >
              <Text className={cx(css.statsTitle)} margin={{ bottom: 'large' }}>
                {getString('pipeline.duration')}
              </Text>
              <Duration
                color={Color.GREY_700}
                durationText=" "
                startTime={now - durationMS}
                endTime={now}
                style={{
                  fontSize: '32px',
                  fontWeight: 600
                }}
              ></Duration>
            </Text>
          ) : null}
        </Layout.Horizontal>
        <Layout.Horizontal spacing="medium">
          {typeof failedTests !== 'undefined' ? (
            <Text
              className={css.stats}
              padding="medium"
              color={Color.GREY_700}
              style={{ position: 'relative', backgroundColor: 'var(--white)' }}
            >
              <Text className={cx(css.statsTitle)} margin={{ bottom: 'large', right: 'small' }}>
                {getString('pipeline.testsReports.failedTests')}
              </Text>
              <span className={cx(css.statsNumber, failedTests > 0 && css.failedNumber)}>{failedTests}</span>
            </Text>
          ) : (
            <Text
              className={css.stats}
              padding="medium"
              color={Color.GREY_700}
              style={{ position: 'relative', backgroundColor: 'var(--white)' }}
            >
              <Text className={cx(css.statsTitle)} margin={{ bottom: 'large', right: 'small' }}>
                {getString('pipeline.testsReports.numberOfSelectedTests')}
              </Text>
              <span className={cx(css.statsNumber)}>{selectedTests}</span>
              <div className={css.linesWrapper}>
                {totalTests > 0 && (
                  <div
                    className={cx(css.line, css.selected)}
                    style={{ height: `${selectedTests / (totalTests / 100)}%` }}
                  ></div>
                )}
                {skippedTests > 0 && (
                  <div className={css.line} style={{ height: `${skippedTests / (totalTests / 100)}%` }}></div>
                )}
              </div>
            </Text>
          )}
          {typeof failureRateDisplay !== 'undefined' ? (
            <Text
              className={css.stats}
              padding="medium"
              color={Color.GREY_700}
              style={{ position: 'relative', backgroundColor: 'var(--white)' }}
            >
              <Text className={cx(css.statsTitle)} margin={{ bottom: 'large', right: 'small' }}>
                {getString('common.failureRate')}
              </Text>
              <span className={cx(css.statsNumber)}>{failureRateDisplay}</span>
            </Text>
          ) : (
            <Text className={cx(css.stats, css.timeSaved)} padding="medium" color={Color.WHITE}>
              <Text className={cx(css.statsTitle)} color={Color.WHITE} margin={{ bottom: 'large' }}>
                {getString('pipeline.testsReports.timeSaved')}
              </Text>
              <span className={cx(css.statsNumber)}>{timeSavedToDisplay}</span>
            </Text>
          )}
        </Layout.Horizontal>
      </Container>
    </div>
  )
}
