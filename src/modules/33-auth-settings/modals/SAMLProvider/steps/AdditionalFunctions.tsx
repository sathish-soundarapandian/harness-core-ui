/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Button,
  ButtonVariation,
  Checkbox,
  Container,
  FormikForm,
  FormInput,
  Layout,
  ModalErrorHandlerBinding,
  StepProps,
  Text,
  ModalErrorHandler
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import * as yup from 'yup'
import React from 'react'
import { Formik } from 'formik'
import { useParams } from 'react-router-dom'
import type { ToasterProps } from '@harness/uicore/dist/hooks/useToaster/useToaster'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { useUploadSamlMetaData } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { createFormData, FormValues, Providers } from '../utils'
import css from '../useSAMLProvider.module.scss'

interface AdditionalFunctionsForm {
  authorizationEnabled: boolean
  groupMembershipAttr: string
  clientId: string
  enableClientIdAndSecret: boolean
  entityIdEnabled: boolean
  entityIdentifier: string
}

const handleSuccess = (
  successCallback: ToasterProps['showSuccess'],
  isCreate: boolean,
  createText: string,
  updateText: string
): void => {
  successCallback(isCreate ? createText : updateText, 5000)
}

const AdditionalFunctions: React.FC<StepProps<FormValues>> = props => {
  const samlProviderType = props.prevStepData?.samlProviderType
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const { getRBACErrorMessage } = useRBACError()
  const { showSuccess } = useToaster()

  const { mutate: uploadSamlSettings, loading: uploadingSamlSettings } = useUploadSamlMetaData({
    queryParams: {
      accountId
    }
  })

  return (
    <Formik<AdditionalFunctionsForm>
      initialValues={{ ...props.prevStepData } as AdditionalFunctionsForm}
      validationSchema={yup.object().shape({
        groupMembershipAttr: yup.string().when('authorizationEnabled', {
          is: val => val,
          then: yup.string().trim().required(getString('common.validation.groupAttributeIsRequired'))
        }),
        entityIdentifier: yup.string().when('entityIdEnabled', {
          is: val => val,
          then: yup.string().trim().required(getString('common.validation.entityIdIsRequired'))
        }),
        clientId: yup.string().when('enableClientIdAndSecret', {
          is: val => val,
          then: yup.string().trim().required(getString('common.validation.clientIdIsRequired'))
        }),
        clientSecret: yup.string().when('enableClientIdAndSecret', {
          is: val => val,
          then: yup.string().trim().required(getString('common.validation.clientSecretRequired'))
        })
      })}
      onSubmit={async values => {
        try {
          const response = await uploadSamlSettings(createFormData(values as FormValues) as any)

          if (response) {
            handleSuccess(
              showSuccess,
              true,
              getString('authSettings.samlProviderAddedSuccessfully'),
              getString('authSettings.samlProviderUpdatedSuccessfully')
            )
          }
        } catch (e) {
          /* istanbul ignore next */ modalErrorHandler?.showDanger(getRBACErrorMessage(e))
        }
        // const formDataToSubmit = createFormData({ ...props.prevStepData, ...values } as FormValues)
        // handle submit here
      }}
    >
      {({ values, setFieldValue }) => (
        <FormikForm className={css.form}>
          <Layout.Vertical>
            <Text margin={{ bottom: 'large' }} font={{ variation: FontVariation.H3 }}>
              {getString('authSettings.additionalFunctions')}
            </Text>
            <Layout.Vertical className={css.flex} flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Layout.Vertical>
                <ModalErrorHandler bind={setModalErrorHandler} />
                <Container>
                  <Checkbox
                    name="authorization"
                    label={getString('authSettings.enableAuthorization')}
                    font={{ weight: 'semi-bold' }}
                    color={Color.GREY_600}
                    checked={values.authorizationEnabled}
                    onChange={e => setFieldValue('authorizationEnabled', e.currentTarget.checked)}
                  />
                  {values.authorizationEnabled && (
                    <Container width={300} margin={{ top: 'medium' }}>
                      <FormInput.Text name="groupMembershipAttr" label={getString('authSettings.groupAttributeName')} />
                      {Providers.AZURE === samlProviderType && (
                        <>
                          <Checkbox
                            name="clientIdAndSecret"
                            label={getString('authSettings.enableClientIdAndSecret')}
                            font={{ weight: 'semi-bold' }}
                            color={Color.GREY_600}
                            checked={values.enableClientIdAndSecret}
                            onChange={e => setFieldValue('enableClientIdAndSecret', e.currentTarget.checked)}
                          />

                          {Providers.AZURE === samlProviderType && values.enableClientIdAndSecret && (
                            <Container width={300} margin={{ top: 'medium' }}>
                              <FormInput.Text name="clientId" label={getString('common.clientId')} />
                              <FormInput.Text
                                name="clientSecret"
                                inputGroup={{ type: 'password' }}
                                label={getString('common.clientSecret')}
                              />
                            </Container>
                          )}
                        </>
                      )}
                    </Container>
                  )}
                </Container>
                <Container margin={{ top: 'large' }}>
                  <Checkbox
                    name="enableEntityId"
                    label={getString('authSettings.enableEntityIdLabel')}
                    font={{ variation: FontVariation.FORM_LABEL }}
                    color={Color.GREY_600}
                    checked={values.entityIdEnabled}
                    onChange={e => setFieldValue('entityIdEnabled', e.currentTarget.checked)}
                  />
                  {values.entityIdEnabled && (
                    <Container width={300} margin={{ top: 'medium' }}>
                      <FormInput.Text name="entityIdentifier" label={getString('authSettings.entityIdLabel')} />
                    </Container>
                  )}
                </Container>
              </Layout.Vertical>

              <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  variation={ButtonVariation.SECONDARY}
                  onClick={() => props?.previousStep?.({ ...props.prevStepData } as FormValues)}
                  data-name="awsBackButton"
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('submit')}
                  rightIcon="chevron-right"
                  disabled={uploadingSamlSettings}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Vertical>
        </FormikForm>
      )}
    </Formik>
  )
}

export default AdditionalFunctions
