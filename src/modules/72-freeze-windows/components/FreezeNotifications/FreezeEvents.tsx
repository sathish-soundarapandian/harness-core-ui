/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty, noop } from 'lodash-es'
import { Button, ButtonVariation, Formik, FormikForm, FormInput, Layout, StepProps, Text } from '@wings-software/uicore'
import { Color, Intent } from '@harness/design-system'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { FreezeNotificationRules, FreezeEvent } from '@freeze-windows/types'
import css from '@pipeline/components/Notifications/useNotificationModal.module.scss'

export enum EventType {
  FREEZE_WINDOW_ENABLED = 'FreezeWindowEnabled',
  DEPLOYMENT_REJECTED_DUE_TO_FREEZE = 'DeploymentRejectedDueToFreeze',
  TRIGGER_INVOCATION_REJECTED_DUE_TO_FREEZE = 'TriggerInvocationRejectedDueToFreeze'
}

const getEventItems = (getString: UseStringsReturn['getString']) => [
  {
    label: getString('freezeWindows.freezeNotifications.windowEnabled'),
    value: EventType.FREEZE_WINDOW_ENABLED
  },
  {
    label: getString('freezeWindows.freezeNotifications.rejectedDeployments'),
    value: EventType.DEPLOYMENT_REJECTED_DUE_TO_FREEZE
  },
  {
    label: getString('freezeWindows.freezeNotifications.rejectedInvocations'),
    value: EventType.TRIGGER_INVOCATION_REJECTED_DUE_TO_FREEZE
  }
]

interface EventsFormData {
  types: { [key: string]: any }
  [key: string]: any
}

export const FreezeEvents = ({ nextStep, prevStepData }: StepProps<FreezeNotificationRules>) => {
  const { getString } = useStrings()
  const [eventItems] = React.useState(getEventItems(getString))
  const initialValues: EventsFormData = { types: {} }
  const types: Required<EventsFormData>['types'] = {}

  prevStepData?.events?.map(event => {
    const type = event.type
    if (type) {
      types[type] = true
    }
  })

  return (
    <Layout.Vertical spacing="xxlarge" padding="small">
      <Text font="medium" color={Color.BLACK}>
        {getString('notifications.configureConditions')}
      </Text>
      <Formik<EventsFormData>
        initialValues={{ ...initialValues, types }}
        formName="freezeEvents"
        validateOnChange={false}
        onSubmit={values => {
          const events: FreezeEvent[] = Object.keys(values.types)
            .filter(function (k) {
              return values.types[k]
            })
            .map(value => {
              const dataToSubmit: FreezeEvent = { type: value as EventType }
              return dataToSubmit
            })
          nextStep?.({ ...prevStepData, events })
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Layout.Vertical spacing="medium" className={css.formContent}>
                {!isEmpty(formikProps.errors) && (
                  <Text intent={Intent.DANGER} margin={{ top: 'none', bottom: 'small' }}>
                    {getString('notifications.eventRequired')}
                  </Text>
                )}
                {eventItems.map(event => {
                  return (
                    <Layout.Vertical key={event.label}>
                      <Layout.Horizontal margin={{ bottom: 'small' }} flex>
                        <FormInput.CheckBox
                          className={formikProps.values.types[event.value] ? 'checked' : 'unchecked'}
                          name={`types.${event.value}`}
                          checked={formikProps.values.types[event.label]}
                          label={event.label}
                          padding={{ left: 'xxxlarge' }}
                          onChange={noop}
                        />
                      </Layout.Horizontal>
                    </Layout.Vertical>
                  )
                })}
              </Layout.Vertical>
              <Button
                type="submit"
                variation={ButtonVariation.PRIMARY}
                rightIcon="chevron-right"
                text={getString('continue')}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
