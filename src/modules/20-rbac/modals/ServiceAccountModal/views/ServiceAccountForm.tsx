/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Text,
  TextInput,
  ButtonVariation,
  Label
} from '@harness/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useToaster } from '@common/components'
import { DescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import { ServiceAccountDTO, useCreateServiceAccount, useUpdateServiceAccount } from 'services/cd-ng'
import css from '@rbac/modals/ServiceAccountModal/useServiceAccountModal.module.scss'

interface ServiceAccountModalData {
  data?: ServiceAccountDTO
  isEdit?: boolean
  onSubmit?: (serviceAccount: ServiceAccountDTO) => void
  onClose?: () => void
}

const ServiceAccountForm: React.FC<ServiceAccountModalData> = props => {
  const { data: serviceAccountData, onSubmit, isEdit, onClose } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createServiceAccount, loading: saving } = useCreateServiceAccount({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { mutate: editServiceAccount, loading: updating } = useUpdateServiceAccount({
    identifier: serviceAccountData?.identifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const handleSubmit = async (values: ServiceAccountDTO): Promise<void> => {
    const dataToSubmit = { ...values, email: values['identifier'].concat('@service.harness.io').toLowerCase() }
    try {
      if (isEdit) {
        const updated = await editServiceAccount(dataToSubmit)
        /* istanbul ignore else */ if (updated) {
          showSuccess(getString('rbac.serviceAccounts.form.editSuccess', { name: values.name }))
          onSubmit?.(values)
        }
      } else {
        const created = await createServiceAccount(dataToSubmit)
        /* istanbul ignore else */ if (created) {
          showSuccess(getString('rbac.serviceAccounts.form.createSuccess', { name: values.name }))
          onSubmit?.(values)
        }
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return (
    <Formik
      initialValues={{
        identifier: '',
        name: '',
        description: '',
        email: '',
        tags: {},
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        ...serviceAccountData
      }}
      formName="serviceAccountForm"
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema()
      })}
      onSubmit={values => {
        modalErrorHandler?.hide()
        handleSubmit(values)
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Container className={css.form}>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <FormInput.InputWithIdentifier isIdentifierEditable={!isEdit} />
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
                <Layout.Vertical>
                  <Label>{getString('email')}</Label>
                  <TextInput disabled value={formikProps.values.identifier.toLowerCase()} />
                </Layout.Vertical>
                <Text margin={{ top: 'xsmall' }}>{getString('rbac.serviceAccounts.email')}</Text>
              </Layout.Horizontal>
              <DescriptionTags formikProps={formikProps} />
            </Container>
            <Layout.Horizontal spacing="small">
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('save')}
                type="submit"
                disabled={saving || updating}
              />
              <Button text={getString('cancel')} onClick={onClose} variation={ButtonVariation.TERTIARY} />
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}

export default ServiceAccountForm
