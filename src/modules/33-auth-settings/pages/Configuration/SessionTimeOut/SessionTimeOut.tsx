import {
  Layout,
  Text,
  Button,
  useToaster,
  getErrorInfoFromErrorObject,
  Card,
  Formik,
  FormikForm,
  ButtonVariation,
  TextInput,
  FormError,
  PageSpinner
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { useSetSessionTimeoutAtAccountLevel } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './SessionTimeOut.module.scss'

interface SessionTimeOutProps {
  timeout: number | undefined
}
type FromikSessionTimeOut = Omit<SessionTimeOutProps, 'onSaveStart' | 'onSaveComplete'>
export const MINIMUM_SESSION_TIME_OUT_IN_MINUTES = 30 // 30 minutes
export const MAXIMUM_SESSION_TIME_OUT_IN_MINUTES = 4320 // 72 hours
const SessionTimeOut: React.FC<SessionTimeOutProps> = ({ timeout }) => {
  const params = useParams<AccountPathProps>()
  const { accountId } = params
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const {
    mutate: saveSessionTimeout,
    error,
    loading
  } = useSetSessionTimeoutAtAccountLevel({
    queryParams: { accountIdentifier: accountId }
  })

  useEffect(() => {
    if (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }, [error])
  const submitData = async (values: FromikSessionTimeOut) => {
    if (values.timeout) {
      const { resource } = await saveSessionTimeout({ sessionTimeOutInMinutes: values.timeout })
      if (resource) {
        showSuccess(getString('authSettings.sessionTimOutSaved'))
      }
    }
  }
  return (
    <Formik<FromikSessionTimeOut>
      onSubmit={values => {
        submitData(values)
      }}
      formName="sessionTimeOut"
      validationSchema={Yup.object().shape({
        timeout: Yup.number()
          .integer()
          .required(getString('authSettings.timeoutRequired'))
          .typeError(getString('authSettings.timeoutNumberRequired'))
          .min(
            MINIMUM_SESSION_TIME_OUT_IN_MINUTES,
            getString('authSettings.sessionTimeOutErrorMessage', {
              minimum: MINIMUM_SESSION_TIME_OUT_IN_MINUTES
            })
          )
          .max(
            MAXIMUM_SESSION_TIME_OUT_IN_MINUTES,
            getString('authSettings.sessionTimeOutErrorMaxMessage', {
              maximum: MAXIMUM_SESSION_TIME_OUT_IN_MINUTES
            })
          )
      })}
      initialValues={{
        timeout
      }}
    >
      {formik => {
        return (
          <>
            {loading && <PageSpinner message={getString('common.saving')} />}
            <FormikForm>
              <Card className={css.card}>
                <Layout.Horizontal
                  className={css.sessionTimeoutLayout}
                  spacing={'medium'}
                  flex={{ justifyContent: 'flex-start' }}
                >
                  <Text color={Color.BLACK} font={{ variation: FontVariation.LEAD }}>
                    {getString('authSettings.sessionTimeOut')}
                  </Text>
                  <TextInput
                    type="number"
                    value={formik.values.timeout as any}
                    min={MINIMUM_SESSION_TIME_OUT_IN_MINUTES}
                    max={MAXIMUM_SESSION_TIME_OUT_IN_MINUTES}
                    wrapperClassName={css.textInpt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      formik.setFieldValue('timeout', e.target.value)
                    }
                    name="timeout"
                  ></TextInput>
                  <Button
                    type="submit"
                    text={getString('save')}
                    variation={ButtonVariation.SECONDARY}
                    disabled={loading || !!formik.errors.timeout}
                  />
                </Layout.Horizontal>
                <FormError
                  className={css.sessionTimeoutError}
                  name="timeoutErrorMsg"
                  errorMessage={formik.errors.timeout}
                />
              </Card>
            </FormikForm>
          </>
        )
      }}
    </Formik>
  )
}
export default SessionTimeOut
