/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Text, Formik, Button, ButtonVariation, StepProps, FormInput } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import React from 'react'
import { Form } from 'formik'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import css from './SubmitTicketModalSteps.module.scss'

interface SubmitTicketModalStepThreeProps {
  name: string
  stepName: string
  onCloseHandler: () => void
}
export const SubmitTicketModalStepThree = (props: StepProps<any> & SubmitTicketModalStepThreeProps) => {
  const { stepName, onCloseHandler, prevStepData, previousStep } = props

  const { module } = useModuleInfo()

  const backBtnandler = () => {
    previousStep?.()
  }

  return (
    <Layout.Vertical spacing="small" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={{
          subject: prevStepData.val.subject,
          ticketDetails: '',
          module: module ? module : 'platform',
          component: ''
        }}
        formName="ticketDetailsForm"
        validationSchema={Yup.object().shape({
          ticketDetails: Yup.string().required('Ticket Details are required')
        })}
        onSubmit={(val: any) => {
          onCloseHandler()
        }}
      >
        {formik => (
          <Form>
            <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Layout.Horizontal spacing="medium">
                <FormInput.Text name="subject" label={'Subject'} className={css.inputWidth} disabled />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <FormInput.Select
                  name="issueType"
                  className={css.fieldWidth}
                  items={issueTypes}
                  placeholder={'Select Issue Type'}
                  label={'Issue Type'}
                />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <FormInput.Select
                  name="priority"
                  className={css.fieldWidth}
                  items={priorityItems}
                  placeholder={'Select Priority'}
                  label={'Priority'}
                />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium"></Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <FormInput.Select
                  name="module"
                  label={'Module'}
                  className={css.fieldWidth}
                  placeholder="Select the Module with the issue"
                  items={moduleOptions}
                />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <FormInput.Select
                  name="component"
                  label={'Component'}
                  className={css.fieldWidth}
                  placeholder="Select the Components with the issue"
                  items={getComponentsFromModule(formik.values.module as string)}
                />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <FormInput.TextArea
                  name="ticketDetails"
                  label={'Ticket Details'}
                  className={css.fieldWidth}
                  placeholder="Please add relevant information for the ticket"
                />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <FormInput.FileInput
                  name="fileData"
                  label={'Upload File'}
                  buttonText={'Upload'}
                  placeholder={'Upload Some file here'}
                  multiple
                />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <Button
                  variation={ButtonVariation.PRIMARY}
                  text={'Back'}
                  icon="chevron-left"
                  className={css.saveBtn}
                  onClick={backBtnandler}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={'Submit'}
                  rightIcon="chevron-right"
                  className={css.saveBtn}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

const moduleOptions = [
  {
    label: 'CD',
    value: 'cd'
  },
  {
    label: 'CI',
    value: 'ci'
  },
  {
    label: 'CV',
    value: 'cv'
  },
  {
    label: 'PL',
    value: 'platform'
  }
]

export const getComponentsFromModule = (module: string): Array<{ label: string; value: string }> => {
  switch (module) {
    case 'cd':
      return [
        { label: 'Pipeline', value: 'Pipeline' },
        { label: 'InputSets', value: 'InputSets' }
      ]
    case 'ci':
      return [{ label: 'Build', value: 'Build' }]
    default:
      return [{ label: 'Misc', value: 'Misc' }]
  }
}

const issueTypes = [{ label: 'Bug', value: 'bug' }]
const priorityItems = [
  { label: 'P0', value: 'p0' },
  { label: 'P1', value: 'p1' }
]
