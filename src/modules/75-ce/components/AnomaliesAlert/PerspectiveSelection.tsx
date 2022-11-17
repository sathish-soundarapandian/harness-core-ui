/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, StepProps, Text, ButtonVariation, Button, Icon, FormInput, SelectOption } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import type { channels } from '@ce/constants'
import css from './AnomaliesAlertDialog.module.scss'

interface AlertsOverviewProps {
  name: string
  onClose: () => void
  items: SelectOption[]
  formikProps: FormikProps<NotificationValues>
}

interface StepData {
  name: string
}

interface Alerts {
  channelName?: channels
  channelUrl?: string | string[]
}

interface NotificationValues {
  perspective: string
  alertList: Alerts[]
}

const PerspectiveSelection: React.FC<StepProps<StepData> & AlertsOverviewProps> = props => {
  const { getString } = useStrings()

  return (
    <React.Fragment>
      <Icon name="cross" size={16} onClick={() => props.onClose()} className={css.closeBtn} />
      <Layout.Vertical spacing="xxlarge">
        <Text color={Color.BLACK} font={{ variation: FontVariation.H5 }}>
          {props.name}
        </Text>
        <FormInput.Select
          items={props.items}
          className={css.perspectiveSelection}
          name={'perspective'}
          label={getString('ce.anomalyDetection.notificationAlerts.selectPerspective')}
          placeholder={getString('ce.anomalyDetection.notificationAlerts.selectPerspective')}
        />
      </Layout.Vertical>
      <Button
        className={css.actionBtn}
        rightIcon="chevron-right"
        variation={ButtonVariation.PRIMARY}
        onClick={() => props.nextStep?.({ name: props.name || '' })}
        text={getString('saveAndContinue')}
        disabled={!props.formikProps.values.perspective}
      />
    </React.Fragment>
  )
}

export default PerspectiveSelection
