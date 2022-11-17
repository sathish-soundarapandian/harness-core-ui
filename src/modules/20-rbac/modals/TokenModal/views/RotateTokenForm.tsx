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
  Checkbox,
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Text,
  ButtonVariation
} from '@harness/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { TokenDTO, useRotateToken } from 'services/cd-ng'
import type { ProjectPathProps, ServiceAccountPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { TokenValueRenderer } from './TokenValueRenderer'
import css from '@rbac/modals/TokenModal/useTokenModal.module.scss'

interface TokenModalData {
  data?: TokenDTO
  apiKeyIdentifier: string
  onSubmit?: () => void
  onClose?: () => void
}

interface RotateTokenFormData {
  name: string
  expiryDate?: string
}

const RotateTokenForm: React.FC<TokenModalData> = props => {
  const { data: tokenData, onSubmit, onClose, apiKeyIdentifier } = props
  const { accountId, orgIdentifier, projectIdentifier, serviceAccountIdentifier } = useParams<
    ProjectPathProps & ServiceAccountPathProps
  >()
  const { getRBACErrorMessage } = useRBACError()
  const [expiry, setExpiry] = useState<boolean>(tokenData?.validTo ? true : false)
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: rotateToken, loading: saving } = useRotateToken({ identifier: tokenData?.identifier || '' })
  const [token, setToken] = useState<string>()

  const handleSubmit = async (values: RotateTokenFormData): Promise<void> => {
    try {
      const rotated = await rotateToken('' as any, {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          apiKeyIdentifier,
          parentIdentifier: tokenData?.parentIdentifier || serviceAccountIdentifier,
          apiKeyType: tokenData?.apiKeyType || 'SERVICE_ACCOUNT',
          rotateTimestamp: values['expiryDate'] ? Date.parse(values['expiryDate']) : Date.now()
        }
      })
      /* istanbul ignore else */ if (rotated) {
        showSuccess(getString('rbac.token.form.rotateSuccess'))
        onSubmit?.()
        setToken(rotated.data)
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return (
    <Formik<RotateTokenFormData>
      initialValues={{
        name: tokenData?.name || '',
        expiryDate: ''
      }}
      formName="RotateForm"
      validationSchema={Yup.object().shape({
        ...(expiry && { expiryDate: Yup.date().min(new Date()).required() })
      })}
      onSubmit={values => {
        modalErrorHandler?.hide()
        handleSubmit(values)
      }}
    >
      {() => {
        return (
          <Form>
            <Container className={css.form}>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Layout.Vertical padding={{ top: 'small' }} spacing="medium">
                <FormInput.Text name="name" disabled label={getString('rbac.token.forToken')} />
                <Checkbox
                  label={getString('rbac.token.form.expiry')}
                  checked={expiry}
                  onClick={e => setExpiry(e.currentTarget.checked)}
                />
                {expiry ? (
                  <FormInput.Text name="expiryDate" label={getString('rbac.token.form.expiryDate')} />
                ) : (
                  <Text>{getString('rbac.token.form.rotateTokenExpiryMessage')}</Text>
                )}
                {token && <TokenValueRenderer token={token} textInputClass={css.tokenValue} copyTextClass={css.copy} />}
              </Layout.Vertical>
            </Container>
            <Layout.Horizontal>
              {token ? (
                <Button text={getString('close')} onClick={onClose} />
              ) : (
                <Button
                  variation={ButtonVariation.PRIMARY}
                  text={getString('rbac.token.rotateLabel')}
                  type="submit"
                  disabled={saving}
                />
              )}
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}

export default RotateTokenForm
