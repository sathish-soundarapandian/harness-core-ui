/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Text, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { MonitoredServiceDTO } from 'services/cv'
import { MonitoredServiceType } from '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/MonitoredServiceOverview.constants'
import css from './MonitoredServiceCategory.module.scss'

export default function MonitoredServiceCategory({
  type,
  abbrText,
  verticalAlign
}: {
  type?: MonitoredServiceDTO['type']
  abbrText?: boolean
  verticalAlign?: boolean
}): JSX.Element {
  switch (type) {
    case 'Infrastructure':
      return (
        <Container
          className={cx(
            css.monitoredServiceCategory,
            verticalAlign && css.monitoredServiceCategoryVertical,
            css.infrastructure
          )}
        >
          <Text
            className={css.categoryName}
            iconProps={{ size: verticalAlign ? 13 : 18, color: Color.PURPLE_500 }}
            icon="infrastructure"
          >
            {abbrText ? MonitoredServiceType.INFRA : MonitoredServiceType.INFRASTRUCTURE}
          </Text>
        </Container>
      )
    case 'Application':
      return (
        <Container
          className={cx(
            css.monitoredServiceCategory,
            verticalAlign && css.monitoredServiceCategoryVertical,
            css.application
          )}
        >
          <Text className={css.categoryName} iconProps={{ size: 13, color: Color.PRIMARY_8 }} icon="dashboard">
            {abbrText ? MonitoredServiceType.APP : MonitoredServiceType.APPLICATION}
          </Text>
        </Container>
      )
    default:
      return <Container />
  }
}
