/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import noop from 'lodash-es/noop'
import {
  Card,
  Container,
  Heading,
  FormikForm,
  ButtonVariation,
  Button,
  Formik,
  Layout,
  Label,
  FormInput,
  SelectOption,
  DateInput,
  Color
} from '@harness/uicore'
import * as Yup from 'yup'
import { pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ALL_TIME_ZONES } from '@common/utils/dateUtils'
import { DOES_NOT_REPEAT, RECURRENCE } from '@freeze-windows/utils/freezeWindowUtils'
import { SaveFreezeButton } from './SaveFreezeButton'
import { useFreezeWindowContext } from './FreezeWindowContext/FreezeWindowContext'
import css from './FreezeWindowStudio.module.scss'

interface FreezeStudioOverviewSectionProps {
  isReadOnly: boolean
  onBack: () => void
}

interface ScheduleFormInterface {
  startTime?: number
  endTime?: number
  timeZone?: string
  recurrence?: {
    type?: typeof RECURRENCE
    spec?: {
      until?: number
    }
  }
}

export const FreezeWindowScheduleSection: React.FC<FreezeStudioOverviewSectionProps> = ({ onBack }) => {
  const { getString } = useStrings()
  const {
    state: { freezeObj },
    updateFreeze
  } = useFreezeWindowContext()

  const validate = useCallback((formData: any) => updateFreeze({ ...freezeObj, window: formData }), [])

  const timeZones: SelectOption[] = useMemo(
    () => ALL_TIME_ZONES.map(timeZone => ({ value: timeZone, label: timeZone })),
    []
  )

  const recurrence: SelectOption[] = useMemo(() => {
    return [{ value: '', label: DOES_NOT_REPEAT }, ...RECURRENCE.map(item => ({ value: item, label: item }))]
  }, [])

  return (
    <Container padding={{ top: 'small', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}>
      <Heading color={Color.BLACK} level={3} style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px' }}>
        {getString('freezeWindows.freezeStudio.freezeSchedule')}
      </Heading>
      <Card className={css.sectionCard}>
        <Formik<ScheduleFormInterface>
          enableReinitialize
          onSubmit={noop}
          formName="freezeWindowStudioOverviewForm"
          initialValues={pick(freezeObj, 'windows') as ScheduleFormInterface}
          validate={validate}
          validationSchema={Yup.object().shape({
            timeZone: Yup.string(),
            startTime: Yup.string(),
            endTime: Yup.string()
          })}
        >
          {formikProps => {
            return (
              <FormikForm>
                <Layout.Vertical width={'300px'}>
                  <FormInput.DropDown
                    label="Timezone"
                    items={timeZones}
                    name="timeZone"
                    dropDownProps={{
                      minWidth: 200
                    }}
                    onChange={item => {
                      formikProps.setFieldValue('timeZone', item.value)
                    }}
                  />

                  <div className="bp3-form-group">
                    <Label className="bp3-label">Start time</Label>
                    <DateInput
                      contentEditable={false}
                      value={formikProps.values.startTime?.toString()}
                      name="Start time"
                      timePrecision="minute"
                      dateTimeFormat={'LLLL'}
                      onChange={value => {
                        formikProps.setFieldValue('startTime', value)
                      }}
                      autoComplete="off"
                    />
                  </div>
                  <div className="bp3-form-group">
                    <Label className="bp3-label">End time</Label>
                    <DateInput
                      value={formikProps.values.endTime?.toString()}
                      name="End time"
                      timePrecision="minute"
                      dateTimeFormat={'LLLL'}
                      onChange={value => {
                        formikProps.setFieldValue('endTime', value)
                      }}
                      autoComplete="off"
                    />
                  </div>
                  <FormInput.DropDown
                    label="Recurrence"
                    items={recurrence}
                    name="recurrence.type"
                    dropDownProps={{
                      filterable: false,
                      minWidth: 200
                    }}
                    onChange={item => {
                      formikProps.setFieldValue('recurrence.type', item.value)
                    }}
                  />

                  {formikProps.values?.recurrence?.type && (
                    <FormInput.RadioGroup
                      name="formikProps.values?.recurrence?.spec.count"
                      label="Recurrence End Date"
                      items={[
                        { label: 'Never', value: 0 },
                        {
                          label: (
                            <div className="bp3-form-group">
                              <DateInput
                                contentEditable={false}
                                value={formikProps.values?.recurrence?.spec?.until?.toString()}
                                name="Start time"
                                timePrecision="minute"
                                dateTimeFormat={'LLLL'}
                                onChange={value => {
                                  formikProps.setFieldValue('formikProps.values?.recurrence?.spec?.until', value)
                                }}
                                autoComplete="off"
                              />
                            </div>
                          ),
                          value: 1
                        }
                      ]}
                    />
                  )}
                </Layout.Vertical>
              </FormikForm>
            )
          }}
        </Formik>
      </Card>

      <Layout.Horizontal
        spacing="small"
        margin={{ top: 'xxlarge' }}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <Button
          margin={{ top: 'medium' }}
          icon="chevron-left"
          onClick={onBack}
          variation={ButtonVariation.SECONDARY}
          text={getString('back')}
        />
        <div className={css.scheduleTabSaveBtnContainer}>
          <SaveFreezeButton />
        </div>
      </Layout.Horizontal>
    </Container>
  )
}
