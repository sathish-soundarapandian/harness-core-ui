/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect, FormikContextType } from 'formik'
import { get } from 'lodash-es'
import { errorCheck } from '@common/utils/formikHelpers'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ConnectorReferenceFieldProps, ConnectorReferenceField } from './ConnectorReferenceField'
export interface FormConnectorFieldProps extends Omit<ConnectorReferenceFieldProps, 'onChange' | 'error'> {
  formik?: FormikContextType<any>
}

const FormConnectorReference = (props: FormConnectorFieldProps): React.ReactElement => {
  const { name, formik, placeholder, disabled, ...restProps } = props
  const hasError = errorCheck(name, formik)
  const error = hasError ? get(formik?.errors, name) : undefined

  const selected = get(formik?.values, name, '')

  return (
    <ConnectorReferenceField
      {...restProps}
      name={name}
      placeholder={placeholder}
      selected={selected as ConnectorReferenceFieldProps['selected']}
      onChange={(record, scope) => {
        formik?.setFieldValue(
          name,
          scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record?.identifier}` : record?.identifier
        )
      }}
      error={error as string}
      disabled={disabled}
    />
  )
}

export const FormConnectorReferenceField = connect(FormConnectorReference)
