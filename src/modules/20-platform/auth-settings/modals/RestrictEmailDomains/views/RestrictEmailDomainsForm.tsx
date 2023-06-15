/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as yup from 'yup'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Text,
  Formik,
  FormikForm,
  FormInput,
  Button,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useToaster } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useUpdateWhitelistedDomains } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

interface Props {
  onSubmit?: () => void
  onCancel: () => void
  whitelistedDomains: string[]
}

interface FormValues {
  domains: string[]
}

const RestrictEmailDomainsForm: React.FC<Props> = ({ onSubmit, onCancel, whitelistedDomains }) => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()

  const { mutate: updateWhitelistedDomains, loading: updatingWhitelistedDomains } = useUpdateWhitelistedDomains({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      const response = await updateWhitelistedDomains(values.domains)

      /* istanbul ignore else */ if (response) {
        showSuccess(getString('authSettings.WhitelistedDomainsUpdated'), 5000)
        onSubmit?.()
      }
    } catch (e) {
      /* istanbul ignore next */ modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }

  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Text color={Color.GREY_900} font={{ size: 'medium', weight: 'semi-bold' }} margin={{ bottom: 'xxlarge' }}>
        {getString('authSettings.allowLoginFromTheseDomains')}
      </Text>
      <Formik
        formName="restrictEmailDomainsForm"
        initialValues={{
          domains: whitelistedDomains
        }}
        validationSchema={yup.object().shape({
          domains: yup.array().test({
            test: arr => arr.length !== 0,
            message: getString('authSettings.domainNameRequired')
          })
        })}
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {() => (
          <FormikForm>
            <FormInput.MultiInput
              name="domains"
              tagsProps={{ placeholder: getString('authSettings.typeAndPressEnterToAddADomain') }}
            />
            <Layout.Horizontal margin={{ top: 'xxxlarge', bottom: 'xlarge' }}>
              <Button
                text={getString('save')}
                variation={ButtonVariation.PRIMARY}
                type="submit"
                margin={{ right: 'small' }}
                disabled={updatingWhitelistedDomains}
              />
              <Button text={getString('cancel')} onClick={onCancel} variation={ButtonVariation.TERTIARY} />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default RestrictEmailDomainsForm
