/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Button, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ValidationStatusProps } from './ValidationStatus.types'
import { StatusOfValidation } from './ValidationStatus.constants'
import css from './ValidationStatus.module.scss'

export default function ValidationStatus(props: ValidationStatusProps): JSX.Element {
  const { onClick, onRetry, validationStatus, textToDisplay } = props
  const { getString } = useStrings()

  switch (validationStatus) {
    case StatusOfValidation.IN_PROGRESS:
      return (
        <Text icon="steps-spinner" iconProps={{ size: 16 }}>
          {textToDisplay || getString('cv.monitoringSources.appD.verificationsInProgress')}
        </Text>
      )
    case StatusOfValidation.NO_DATA:
      return (
        <Text icon="issue" iconProps={{ size: 16 }} intent="none" className={css.validationButton} onClick={onClick}>
          {textToDisplay || getString('cv.monitoringSources.appD.noData')}
        </Text>
      )
    case StatusOfValidation.SUCCESS:
      return (
        <Text
          icon="tick"
          iconProps={{ size: 16, color: Color.GREEN_500 }}
          className={css.validationButton}
          onClick={onClick}
        >
          {textToDisplay || getString('cv.monitoringSources.appD.validationsPassed')}
        </Text>
      )
    case StatusOfValidation.ERROR:
      return (
        <Layout.Horizontal spacing="small" className={css.errorStatus}>
          <Text
            icon="warning-sign"
            iconProps={{ size: 16, color: Color.RED_500 }}
            intent="danger"
            lineClamp={3}
            className={css.validationButton}
            onClick={onClick}
          >
            {textToDisplay || getString('cv.monitoringSources.appD.validationsFailed')}
          </Text>
          <Button
            icon="refresh"
            iconProps={{ size: 12 }}
            color={Color.BLUE_500}
            text={getString('retry')}
            onClick={onRetry}
          />
        </Layout.Horizontal>
      )
    default:
      return <Container />
  }
}
