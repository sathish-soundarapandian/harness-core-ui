/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import {
  Dialog,
  Button,
  Layout,
  FormInput,
  Container,
  Text,
  Formik,
  FormikForm,
  PageSpinner,
  ButtonVariation
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { useParams } from 'react-router-dom'
import type { FormikHelpers } from 'formik'
import * as Yup from 'yup'
import type { IDialogProps } from '@blueprintjs/core'
import { NameSchema } from '@common/utils/Validation'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { useStrings } from 'framework/strings'
import { useCreateDelegateToken, CreateDelegateTokenQueryParams } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'

import css from '../DelegateTokens.module.scss'

export interface CreateTokenModalProps {
  onSuccess?: () => void
  onUserAdded?: () => void
}

export interface CreateTokenModalReturn {
  openCreateTokenModal: () => void
  closeCreateTokenModal: () => void
}

interface FormikProps {
  name: string
  tokenValue: string
}

export const useCreateTokenModal = ({ onSuccess }: CreateTokenModalProps): CreateTokenModalReturn => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const modalProps: IDialogProps = {
    isOpen: true,
    title: getString('rbac.token.createLabel'),
    enforceFocus: false,
    style: {
      width: 416,
      height: 368
    }
  }
  const { trackEvent } = useTelemetry()

  const { mutate: createToken, loading } = useCreateDelegateToken({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      tokenName: ''
    } as CreateDelegateTokenQueryParams
  })

  const generatedValuePlaceholder = getString('delegates.tokens.generatedValuePlaceholder')

  const onSubmit = async (values: FormikProps, formikActions: FormikHelpers<any>) => {
    try {
      trackEvent(DelegateActions.SaveCreateToken, {
        category: Category.DELEGATE,
        data: values
      })
      const createTokenResponse = await createToken(undefined, {
        headers: { 'content-type': 'application/json' },
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          tokenName: values?.name?.trim?.()
        } as CreateDelegateTokenQueryParams
      })
      formikActions.setFieldValue('tokenValue', createTokenResponse?.resource?.value || '')
      onSuccess?.()
    } catch (e) {
      /* istanbul ignore next */
      formikActions.setFieldError('name', e.data?.message || e.data?.responseMessages?.[0]?.message)
    }
    return values
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalProps} style={{ height: '100%' }}>
        <>
          {loading ? <PageSpinner /> : null}
          <Formik
            initialValues={{
              name: '',
              tokenValue: generatedValuePlaceholder
            }}
            onSubmit={onSubmit}
            formName="createTokenForm"
            validationSchema={Yup.object().shape({
              name: NameSchema({ requiredErrorMsg: getString('delegates.tokens.tokenNameRequired') }),
              tokenValue: Yup.string()
            })}
          >
            {form => {
              return (
                <FormikForm className={css.addTokenModalForm}>
                  <div className={css.addTokenModalContainer}>
                    <Layout.Vertical>
                      <FormInput.Text name="name" label={getString('name')} />
                      <Container
                        intent="primary"
                        padding="small"
                        font={{
                          align: 'center'
                        }}
                        flex
                        className={css.tokenField}
                      >
                        <Text margin={{ right: 'large' }} font="small" color={Color.BLACK} className={css.tokenValue}>
                          {form.values.tokenValue}
                        </Text>
                        <span className={css.copyContainer}>
                          <CopyToClipboard content={form.values.tokenValue} />
                        </span>
                      </Container>
                    </Layout.Vertical>
                    <Layout.Horizontal spacing="small" className={css.addTokenModalActionContainer}>
                      <Button
                        intent="primary"
                        type="submit"
                        variation={ButtonVariation.PRIMARY}
                        disabled={generatedValuePlaceholder !== form.values.tokenValue}
                      >
                        {getString('common.apply')}
                      </Button>
                      <Button
                        onClick={e => {
                          e.preventDefault()
                          hideModal()
                          trackEvent(DelegateActions.CloseCreateToken, {
                            category: Category.DELEGATE
                          })
                        }}
                        variation={ButtonVariation.TERTIARY}
                      >
                        {generatedValuePlaceholder === form.values.tokenValue
                          ? getString('cancel')
                          : getString('close')}
                      </Button>
                    </Layout.Horizontal>
                  </div>
                </FormikForm>
              )
            }}
          </Formik>
        </>
      </Dialog>
    ),
    [onSuccess]
  )
  const open = useCallback(() => {
    showModal()
  }, [showModal])

  return {
    openCreateTokenModal: open,
    closeCreateTokenModal: hideModal
  }
}
