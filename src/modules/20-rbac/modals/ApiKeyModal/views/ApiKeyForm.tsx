/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import {
  Layout,
  Formik,
  Text,
  Button,
  Container,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Form } from 'formik'
import { useParams } from 'react-router-dom'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useStrings } from 'framework/strings'
import { ApiKeyDTO, TokenDTO, useCreateApiKey, useUpdateApiKey } from 'services/cd-ng'
import type { ProjectPathProps, ServiceAccountPathProps } from '@common/interfaces/RouteInterfaces'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useToaster } from '@common/exports'
import css from '../useApiKeyModal.module.scss'

interface ApiKeyModalData {
  data?: ApiKeyDTO
  isEdit?: boolean
  apiKeyType?: TokenDTO['apiKeyType']
  parentIdentifier?: string
  onSubmit?: (data: ApiKeyDTO) => void
  onClose?: () => void
}

const ApiKeyForm: React.FC<ApiKeyModalData> = ({ data, isEdit, onSubmit, apiKeyType, parentIdentifier, onClose }) => {
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { accountId, projectIdentifier, orgIdentifier, serviceAccountIdentifier } = useParams<
    ProjectPathProps & ServiceAccountPathProps
  >()
  const { showSuccess } = useToaster()
  const { mutate: createApiKey, loading: saving } = useCreateApiKey({ queryParams: { accountIdentifier: accountId } })
  const { mutate: editApiKey, loading: updating } = useUpdateApiKey({
    identifier: data?.identifier || /* istanbul ignore next */ ''
  })

  const handleSubmit = async (values: ApiKeyDTO): Promise<void> => {
    try {
      if (isEdit) {
        const updated = await editApiKey({ ...values, accountIdentifier: accountId })
        /* istanbul ignore else */ if (updated) {
          showSuccess(getString('rbac.apiKey.form.editSuccess', { name: values.name }))
          onSubmit?.(values)
        }
      } else {
        const created = await createApiKey({ ...values })
        /* istanbul ignore else */ if (created) {
          showSuccess(getString('rbac.apiKey.form.createSuccess', { name: values.name }))
          onSubmit?.(values)
        }
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return (
    <Layout.Vertical padding={{ bottom: 'xxxlarge', right: 'xxxlarge', left: 'xxxlarge' }}>
      <Layout.Vertical spacing="large">
        <Text color={Color.GREY_900} font={{ size: 'medium', weight: 'semi-bold' }}>
          {isEdit ? getString('rbac.apiKey.editLabel') : getString('rbac.apiKey.createLabel')}
        </Text>
        <Formik<ApiKeyDTO>
          initialValues={{
            identifier: '',
            name: '',
            description: '',
            tags: {},
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            parentIdentifier: parentIdentifier || serviceAccountIdentifier,
            apiKeyType: apiKeyType || 'SERVICE_ACCOUNT',
            ...data
          }}
          formName="apiKeyForm"
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
                  <NameIdDescriptionTags
                    formikProps={formikProps}
                    identifierProps={{ isIdentifierEditable: !isEdit }}
                  />
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
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ApiKeyForm
