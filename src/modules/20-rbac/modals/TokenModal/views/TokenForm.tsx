/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  ModalErrorHandler,
  ButtonVariation,
  DateInput,
  Label,
  Text,
  ModalErrorHandlerProps,
  FormError
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { TokenDTO } from 'services/cd-ng'
import type { ProjectPathProps, ServiceAccountPathProps } from '@common/interfaces/RouteInterfaces'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { getReadableDateTime } from '@common/utils/dateUtils'
import { TokenValueRenderer } from './TokenValueRenderer'
import { getSelectedExpiration, getExpirationDate, getSelectedExpirationDate } from './utils'
import css from '@rbac/modals/TokenModal/useTokenModal.module.scss'

interface TokenFormProps {
  data?: TokenDTO
  apiKeyIdentifier: string
  isEdit?: boolean
  apiKeyType?: TokenDTO['apiKeyType']
  parentIdentifier?: string
  onSubmit: (values: TokenFormData) => Promise<void>
  setModalErrorHandler: ModalErrorHandlerProps['bind']
  onClose?: () => void
  loading?: boolean
  token?: string
}

export interface TokenFormData extends TokenDTO {
  expiryDate: string
  expiry?: string
}

const TokenForm: React.FC<TokenFormProps> = ({
  data: tokenData,
  onSubmit,
  onClose,
  isEdit,
  apiKeyIdentifier,
  apiKeyType = 'SERVICE_ACCOUNT',
  parentIdentifier,
  setModalErrorHandler,
  loading,
  token
}) => {
  const { accountId, orgIdentifier, projectIdentifier, serviceAccountIdentifier } = useParams<
    ProjectPathProps & ServiceAccountPathProps
  >()
  const { getString } = useStrings()

  const expiryOptions = [
    { label: getString('common.30days'), value: '30' },
    { label: getString('common.90days'), value: '90' },
    { label: getString('common.180days'), value: '180' },
    { label: getString('common.repo_provider.customLabel'), value: 'custom' },
    { label: getString('common.noexpiration'), value: '-1' }
  ]

  return (
    <Formik<TokenFormData>
      initialValues={{
        identifier: '',
        name: '',
        description: '',
        tags: {},
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        apiKeyIdentifier,
        parentIdentifier: parentIdentifier || serviceAccountIdentifier,
        apiKeyType: apiKeyType,
        expiry: getSelectedExpiration(tokenData?.validTo),
        expiryDate: getExpirationDate(tokenData?.validTo),
        ...tokenData
      }}
      formName="tokenForm"
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema(),
        expiryDate: Yup.date().min(new Date()).required()
      })}
      onSubmit={values => {
        onSubmit?.(values)
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Container className={cx(css.form, { [css.createTokenForm]: !!token })}>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <NameIdDescriptionTags
                formikProps={formikProps}
                identifierProps={{ isIdentifierEditable: !isEdit && !token }}
              />
              <Layout.Vertical padding={{ top: 'small' }} spacing="medium">
                <Label data-tooltip-id={`tokenForm-{expirationLabel}`}>{getString('common.expiration')}</Label>
                <Layout.Horizontal className={css.alignCenter}>
                  <FormInput.DropDown
                    items={expiryOptions}
                    name="expiry"
                    dropDownProps={{
                      filterable: false,
                      minWidth: 100
                    }}
                    onChange={item => {
                      formikProps.setFieldValue('expiryDate', getSelectedExpirationDate(item.value.toString()))
                    }}
                  />
                  <Layout.Horizontal padding={{ left: 'medium' }}>
                    {formikProps.values.expiry === 'custom' ? (
                      <Layout.Vertical>
                        <DateInput
                          value={formikProps.values.expiryDate}
                          popoverProps={{
                            position: Position.BOTTOM,
                            usePortal: true
                          }}
                          onChange={value => {
                            formikProps.setFieldValue(
                              'expiryDate',
                              value ? getReadableDateTime(parseInt(value.toString()), 'MM/DD/YYYY') : ''
                            )
                          }}
                        />
                        {formikProps.errors.expiryDate && (
                          <FormError errorMessage={getString('rbac.token.form.dateRequired')} name={'expiryDate'} />
                        )}
                      </Layout.Vertical>
                    ) : formikProps.values.expiry !== '-1' ? (
                      <Text font="small" margin={{ bottom: 'medium' }}>
                        {getString('rbac.token.form.tokenExpiryDisplay', {
                          date: getReadableDateTime(Date.parse(formikProps.values.expiryDate), 'dddd, MMMM D YYYY')
                        })}
                      </Text>
                    ) : null}
                  </Layout.Horizontal>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Container>
            {token ? (
              <Layout.Vertical spacing="medium">
                <TokenValueRenderer token={token} textInputClass={css.tokenValue} copyTextClass={css.copy} />
                <Button text={getString('close')} onClick={onClose} variation={ButtonVariation.TERTIARY} />
              </Layout.Vertical>
            ) : (
              <Layout.Horizontal spacing="small">
                <Button
                  variation={ButtonVariation.PRIMARY}
                  text={isEdit ? getString('save') : getString('rbac.generateToken')}
                  type="submit"
                  disabled={loading}
                />
                <Button text={getString('cancel')} onClick={onClose} variation={ButtonVariation.TERTIARY} />
              </Layout.Horizontal>
            )}
          </Form>
        )
      }}
    </Formik>
  )
}

export default TokenForm
