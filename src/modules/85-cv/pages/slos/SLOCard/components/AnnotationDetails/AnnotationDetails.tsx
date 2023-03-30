import React from 'react'
import { Button, ButtonVariation, Container, FormInput, Layout, Text, useToaster } from '@harness/uicore'
import { Formik } from 'formik'

import { Color, FontVariation } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import { DateTimePicker } from '@common/components/DateTimePicker/DateTimePicker'
import type { AnnotationMessage } from '@cv/components/ChangeTimeline/components/TimelineRow/components/Annotation/Annotation.types'
import { useSaveAnnotation, useUpdateAnnotation } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { AnnotationDetailsForm } from './AnnotationDetails.types'
import {
  getAnnotationDetailsFormInitialValues,
  getAnnotationReqBody,
  validateAnnotationDetailsForm
} from './AnnotationDetails.utils'
import { AnnotationDetailsFields, DATE_PARSE_FORMAT } from './AnnotationDetails.constants'
import css from './AnnotationDetails.module.scss'

export interface AnnotationDetailsProps {
  hideDrawer: () => void
  annotationMessage?: AnnotationMessage
  sloIdentifier: string
  fetchSecondaryEvents: () => Promise<void>
}

export default function AnnotationDetails(props: AnnotationDetailsProps): JSX.Element {
  const { hideDrawer, annotationMessage, sloIdentifier, fetchSecondaryEvents } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const isEdit = !isEmpty(annotationMessage?.id)
  const title = isEdit
    ? getString('cv.slos.sloDetailsChart.editAnnotation')
    : getString('cv.slos.sloDetailsChart.addAnnotation')
  const isDisabled = !isEmpty(annotationMessage)

  const { mutate: saveAnnotation, loading: saveAnnotationLoading } = useSaveAnnotation({
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  })

  const { mutate: updateAnnotation, loading: updateAnnotationLoading } = useUpdateAnnotation({
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    identifier: annotationMessage?.id as string
  })

  const handleSubmitAnnotation = async (annotationDetails: AnnotationDetailsForm): Promise<void> => {
    const { startDateTime, endDateTime, annotationMessage: message } = annotationDetails
    const annotationReqBody = getAnnotationReqBody({
      endDateTime,
      message,
      orgIdentifier,
      projectIdentifier,
      sloIdentifier,
      startDateTime
    })
    try {
      if (isEdit) {
        await updateAnnotation(annotationReqBody)
        await fetchSecondaryEvents()
        showSuccess(getString('cv.slos.sloDetailsChart.updateAnnotationMessage'))
      } else {
        await saveAnnotation(annotationReqBody)
        await fetchSecondaryEvents()
        showSuccess(getString('cv.slos.sloDetailsChart.addAnnotationMessage'))
      }
      hideDrawer()
    } catch (error) {
      showError(getErrorMessage(error))
    }
  }

  const isAnnotationsLoading = saveAnnotationLoading || updateAnnotationLoading

  return (
    <Container padding={{ left: 'medium', top: 'medium' }}>
      <Text font={{ variation: FontVariation.H3 }}>{title}</Text>
      <hr className={css.division} />
      <Formik<AnnotationDetailsForm>
        initialValues={getAnnotationDetailsFormInitialValues(annotationMessage)}
        onSubmit={handleSubmitAnnotation}
        validate={data => validateAnnotationDetailsForm(data, getString)}
      >
        {formikProps => {
          const { startDateTime, endDateTime } = formikProps?.values || {}
          return (
            <>
              <Container margin={{ right: 'medium' }}>
                <FormInput.TextArea
                  placeholder={getString('cv.slos.sloDetailsChart.addAnnotation')}
                  textArea={{
                    style: { minHeight: 120 }
                  }}
                  name={AnnotationDetailsFields.ANNOTATION_MESSAGE}
                  label={getString('cv.slos.sloDetailsChart.annotation').toLocaleUpperCase()}
                />
                {isDisabled ? (
                  <Layout.Vertical padding={{ bottom: 'medium' }}>
                    <Text color={Color.GREY_700} padding={{ bottom: 'xsmall' }}>
                      {getString('cv.slos.sloDetailsChart.startDate').toLocaleUpperCase()}
                    </Text>
                    <Text color={Color.GREY_700}>{moment(new Date(startDateTime)).format(DATE_PARSE_FORMAT)}</Text>
                  </Layout.Vertical>
                ) : (
                  <DateTimePicker
                    defaultToCurrentTime
                    name={AnnotationDetailsFields.START_DATE_TIME}
                    label={getString('cv.slos.sloDetailsChart.startDate').toLocaleUpperCase()}
                    disabled={isDisabled}
                  />
                )}
                {isDisabled ? (
                  <Layout.Vertical padding={{ bottom: 'medium' }}>
                    <Text color={Color.GREY_700} padding={{ bottom: 'xsmall' }}>
                      {getString('cv.slos.sloDetailsChart.endDate').toLocaleUpperCase()}
                    </Text>
                    <Text color={Color.GREY_700}>{moment(new Date(endDateTime)).format(DATE_PARSE_FORMAT)}</Text>
                  </Layout.Vertical>
                ) : (
                  <DateTimePicker
                    defaultToCurrentTime
                    name={AnnotationDetailsFields.END_DATE_TIME}
                    label={getString('cv.slos.sloDetailsChart.endDate').toLocaleUpperCase()}
                    disabled={isDisabled}
                  />
                )}
              </Container>
              <Layout.Horizontal>
                <Button
                  margin={{ right: 'small' }}
                  variation={ButtonVariation.PRIMARY}
                  text={getString('save')}
                  onClick={formikProps.submitForm}
                />
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('cancel')}
                  onClick={hideDrawer}
                  loading={isAnnotationsLoading}
                />
              </Layout.Horizontal>
            </>
          )
        }}
      </Formik>
    </Container>
  )
}
