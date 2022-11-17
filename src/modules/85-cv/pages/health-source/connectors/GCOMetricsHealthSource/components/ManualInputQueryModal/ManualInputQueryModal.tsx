/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { object as yupObject, string as yupString } from 'yup'
import { Button, Container, Formik, FormikForm } from '@harness/uicore'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { StringKeys, useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import css from './ManualInputQueryModal.module.scss'

interface UseManualInputQueryModalProps {
  title?: StringKeys
  onSubmit: (values: { metricName: string; identifier: string }) => void
  manuallyInputQueries?: string[]
  closeModal: () => void
}

export const MANUAL_INPUT_QUERY = 'ManualInputQuery'

export const FieldNames = {
  METRIC_NAME: 'metricName',
  IDENTIFIER: 'identifier'
}

const DialogOptions: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: { width: 500 },
  className: 'ManualInputModal'
}

function getValidatitionSchema(getString: UseStringsReturn['getString'], manuallyInputQueries?: string[]) {
  return yupObject().shape({
    [FieldNames.METRIC_NAME]: yupString()
      .required(getString('cv.monitoringSources.metricNameLabel'))
      .test({
        name: 'Ensure that input query is unique',
        test: function (value: string) {
          return manuallyInputQueries?.find(metricName => metricName.toLocaleLowerCase() === value?.toLocaleLowerCase())
            ? this.createError({
                message: getString('cv.monitoringSources.gco.manualInputQueryModal.validation.uniqueMetricName', {
                  metricName: value
                })
              })
            : true
        }
      })
  })
}

export function ManualInputQueryModal(props: UseManualInputQueryModalProps): JSX.Element {
  const { title, onSubmit, manuallyInputQueries, closeModal } = props
  const { getString } = useStrings()
  return (
    <Dialog
      {...DialogOptions}
      onClose={closeModal}
      title={getString(title || 'cv.monitoringSources.gco.manualInputQueryModal.modalTitle')}
    >
      <Container className={css.main}>
        <Formik
          onSubmit={values => {
            onSubmit(values)
            closeModal()
          }}
          formName="manualInputQuery"
          initialValues={{ metricName: '', identifier: '' }}
          validationSchema={getValidatitionSchema(getString, manuallyInputQueries)}
        >
          <FormikForm className={css.form}>
            <NameId
              nameLabel={getString('cv.monitoringSources.metricNameLabel')}
              identifierProps={{
                inputName: FieldNames.METRIC_NAME,
                idName: FieldNames.IDENTIFIER
              }}
            />

            <Container className={css.buttonContainer}>
              <Button onClick={() => closeModal()}>{getString('cancel')}</Button>
              <Button type="submit" intent="primary">
                {getString('submit')}
              </Button>
            </Container>
          </FormikForm>
        </Formik>
      </Container>
    </Dialog>
  )
}
