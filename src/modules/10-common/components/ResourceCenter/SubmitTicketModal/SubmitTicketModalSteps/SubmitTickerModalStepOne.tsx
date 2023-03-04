/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Text, Formik, Button, ButtonVariation, FormInput } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import React from 'react'
import { Form } from 'formik'
import { useStrings } from 'framework/strings'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import css from './SubmitTicketModalSteps.module.scss'
interface SubmitTicketModalStepOneProps {
  name: string
  stepName: string
  changeIssueTypeHandler: (val: any) => void
}
export const SubmitTicketModalStepOne = (props: SubmitTicketModalStepOneProps) => {
  const { stepName, changeIssueTypeHandler } = props
  const { getString } = useStrings()

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={defaultInitialValues}
        formName="issueTypeForm"
        validationSchema={Yup.object().shape({
          issueType: Yup.string().required('Issue Type is required'),
          priority: Yup.string().required('Priority is required'),
          subject: Yup.string().required('Subject is required'),
          ticketDetails: Yup.string().required('Ticket Details are required')
        })}
        onSubmit={val => {
          changeIssueTypeHandler(val)
        }}
      >
        {() => (
          <Form>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.manifestForm}
            >
              <Layout.Horizontal spacing="medium">
                <FormInput.MultiTypeInput
                  name="issueType"
                  className={css.inputWidth}
                  selectItems={issueTypes}
                  placeholder={'Select Issue Type'}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: issueTypes,
                      allowCreatingNewItems: true,
                      addClearBtn: true
                    }
                  }}
                  label={'Issue Type'}
                />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <FormInput.MultiTypeInput
                  name="priority"
                  className={css.inputWidth}
                  selectItems={priorityItems}
                  useValue
                  placeholder={'Select Priority'}
                  multiTypeInputProps={{
                    selectProps: {
                      items: priorityItems,
                      allowCreatingNewItems: true,
                      addClearBtn: true
                    }
                  }}
                  label={'Priority'}
                />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <FormInput.MultiTextInput
                  name="subject"
                  placeholder={'Enter the Subject'}
                  label={'Subject'}
                  className={css.inputWidth}
                />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <FormMultiTypeTextAreaField
                  name="ticketDetails"
                  label={'Ticket Details'}
                  className={css.inputWidth}
                  placeholder="Please add relevant information for the ticket"
                />
              </Layout.Horizontal>

              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('continue')}
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
  issueType: '',
  priority: '',
  subject: '',
  ticketDetails: ''
}

const issueTypes = [{ label: 'Bug', value: 'bug' }]
const priorityItems = [
  { label: 'P0', value: 'p0' },
  { label: 'P1', value: 'p1' }
]
