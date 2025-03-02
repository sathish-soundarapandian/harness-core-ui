/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Formik, FormInput, Layout, MultiSelectOption, StepProps, Text } from '@harness/uicore'
import React from 'react'
import { Color, Intent } from '@harness/design-system'
import * as Yup from 'yup'
import { Divider } from '@blueprintjs/core'
import { Form } from 'formik'
import { startCase, isEmpty, isUndefined } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { NotificationRules, PipelineEvent } from 'services/pipeline-ng'
import { ALL_STAGES, getValuesFromOptions } from '../NotificationUtils'
import css from '../useNotificationModal.module.scss'

export enum PipelineEventType {
  ALL_EVENTS = 'AllEvents',
  PipelineSuccess = 'PipelineSuccess',
  PipelineFailed = 'PipelineFailed',
  StageSuccess = 'StageSuccess',
  StageFailed = 'StageFailed',
  StageStart = 'StageStart',
  StepFailed = 'StepFailed',
  PipelineEnd = 'PipelineEnd',
  PipelineStart = 'PipelineStart'
}

const pipelineEventItems = [
  {
    label: startCase(PipelineEventType.ALL_EVENTS),
    value: PipelineEventType.ALL_EVENTS
  },
  {
    label: startCase(PipelineEventType.PipelineStart),
    value: PipelineEventType.PipelineStart
  },
  {
    label: startCase(PipelineEventType.PipelineEnd),
    value: PipelineEventType.PipelineEnd
  },

  {
    label: startCase(PipelineEventType.PipelineSuccess),
    value: PipelineEventType.PipelineSuccess
  },
  {
    label: startCase(PipelineEventType.PipelineFailed),
    value: PipelineEventType.PipelineFailed
  },
  {
    label: startCase(PipelineEventType.StageFailed),
    value: PipelineEventType.StageFailed
  },
  {
    label: startCase(PipelineEventType.StageSuccess),
    value: PipelineEventType.StageSuccess
  },
  {
    label: startCase(PipelineEventType.StageStart),
    value: PipelineEventType.StageStart
  },
  {
    label: startCase(PipelineEventType.StepFailed),
    value: PipelineEventType.StepFailed
  }
]

interface PipelineEventsFormData {
  types: { [key: string]: any }
  [key: string]: any
}

type PipelineEventsProps = StepProps<NotificationRules> & { stagesOptions?: MultiSelectOption[] }

// returns - [all events checked , all events not checked]
const allEventsStatus = (events: PipelineEventsFormData): [boolean, boolean] => {
  let allFalse = true
  let allTrue = true

  pipelineEventItems.forEach(item => {
    if (events?.types?.[item.value] === true) {
      allFalse = false
    }
    if (isUndefined(events?.types?.[item.value]) || events?.types?.[item.value] === false) {
      allTrue = false
    }
  })
  return [allTrue, allFalse]
}

//sets all events as either checked or unchecked
const setAllEventStatus = (status: boolean): PipelineEventsFormData => {
  const events = { types: {} } as PipelineEventsFormData
  pipelineEventItems.forEach(item => {
    events.types[item.value] = status
  })
  return events
}

const isIndeterminate = (events: PipelineEventsFormData, currentEvent: PipelineEventType): boolean => {
  const [allChecked, allUnChecked] = allEventsStatus(events)

  return currentEvent === PipelineEventType.ALL_EVENTS && !allChecked && !allUnChecked
}

const isAll_Event = (currentEvent: PipelineEventType): boolean => currentEvent === PipelineEventType.ALL_EVENTS

