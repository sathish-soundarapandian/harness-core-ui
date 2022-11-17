/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Container, Heading, Button, Text, Switch } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { TestsCoverageItem } from './TestsCoverageItem'
import css from './BuildTests.module.scss'

const mockItems = [
  {
    name: 'FilesUtils.java',
    coverage: 'passed',
    commitId: '438b6c2'
  },
  {
    name: 'User.toml',
    coverage: 'passed',
    commitId: '438b6c2'
  },
  {
    name: 'Migration.java',
    coverage: 'passed',
    commitId: '438b6c2'
  },
  {
    name: 'EncryptKeys.java',
    coverage: 'failed',
    commitId: '438b6c2'
  },
  {
    name: 'Keys.java',
    coverage: 'passed',
    commitId: '438b6c2'
  },
  {
    name: 'Mod.java',
    coverage: 'failed',
    commitId: '438b6c2'
  },
  {
    name: 'WorkerManager.java',
    coverage: 'failed',
    commitId: '438b6c2'
  }
]

export function TestsCoverage(): React.ReactElement {
  const { getString } = useStrings()

  const [showOnlyUncoveredMethods, setShowOnlyUncoveredMethods] = useState(false)

  return (
    <div className={cx(css.widgetWrapper, css.coverage)}>
      <Container flex={{ justifyContent: 'flex-start' }} margin={{ bottom: 'xsmall' }}>
        <Heading level={2} font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
          {getString('pipeline.testsReports.coverage')}
        </Heading>
        <Button
          icon="question"
          minimal
          tooltip={getString('pipeline.testsReports.coverageInfo')}
          iconProps={{ size: 14 }}
          margin={{ left: 'xsmall' }}
        />
      </Container>
      <Container className={css.widget} padding="medium">
        <Switch
          label={getString('pipeline.testsReports.onlyUncoveredFiles')}
          checked={showOnlyUncoveredMethods}
          onChange={e => setShowOnlyUncoveredMethods(e.currentTarget.checked)}
          margin={{ bottom: 'large' }}
        />
        <Container flex padding={{ left: 'medium', right: 'xxlarge' }} margin={{ bottom: 'medium' }}>
          <Text font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
            {getString('pipeline.testsReports.filename')}
          </Text>
          <Text font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
            {getString('pipeline.testsReports.commitId')}
          </Text>
        </Container>
        <div>
          {mockItems.map(item => (
            <TestsCoverageItem data={item as any} key={item.name} />
          ))}
        </div>
      </Container>
    </div>
  )
}
