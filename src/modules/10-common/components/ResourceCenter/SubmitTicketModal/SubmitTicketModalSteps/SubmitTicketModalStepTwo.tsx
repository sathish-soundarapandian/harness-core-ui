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
import {
  getBrowserName,
  getComponentsFromModule,
  getOsVersion,
  IssueType,
  issueTypes,
  priorityItems,
  PriorityType,
  SubmitTicket
} from './Utils'
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
    formData.set('userBrowser', getBrowserName(navigator.userAgent))
    formData.set('userOS', getOsVersion())
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
            showSuccess(getString('common.resourceCenter.ticketmenu.ticketSuccess'))
          }

          onCloseHandler()
        } else {
          showError(getString('somethingWentWrong'))
        }
      }
    } catch (_) {
      showError(getString('somethingWentWrong'))
    }
  }

  const moduleOptions: { label: string; value: string }[] = DEFAULT_MODULES_ORDER.map(moduleName => {
    return {
      label: getString(moduleInfoMap[moduleName].label),
      value: moduleName
    }
  })
  moduleOptions.push({
    label: getString('common.resourceCenter.ticketmenu.platform'),
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
          issueType: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: getString('common.resourceCenter.ticketmenu.issueType')
            })
          ),
          priority: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: getString('common.resourceCenter.ticketmenu.priority')
            })
          ),
          ticketDetails: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: getString('common.resourceCenter.ticketmenu.ticketDescription')
            })
          )
        })}
        onSubmit={handleSubmit}
      >
        {formik => (
          <Form>
            <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
              <FormInput.Text
                name="subject"
                label={getString('common.resourceCenter.ticketmenu.ticketSubject')}
                className={css.inputWidth}
                disabled
              />
              <FormInput.Select
                name="issueType"
                className={css.fieldWidth}
                items={issueTypes}
                placeholder={getString('common.resourceCenter.ticketmenu.issueType')}
                label={getString('common.resourceCenter.ticketmenu.issueType')}
              />
              <FormInput.Select
                name="priority"
                className={css.fieldWidth}
                items={priorityItems}
                placeholder={getString('common.resourceCenter.ticketmenu.priority')}
                label={getString('common.resourceCenter.ticketmenu.priority')}
              />
              <FormInput.Select
                name="module"
                label={getString('common.moduleLabel')}
                className={css.fieldWidth}
                placeholder={getString('common.moduleLabel')}
                items={moduleOptions}
              />
              <FormInput.Select
                name="component"
                label={getString('common.resourceCenter.ticketmenu.component')}
                className={css.fieldWidth}
                placeholder={getString('common.resourceCenter.ticketmenu.component')}
                items={getComponentsFromModule(formik.values.module)}
              />
              <FormInput.TextArea
                name="ticketDetails"
                label={getString('common.resourceCenter.ticketmenu.ticketDescription')}
                className={css.inputWidth}
                placeholder={getString('common.resourceCenter.ticketmenu.ticketDescriptionPlaceholder')}
              />
              <FormInput.FileInput
                name="fileData"
                label={getString('common.resourceCenter.ticketmenu.attachments')}
                buttonText={getString('upload')}
                placeholder={getString('common.resourceCenter.ticketmenu.chooseAFile')}
                className={css.fieldWidth}
              />
              <Layout.Horizontal>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  className={css.backBtn}
                  onClick={backBtnHandler}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('submit')}
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
