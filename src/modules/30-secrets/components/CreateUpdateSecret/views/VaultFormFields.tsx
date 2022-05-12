/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@wings-software/uicore'
import type { FormikContextType } from 'formik'
import type { SecretDTOV2 } from 'services/cd-ng'

import { useStrings } from 'framework/strings'

interface VaultFormFieldsProps {
  type: SecretDTOV2['type']
  readonly?: boolean
  editing: boolean
}

interface FormikContextProps<T> {
  formik?: FormikContextType<T>
}

const VaultFormFields: React.FC<VaultFormFieldsProps & FormikContextProps<any>> = ({
  formik,
  type,
  editing,
  readonly
}) => {
  const { getString } = useStrings()
  return (
    <>
      {type === 'SecretText' ? (
        <>
          <FormInput.RadioGroup
            name="valueType"
            radioGroup={{ inline: true }}
            items={[
              { label: getString('secrets.secret.inlineSecret'), value: 'Inline', disabled: readonly },
              { label: getString('secrets.secret.referenceSecret'), value: 'Reference' }
            ]}
          />
          {formik?.values['valueType'] === 'Inline' ? (
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
          {formik?.values['valueType'] === 'Reference' ? (
            <FormInput.Text
              name="value"
              label={getString('secrets.secret.labelSecretReference')}
              placeholder={getString('secrets.secret.placeholderSecretReference')}
            />
          ) : null}
        </>
      ) : null}
      {type === 'SecretFile' ? (
        <FormInput.FileInput name="file" label={getString('secrets.secret.labelSecretFile')} multiple />
      ) : null}
      <FormInput.TextArea name="description" isOptional={true} label={getString('description')} />
      <FormInput.KVTagInput name="tags" isOptional={true} label={getString('tagsLabel')} />
    </>
  )
}

export default VaultFormFields
