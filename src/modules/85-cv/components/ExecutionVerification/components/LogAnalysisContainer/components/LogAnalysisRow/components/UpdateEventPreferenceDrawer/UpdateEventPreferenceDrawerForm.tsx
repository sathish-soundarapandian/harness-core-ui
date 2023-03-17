import React, { useState } from 'react'
import { isEmpty, noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { Button, ButtonVariation, FormInput, Formik, useToaster, Container, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { LogFeedback, useSaveLogFeedback, useUpdateLogFeedback } from 'services/cv'
import { useStrings } from 'framework/strings'
import { getIsValuesUpdated, getRiskItems } from './UpdateEventPreferenceDrawer.utils'
import EventRiskItem from './component/EventRiskItem'
import type { UpdateEventPreferenceFormValuesType } from './UpdateEventPreferenceDrawerForm.types'
import css from './UpdateEventPreferenceDrawer.module.scss'

interface UpdateEventPreferenceDrawerFormType {
  eventPriority?: string
  reason?: string
  onHideCallback: (isCallAPI?: boolean) => void
  feedback?: LogFeedback
  activityId: string
  clusterId?: string
}

export default function UpdateEventPreferenceDrawerForm({
  onHideCallback,
  feedback,
  activityId,
  clusterId
}: UpdateEventPreferenceDrawerFormType): JSX.Element {
  const { showError } = useToaster()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const { getString } = useStrings()

  const { mutate: saveLogFeedback } = useSaveLogFeedback({
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  })

  const { mutate: updateLogFeedback } = useUpdateLogFeedback({
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    logFeedbackId: feedback?.feedbackId || ''
  })

  const submitData = async (formData: UpdateEventPreferenceFormValuesType): Promise<void> => {
    if (!getIsValuesUpdated(formData, feedback)) {
      onHideCallback()
      return void 0
    }

    const { eventPriority, reason } = formData

    const updatedData = {
      feedbackScore: eventPriority,
      description: reason,
      verificationJobInstanceId: activityId,
      clusterId
    }

    try {
      setIsSubmitting(true)

      if (isEmpty(feedback?.feedbackId)) {
        await saveLogFeedback(updatedData)
      } else {
        await updateLogFeedback({
          ...feedback,
          ...updatedData
        })
      }
      setIsSubmitting(false)
      onHideCallback(true)
    } catch (e) {
      setIsSubmitting(false)
      showError(getErrorMessage(e))
    }
  }

  return (
    <Formik<UpdateEventPreferenceFormValuesType>
      validateOnMount
      formName="UpdateEventPreferenceDrawerForm"
      initialValues={{
        eventPriority: feedback?.feedbackScore,
        reason: feedback?.description
      }}
      validationSchema={Yup.object().shape({
        eventPriority: Yup.string().trim().required(getString('cv.logs.riskPriorityValidation')),
        reason: Yup.string().trim().required(getString('cv.reasonIsRequired'))
      })}
      onSubmit={noop}
    >
      {formikProps => {
        if (isSubmitting) {
          return (
            <Container className={css.spinnerContainer} height={300}>
              <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
            </Container>
          )
        }

        return (
          <>
            <FormInput.Select
              name="eventPriority"
              selectProps={{
                itemRenderer: (item, props): JSX.Element => (
                  <EventRiskItem item={item} handleClick={props.handleClick} />
                )
              }}
              data-testid="eventPriorityDropdown"
              className={css.riskSelectElement}
              label={getString('cv.logs.riskPriorityLabel')}
              items={getRiskItems(getString)}
            />
            <FormInput.TextArea
              label={getString('reason')}
              name="reason"
              data-testid="reasonTextArea"
              placeholder={getString('cv.logs.reasonPlaceholder')}
            />
            <Button
              text={getString('submit')}
              onClick={async () => {
                //   Make API call
                await formikProps.submitForm()

                if (formikProps.isValid) {
                  submitData(formikProps.values)
                }
              }}
              variation={ButtonVariation.PRIMARY}
              margin={{ right: 'small' }}
              data-testid="updatePreferenceDrawerSubmit_button"
            />
            <Button
              text={getString('cancel')}
              onClick={() => onHideCallback()}
              variation={ButtonVariation.SECONDARY}
              data-testid="updatePreferenceDrawerClose_button"
            />
          </>
        )
      }}
    </Formik>
  )
}
