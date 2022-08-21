/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, MultiTypeInputType } from '@wings-software/uicore'
import type { FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'

import type { JsonNode, SecretDTOV2 } from 'services/cd-ng'
import { ScriptVariablesRuntimeInput } from '@common/components/ScriptVariableRuntimeInput/ScriptVariablesRuntimeInput'
import css from './CustomFormFields.module.scss'

interface CustomFormFieldsProps {
  type: SecretDTOV2['type']
  readonly?: boolean
  templateInputSets: JsonNode
}

interface FormikContextProps<T> {
  formikProps?: FormikContextType<T>
}

const CustomFormFields: React.FC<CustomFormFieldsProps & FormikContextProps<any>> = ({ templateInputSets }) => {
  const { getString } = useStrings()
  return (
    <>
      <ScriptVariablesRuntimeInput
        allowableTypes={[MultiTypeInputType.FIXED]}
        template={templateInputSets}
        className={css.inputVarWrapper}
      />
      <FormInput.TextArea name="description" isOptional={true} label={getString('description')} />
      <FormInput.KVTagInput name="tags" isOptional={true} label={getString('tagsLabel')} />
    </>
  )
}

export default CustomFormFields
