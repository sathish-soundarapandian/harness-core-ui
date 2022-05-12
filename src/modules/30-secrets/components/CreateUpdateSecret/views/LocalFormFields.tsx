/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode } from 'react'
import { FormInput } from '@wings-software/uicore'
import type { FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'

import type { SecretDTOV2 } from 'services/cd-ng'

interface LocalFormFieldsProps {
  type: SecretDTOV2['type']
  editing: boolean
  disableAutocomplete?: boolean
}

interface FormikContextProps<T> {
  formik?: FormikContextType<T>
}

const LocalFormFields: React.FC<LocalFormFieldsProps & FormikContextProps<any>> = ({
  editing,
  type,
  disableAutocomplete
}) => {
  const { getString } = useStrings()

  const renderHiddenInputs = (): ReactNode => {
    // Rendering these inputs to avoid autocomplete.
    return (
      <>
        <input type="text" style={{ display: 'none' }} />
        <input type="password" style={{ display: 'none' }} />
      </>
    )
  }

  return (
    <>
      {disableAutocomplete ? renderHiddenInputs() : null}
      {type === 'SecretText' ? (
        <FormInput.Text
          name="value"
          label={getString('secrets.labelValue')}
          placeholder={editing ? getString('encrypted') : getString('secrets.secret.placeholderSecretValue')}
          inputGroup={{ type: 'password' }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            event.target.value.trim()
          }}
        />
      ) : null}
      {type === 'SecretFile' ? (
        <FormInput.FileInput name="file" label={getString('secrets.secret.labelSecretFile')} multiple />
      ) : null}
      <FormInput.TextArea name="description" isOptional={true} label={getString('description')} />
      <FormInput.KVTagInput name="tags" isOptional={true} label={getString('tagsLabel')} />
    </>
  )
}

export default LocalFormFields
