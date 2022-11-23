/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog, Classes } from '@blueprintjs/core'
import { Formik, Layout, ThumbnailSelect, Label, Button, Container } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { useToaster } from '@common/exports'
import { NameIdDescriptionTags, PageSpinner } from '@common/components'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import { useStrings } from 'framework/strings'
import { useCreateEnvironmentV2, useUpsertEnvironmentV2, EnvironmentResponseDTO } from 'services/cd-ng'
import type { HarnessEnvironmentModalProps } from './HarnessEnvironmentModal.types'

export const HarnessEnvironmentModal: React.FC<HarnessEnvironmentModalProps> = ({
  isEdit,
  data,
  isEnvironment,
  formik,
  onCreateOrUpdate,
  closeModal
}) => {
  const { getString } = useStrings()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()

  const { loading: createLoading, mutate: createEnvironment } = useCreateEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { loading: updateLoading, mutate: updateEnvironment } = useUpsertEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { showSuccess, showError, clear } = useToaster()

  const onSubmit = React.useCallback(
    async (values: Required<EnvironmentResponseDTO>) => {
      try {
        if (isEdit && !isEnvironment) {
          const response = await updateEnvironment({
            ...omit(values, 'accountId', 'deleted'),
            orgIdentifier,
            projectIdentifier
          })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('common.environmentUpdated'))
            formik?.setFieldValue('environmentRef', values.identifier)
            onCreateOrUpdate(values)
          }
        } else {
          const response = await createEnvironment({ ...values, orgIdentifier, projectIdentifier })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('common.environmentCreated'))
            formik?.setFieldValue('environmentRef', values.identifier)
            onCreateOrUpdate(values)
          }
        }
      } catch (e) {
        showError(e?.data?.message || e?.message || getString('commonError'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCreateOrUpdate, orgIdentifier, projectIdentifier, isEdit, isEnvironment]
  )
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const typeList: { label: string; value: string }[] = [
    {
      label: getString('production'),
      value: 'Production'
    },
    {
      label: getString('nonProduction'),
      value: 'PreProduction'
    }
  ]

  if (createLoading || updateLoading) {
    return <PageSpinner />
  }
  return (
    <Layout.Vertical>
      <Formik<Required<EnvironmentResponseDTO>>
        initialValues={data as Required<EnvironmentResponseDTO>}
        enableReinitialize={false}
        formName="deployEnv"
        onSubmit={values => {
          onSubmit(values)
        }}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString?.('fieldRequired', { field: 'Environment' }) }),
          type: Yup.string().required(getString?.('fieldRequired', { field: 'Type' })),
          identifier: IdentifierSchema()
        })}
      >
        {formikProps => (
          <Layout.Vertical
            onKeyDown={e => {
              if (e.key === 'Enter') {
                formikProps.handleSubmit()
              }
            }}
          >
            <NameIdDescriptionTags
              formikProps={formikProps}
              identifierProps={{
                inputLabel: getString('name'),
                inputGroupProps: {
                  inputGroup: {
                    inputRef: ref => (inputRef.current = ref)
                  }
                },
                isIdentifierEditable: !isEdit
              }}
            />
            <Layout.Vertical spacing={'small'} style={{ marginBottom: 'var(--spacing-medium)' }}>
              <Label style={{ fontSize: 13, fontWeight: 'normal' }}>{getString('envType')}</Label>
              <ThumbnailSelect name={'type'} items={typeList} />
            </Layout.Vertical>
            <Container padding={{ top: 'xlarge' }}>
              <Button
                data-id="environment-save"
                onClick={() => formikProps.submitForm()}
                intent="primary"
                text={getString('save')}
              />
              &nbsp; &nbsp;
              <Button text={getString('cancel')} onClick={closeModal} />
            </Container>
          </Layout.Vertical>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export const useHarnessEnvironmentModal = (
  props: HarnessEnvironmentModalProps
): { openHarnessEnvironmentModal: () => void; closeHarnessEnvironmentModal: () => void } => {
  const { getString } = useStrings()
  const { data, isEnvironment, isEdit, formik, onClose, onCreateOrUpdate, className, modalTitle } = props
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        title={modalTitle || getString('newEnvironment')}
        onClose={hideModal}
        enforceFocus={false}
        className={cx('padded-dialog', className, Classes.DIALOG)}
      >
        <HarnessEnvironmentModal
          data={data}
          isEdit={isEdit}
          formik={formik}
          isEnvironment={isEnvironment}
          onCreateOrUpdate={onCreateOrUpdate}
          closeModal={onClose ? onClose : hideModal}
        />
      </Dialog>
    ),
    []
  )
  return {
    openHarnessEnvironmentModal: showModal,
    closeHarnessEnvironmentModal: hideModal
  }
}
