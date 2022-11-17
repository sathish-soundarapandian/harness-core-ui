/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import css from './TestConnectionWidget.module.scss'

interface TestConnectionWidgetProps {
  testStatus: TestStatus
  onTest: () => Promise<void>
}

export enum TestStatus {
  NOT_INITIATED,
  IN_PROGRESS,
  FAILED,
  SUCCESS
}

export const TestConnectionWidget: React.FC<TestConnectionWidgetProps> = ({ testStatus, onTest }) => {
  const { getString } = useStrings()

  switch (testStatus) {
    case TestStatus.NOT_INITIATED:
      return (
        <Layout.Horizontal spacing="small" flex>
          <Icon name="test-connection" />
          <Text className={css.test} color={Color.BLUE_500} onClick={() => onTest()}>
            {getString('common.labelTestConnection')}
          </Text>
        </Layout.Horizontal>
      )
    case TestStatus.IN_PROGRESS:
      return (
        <Layout.Horizontal spacing="small" flex>
          <Icon name="steps-spinner" color={Color.PRIMARY_7} />
          <Text>{getString('common.test.inProgress')}</Text>
        </Layout.Horizontal>
      )
    case TestStatus.FAILED:
      return (
        <Layout.Horizontal spacing="small" flex>
          <Icon name="circle-cross" color={Color.RED_450} />
          <Text>{getString('common.test.connectionFailed')}</Text>
          <Icon name="test-connection" />
          <Text className={css.test} color={Color.BLUE_500} onClick={() => onTest()}>
            {getString('common.test.retest')}
          </Text>
        </Layout.Horizontal>
      )
    case TestStatus.SUCCESS:
      return (
        <Layout.Horizontal spacing="small" flex>
          <Icon name="command-artifact-check" color={Color.GREEN_450} />
          <Text>{getString('common.test.connectionSuccessful')}</Text>
        </Layout.Horizontal>
      )
    default:
      null
  }
  return null
}
