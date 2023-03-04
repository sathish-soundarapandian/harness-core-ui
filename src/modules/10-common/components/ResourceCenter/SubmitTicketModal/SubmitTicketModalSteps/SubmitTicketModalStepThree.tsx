/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Text, Formik, Button, ButtonVariation, StepProps } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import React from 'react'
import { Form } from 'formik'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import css from './SubmitTicketModalSteps.module.scss'
interface SubmitTicketModalStepThreeProps {
  name: string
  stepName: string
  onCloseHandler: () => void
}
export const SubmitTicketModalStepThree = (props: StepProps<any> & SubmitTicketModalStepThreeProps) => {
  const { stepName, onCloseHandler, prevStepData } = props

  const [fileData, setFileData] = React.useState()

  const fileUploadHandler = (event: any): void => {
    setFileData(event.target.files[0])
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={defaultInitialValues}
        formName="ticketDetailsForm"
        validationSchema={Yup.object().shape({
          ticketDetails: Yup.string().required('Ticket Details are required')
        })}
        onSubmit={() => {
          //   console.log({ ...prevStepData, val, fileData })
          onCloseHandler()
        }}
      >
        {() => (
          <Form>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.manifestForm}
            >
              <Layout.Horizontal spacing="medium">
                <FormMultiTypeTextAreaField
                  name="ticketDetails"
                  label={'Ticket Details'}
                  className={css.inputWidth}
                  placeholder="Please add relevant information for the ticket"
                />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <input name="fileData" type="file" onChange={fileUploadHandler} />
              </Layout.Horizontal>
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={'Submit'}
                rightIcon="chevron-right"
                className={css.saveBtn}
              />
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

const defaultInitialValues = {
  ticketDetails: ''
}
