/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Text, Container, Heading, HarnessDocTooltip } from '@harness/uicore'
import { ProgressBar } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './BuildTests.module.scss'

export interface TestsSelectionBreakdownProps {
  sourceCodeChanges: number
  newTests: number
  updatedTests: number
}

export function TestsSelectionBreakdown({
  sourceCodeChanges,
  newTests,
  updatedTests
}: TestsSelectionBreakdownProps): React.ReactElement {
  const { getString } = useStrings()

  const selectedTests = sourceCodeChanges + newTests + updatedTests

  return (
    <div className={cx(css.widgetWrapper, css.selectionBreakdown)}>
      <Container flex={{ justifyContent: 'flex-start' }} margin={{ bottom: 'xsmall' }}>
        <Heading
          data-name="test-execution-selection-breakdown"
          level={6}
          style={{ fontWeight: 600, marginBottom: 'var(--spacing-3)' }}
          color={Color.GREY_600}
        >
          {getString('pipeline.testsReports.selectionBreakdown')}
          <HarnessDocTooltip tooltipId="testSelectionBreakdown" useStandAlone={true} />
        </Heading>
      </Container>

      <Container className={css.widget} height="100%">
        <Container className={css.section} flex>
          <Text className={css.type} color={Color.GREY_800}>
            <Text color={Color.GREY_800}>{getString('pipeline.testsReports.correlatedWithCodeChanges')}</Text>
            <ProgressBar
              className={css.testsSelectionBreakdown}
              animate={false}
              stripes={false}
              value={sourceCodeChanges / selectedTests}
            />
          </Text>
          <Text className={css.number} font={{ weight: 'bold' }} color={Color.GREY_800}>
            {sourceCodeChanges}
          </Text>
        </Container>

        <Container className={css.section} flex>
          <Text className={css.type} color={Color.GREY_800}>
            <Text color={Color.GREY_800}>{getString('pipeline.testsReports.newTests')}</Text>
            <ProgressBar
              className={css.testsSelectionBreakdown}
              animate={false}
              stripes={false}
              value={newTests / selectedTests}
            />
          </Text>
          <Text className={css.number} font={{ weight: 'bold' }} color={Color.GREY_800}>
            {newTests}
          </Text>
        </Container>

        <Container className={css.section} flex>
          <Text className={css.type} color={Color.GREY_800}>
            <Text color={Color.GREY_800}>{getString('pipeline.testsReports.updatedTests')}</Text>
            <ProgressBar
              className={css.testsSelectionBreakdown}
              animate={false}
              stripes={false}
              value={updatedTests / selectedTests}
            />
          </Text>
          <Text className={css.number} font={{ weight: 'bold' }} color={Color.GREY_800}>
            {updatedTests}
          </Text>
        </Container>
      </Container>
    </div>
  )
}
