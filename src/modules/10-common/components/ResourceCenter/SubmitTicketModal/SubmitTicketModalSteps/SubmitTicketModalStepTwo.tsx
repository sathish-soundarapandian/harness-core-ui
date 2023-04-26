/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Layout,
  Text,
  Formik,
  Button,
  ButtonVariation,
  StepProps,
  FormInput,
  PageSpinner,
  useToaster
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import React from 'react'
import { Form } from 'formik'
import { useParams } from 'react-router-dom'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { useCreateZendeskTicket } from 'services/resourcegroups'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { DEFAULT_MODULES_ORDER, moduleInfoMap } from '@common/hooks/useNavModuleInfo'
import { useStrings } from 'framework/strings'
import { getComponentsFromModule, IssueType, issueTypes, priorityItems, PriorityType, SubmitTicket } from './Utils'
import css from './SubmitTicketModalSteps.module.scss'

interface SubmitTicketModalStepTwoProps {
  name: string
  stepName: string
  onCloseHandler: () => void
}

export const SubmitTicketModalStepTwo = (props: StepProps<any> & SubmitTicketModalStepTwoProps): JSX.Element => {
  const { stepName, onCloseHandler, prevStepData, previousStep } = props
  const { module } = useModuleInfo()
  const { currentUserInfo } = useAppStore()
  const { email } = currentUserInfo
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()

  const backBtnHandler = (): void => {
    previousStep?.()
  }

  const { mutate: createZendeskTicket, loading } = useCreateZendeskTicket({})

  const createFormData = (data: SubmitTicket): FormData => {
    const formData = new FormData()
    formData.set('message', data.ticketDetails)
    formData.set('url', window.location.href)
    formData.set('website', window.location.hostname)
    formData.set('userAgent', navigator.userAgent)
    formData.set('userName', email as string)
    formData.set('accountId', accountId)
    formData.set('module', data.module)
    formData.set(
      'browserResolution',
      JSON.stringify({
        height: window.innerHeight,
        width: window.innerWidth
      })
    )
    const file = (data as any)?.['fileData']?.[0]
    file && formData.set('file', file)
    return formData
  }

  const handleSubmit = async (val: SubmitTicket): Promise<void> => {
    try {
      const formData = createFormData(val)
      const response = await createZendeskTicket(formData as any, {
        queryParams: {
          emailId: email as string,
          ticketType: val.issueType,
          priority: val.priority,
          subject: val.subject
        }
      })
      if (response) {
        if (response.data?.code === 201) {
          try {
            const zendeskResponse = JSON.parse(response.data?.message as string)
            const ticketURL = `${new URL(zendeskResponse.ticket.url).origin}/agent/tickets/${zendeskResponse.ticket.id}`
            showSuccess(
              <Text className={css.link}>
                Ticket{' '}
                <a href={ticketURL} target="_blank" rel="noreferrer">
                  ${zendeskResponse.ticket.id}
                </a>{' '}
                has been created successfully
              </Text>
            )
          } catch (_) {
            showSuccess('Ticket Created Successfully')
          }

          onCloseHandler()
        } else {
          showError('Something went wrong')
        }
      }
    } catch (_) {
      showError('Something went wrong')
    }
  }

  const moduleOptions: { label: string; value: string }[] = DEFAULT_MODULES_ORDER.map(moduleName => {
    return {
      label: getString(moduleInfoMap[moduleName].label),
      value: moduleName
    }
  })
  moduleOptions.push({
    label: 'Platform',
    value: 'platform'
  })

  return (
    <Layout.Vertical spacing="small" style={{ minHeight: '752px' }}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      {loading && (
        <Layout.Vertical flex={{ alignItems: 'center' }} height="100%">
          <PageSpinner />
        </Layout.Vertical>
      )}
      <Formik<SubmitTicket>
        initialValues={{
          subject: prevStepData.subject,
          module: module ? module : 'platform',
          issueType: IssueType.PROBLEM,
          priority: PriorityType.HIGH,
          ticketDetails: '',
          component: '',
          fileData: ''
        }}
        formName="ticketDetailsForm"
        validationSchema={Yup.object().shape({
          issueType: Yup.string().required('Issue Type is required'),
          priority: Yup.string().required('Priority is required'),
          ticketDetails: Yup.string().required('Ticket Details is required')
        })}
        onSubmit={handleSubmit}
      >
        {formik => (
          <Form>
            <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
              <FormInput.Text
                name="subject"
                label={'What is the problem you are facing?'}
                className={css.inputWidth}
                disabled
              />
              <FormInput.Select
                name="issueType"
                className={css.fieldWidth}
                items={issueTypes}
                placeholder={'Issue Type'}
                label={'Issue Type'}
              />
              <FormInput.Select
                name="priority"
                className={css.fieldWidth}
                items={priorityItems}
                placeholder={'Priority'}
                label={'Priority'}
              />
              <FormInput.Select
                name="module"
                label={'Module'}
                className={css.fieldWidth}
                placeholder="Module"
                items={moduleOptions}
              />
              <FormInput.Select
                name="component"
                label={'Component'}
                className={css.fieldWidth}
                placeholder="Component"
                items={getComponentsFromModule(formik.values.module)}
              />
              <FormInput.TextArea
                name="ticketDetails"
                label={'Ticket Description'}
                className={css.inputWidth}
                placeholder="Please add relevant details for the problem"
              />
              <FormInput.FileInput
                name="fileData"
                label={'Attachments'}
                buttonText={'Upload'}
                placeholder={'Choose a File'}
                className={css.fieldWidth}
              />
              <Layout.Horizontal>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={'Back'}
                  icon="chevron-left"
                  className={css.backBtn}
                  onClick={backBtnHandler}
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
