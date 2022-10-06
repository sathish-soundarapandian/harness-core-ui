/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
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
  Label
} from '@wings-software/uicore'
import { DateInput, Color } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './FreezeWindowStudio.module.scss'

interface FreezeStudioOverviewSectionProps {
  isReadOnly: boolean
  onBack: () => void
}

interface ScheduleFormInterface {
  startTime?: string
  endTime?: string
}

export const FreezeWindowScheduleSection: React.FC<FreezeStudioOverviewSectionProps> = ({ onBack }) => {
  const { getString } = useStrings()

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
          initialValues={{ startTime: '', endTime: '' }}
          // validate={debouncedUpdate}
        >
          {formikProps => {
            const { values } = formikProps
            const { startTime } = values
            return (
              <FormikForm>
                <Layout.Vertical width={'400px'}>
                  <div className="bp3-form-group">
                    <Label className="bp3-label">Start time</Label>
                    <DateInput
                      timePrecision="minute"
                      dateProps={{
                        timePickerProps: { useAmPm: true },
                        // defaultValue: new Date(),
                        minDate: startTime ? new Date(startTime) : new Date()
                      }}
                      dateTimeFormat={'LLLL'}
                      // value={startTime}
                      onChange={(value: string | undefined) => {
                        formikProps.setFieldValue('startTime', value)
                      }}
                      data-testid="startsOn"
                      popoverProps={{ position: 'auto', usePortal: false }}
                    />
                  </div>
                  <div className="bp3-form-group">
                    <Label className="bp3-label">End time</Label>
                    <DateInput
                      timePrecision="minute"
                      dateProps={{
                        timePickerProps: { useAmPm: true },
                        // defaultValue: new Date(),
                        minDate: startTime ? new Date(startTime) : new Date()
                      }}
                      dateTimeFormat={'LLLL'}
                      // value={startTime}
                      onChange={(value: string | undefined) => {
                        formikProps.setFieldValue('endTime', value)
                      }}
                      data-testid="endsOn"
                      popoverProps={{ position: 'auto', usePortal: false }}
                    />
                  </div>
                </Layout.Vertical>
              </FormikForm>
            )
          }}
        </Formik>
      </Card>
      <Layout.Horizontal spacing="small" margin={{ top: 'xxlarge' }}>
        <Button
          margin={{ top: 'medium' }}
          icon="chevron-left"
          onClick={onBack}
          variation={ButtonVariation.SECONDARY}
          text={getString('back')}
        />
        <Button
          margin={{ top: 'medium' }}
          rightIcon="chevron-right"
          // onClick={onNext}
          variation={ButtonVariation.PRIMARY}
          text={getString('continue')}
        />
      </Layout.Horizontal>
    </Container>
  )
}
