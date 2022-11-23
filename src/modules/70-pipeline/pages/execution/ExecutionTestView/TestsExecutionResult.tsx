/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Heading, Text, Container, HarnessDocTooltip } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './BuildTests.module.scss'

interface TestsExecutionResultProps {
  totalTests: number
  failedTests: number
  successfulTests: number
  skippedTests: number
}

const NUMBER_OF_ITEMS_TO_FILL_THE_SPACE = 330

export function TestsExecutionResult({
  totalTests,
  failedTests,
  successfulTests,
  skippedTests
}: TestsExecutionResultProps): React.ReactElement {
  const { getString } = useStrings()

  const amountOfEmptyItemsToRender = NUMBER_OF_ITEMS_TO_FILL_THE_SPACE - totalTests

  return (
    <div className={cx(css.widgetWrapper, css.executionResult)}>
      <Container flex={{ justifyContent: 'flex-start' }} margin={{ bottom: 'xsmall' }}>
        <Heading
          data-name="test-execution-result-label"
          level={6}
          style={{ fontWeight: 600, marginBottom: 'var(--spacing-3)' }}
          color={Color.GREY_600}
        >
          {getString('pipeline.testsReports.resultLabel')}
          <HarnessDocTooltip tooltipId="testExecutionResult" useStandAlone={true} />
        </Heading>
      </Container>

      <Container className={css.widget} height="100%" padding="medium">
        <Container flex margin={{ bottom: 'small' }}>
          <Text font={{ weight: 'semi-bold' }} style={{ fontSize: 10 }}>
            {getString('pipeline.testsReports.totalWithColon')} {totalTests} |{' '}
            {getString('pipeline.testsReports.failedWithColon')} {failedTests} |{' '}
            {getString('pipeline.testsReports.successWithColon')} {successfulTests}{' '}
            {skippedTests ? `| ${getString('pipeline.testsReports.skippedWithColon')} ${skippedTests}` : null}
          </Text>
          <Container flex>
            <Text
              font={{ weight: 'semi-bold' }}
              icon="stop"
              iconProps={{ size: 16, style: { color: '#DA291D' } }}
              margin={{ right: 'xsmall' }}
              style={{ fontSize: 10 }}
            >
              {getString('failed')}
            </Text>
            <Text
              font={{ weight: 'semi-bold' }}
              icon="stop"
              iconProps={{ size: 16, style: { color: '#6BD167' } }}
              margin={{ right: 'xsmall' }}
              style={{ fontSize: 10 }}
            >
              {getString('passed')}
            </Text>
            {skippedTests ? (
              <Text
                font={{ weight: 'semi-bold' }}
                icon="stop"
                iconProps={{ size: 16, color: Color.GREY_300 }}
                style={{ fontSize: 10 }}
              >
                {getString('pipeline.testsReports.skipped')}
              </Text>
            ) : null}
          </Container>
        </Container>
        <Container className={css.graphContainer}>
          <ul className={css.graph}>
            {Array.from(Array(failedTests)).map((_, index) => (
              <li key={index} data-status="failed"></li>
            ))}
            {Array.from(Array(successfulTests)).map((_, index) => (
              <li key={index}></li>
            ))}
            {Array.from(Array(skippedTests)).map((_, index) => (
              <li key={index} data-status="skipped"></li>
            ))}
            {amountOfEmptyItemsToRender > -1 &&
              // eslint-disable-next-line prefer-spread
              Array.apply(null, Array(amountOfEmptyItemsToRender)).map((_item, index) => (
                <li data-status={'empty'} key={index} />
              ))}
          </ul>
        </Container>
      </Container>
    </div>
  )
}