function PipelineEvents({
  nextStep,
  previousStep,
  prevStepData,
  stagesOptions
}: PipelineEventsProps): React.ReactElement {
  const { getString } = useStrings()
  const initialValues: PipelineEventsFormData = { types: {} }
  const types: Required<PipelineEventsFormData>['types'] = {}

  //Add AllStages option at the top
  const stagesOptionsWithAllStages = React.useMemo(() => {
    if (stagesOptions?.length) {
      const stagesOptionArray = Array.from(stagesOptions)
      stagesOptionArray.unshift(ALL_STAGES)
      return stagesOptionArray
    }
    return stagesOptions
  }, [stagesOptions])

  const getStageOption = (stageId: string): MultiSelectOption | undefined => {
    return stagesOptionsWithAllStages?.find(item => item.value === stageId)
  }

  const items = pipelineEventItems

  prevStepData?.pipelineEvents?.map(event => {
    const type = event.type
    if (type) {
      types[type] = true
      if (event.forStages?.length) {
        initialValues[type] = event.forStages.map(stageId => getStageOption(stageId)).filter(item => !!item)
      }
    }
  })

  return (
    <Layout.Vertical spacing="xxlarge" padding="small">
      <Text font="medium" color={Color.BLACK}>
        {getString('rbac.notifications.pipelineEvents')}
      </Text>
      <Formik<PipelineEventsFormData>
        initialValues={{ ...initialValues, types }}
        formName="pipelineEvents"
        validationSchema={Yup.object()
          .shape({
            types: Yup.object().required()
          })
          .test({
            test: function (val) {
              if (isEmpty(val?.types)) {
                return this.createError({
                  path: 'types',
                  message: getString('rbac.notifications.eventRequired')
                })
              }
              if (Object.keys(val.types).length === 1 && val.types[PipelineEventType.ALL_EVENTS] === false) {
                return this.createError({
                  path: 'types',
                  message: getString('rbac.notifications.eventRequired')
                })
              }

              //validation for when all the events are unchecked
              if (allEventsStatus(val)[1]) {
                return this.createError({
                  path: 'types',
                  message: getString('rbac.notifications.eventRequired')
                })
              }

              if (!val.types?.[PipelineEventType.ALL_EVENTS]) {
                if (
                  val.types[PipelineEventType.StageStart] &&
                  (!val[PipelineEventType.StageStart] || !val[PipelineEventType.StageStart].length)
                ) {
                  return this.createError({
                    path: PipelineEventType.StageStart,
                    message: getString('rbac.notifications.stageRequired')
                  })
                } else if (
                  val.types[PipelineEventType.StageFailed] &&
                  (!val[PipelineEventType.StageFailed] || !val[PipelineEventType.StageFailed].length)
                ) {
                  return this.createError({
                    path: PipelineEventType.StageFailed,
                    message: getString('rbac.notifications.stageRequired')
                  })
                } else if (
                  val.types[PipelineEventType.StageSuccess] &&
                  (!val[PipelineEventType.StageSuccess] || !val[PipelineEventType.StageSuccess].length)
                ) {
                  return this.createError({
                    path: PipelineEventType.StageSuccess,
                    message: getString('rbac.notifications.stageRequired')
                  })
                }
              }

              return true
            }
          })
          .required()}
        onSubmit={values => {
          const pipelineEvents: PipelineEvent[] = Object.keys(values.types)
            .filter(function (k) {
              return values.types[k]
            })
            .map(value => {
              const dataToSubmit: PipelineEvent = { type: value as PipelineEventType }
              if (values[value]?.length)
                dataToSubmit['forStages'] = values[value].map((item: { value: string }) => item.value)
              return dataToSubmit
            })

          nextStep?.({ ...prevStepData, pipelineEvents })
        }}
      >
        {formikProps => {
          return (
            <Form>
              <Layout.Vertical spacing="medium" className={css.formContent}>
                <Text margin={{ bottom: !isEmpty(formikProps.errors) ? 'small' : 'large' }}>
                  {getString('rbac.notifications.selectPipelineEvents')}
                </Text>
                {!isEmpty(formikProps.errors) && (
                  <Text intent={Intent.DANGER} margin={{ top: 'none', bottom: 'small' }}>
                    {getString('rbac.notifications.eventRequired')}
                  </Text>
                )}
                {items.map(event => {
                  return (
                    <Layout.Vertical key={event.label}>
                      <Layout.Horizontal margin={{ bottom: isAll_Event(event.value) ? 0 : 'small' }} flex>
                        <FormInput.CheckBox
                          className={formikProps.values.types[event.value] ? 'checked' : 'unchecked'}
                          name={`types.${event.value}`}
                          checked={formikProps.values.types[event.label]}
                          label={event.label}
                          indeterminate={isIndeterminate(formikProps.values, event.value)}
                          padding={{ left: 'xxxlarge' }}
                          onChange={e => {
                            if (e.currentTarget.checked) {
                              if (isAll_Event(event.value)) {
                                formikProps.setValues({
                                  ...setAllEventStatus(true)
                                })
                              } else {
                                const finalUpdatedValue = {
                                  types: {
                                    ...formikProps.values.types,
                                    [PipelineEventType.ALL_EVENTS]: true,
                                    [event?.value]: true
                                  }
                                } as PipelineEventsFormData

                                formikProps.setValues(
                                  allEventsStatus(finalUpdatedValue)[0]
                                    ? finalUpdatedValue
                                    : {
                                        ...formikProps.values,
                                        types: {
                                          ...formikProps.values.types,
                                          [PipelineEventType.ALL_EVENTS]: false,
                                          [event?.value]: true
                                        }
                                      }
                                )
                              }
                            } else if (isAll_Event(event.value)) {
                              formikProps.setValues(setAllEventStatus(false))
                            } else {
                              delete formikProps.values?.[event?.value]
                              formikProps.setValues({
                                ...formikProps.values,
                                types: {
                                  ...formikProps.values.types,
                                  [PipelineEventType.ALL_EVENTS]: false,
                                  [event?.value]: false
                                }
                              })
                            }
                          }}
                        />
                        {(event.value === PipelineEventType.StageSuccess ||
                          event.value === PipelineEventType.StageFailed ||
                          event.value === PipelineEventType.StageStart) && (
                          <FormInput.MultiSelect
                            disabled={
                              !formikProps.values.types[event.value] ||
                              formikProps.values.types?.[PipelineEventType.ALL_EVENTS]
                            }
                            className={css.stagesMultiSelect}
                            items={stagesOptionsWithAllStages || []}
                            name={event.value}
                            label={''}
                            usePortal
                            multiSelectProps={{
                              placeholder: getString('rbac.notifications.selectStagesPlaceholder'),
                              allowCreatingNewItems: false,
                              resetOnSelect: false,
                              resetOnQuery: false
                            }}
                            popoverClassName={css.stagesMultiSelectDropDown}
                            onChange={val => {
                              const selectValues = getValuesFromOptions(val, formikProps.values?.[event?.value])
                              formikProps.setFieldValue(event.value, selectValues)
                            }}
                          />
                        )}
                      </Layout.Horizontal>
                      {isAll_Event(event.value) && <Divider style={{ marginBottom: 'var(--spacing)' }} />}
                    </Layout.Vertical>
                  )
                })}
              </Layout.Vertical>
              <Layout.Horizontal spacing={'medium'}>
                <Button
                  text={getString('back')}
                  variation={ButtonVariation.SECONDARY}
                  onClick={() => {
                    previousStep?.({
                      ...prevStepData
                    })
                  }}
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  rightIcon="chevron-right"
                  text={getString('continue')}
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default PipelineEvents
