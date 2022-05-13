/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import type { FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import { Validation, VariableFormData } from '@variables/utils/VariablesUtils'
import AllowedValuesField from '../AllowedValues/AllowedValuesField'

interface VariableValidationProps {
  formik: FormikContextType<VariableFormData>
}

const VariableValidation: React.FC<VariableValidationProps> = props => {
  const { getString } = useStrings()
  return (
    <>
      <FormInput.RadioGroup
        radioGroup={{ inline: true }}
        name="valueType"
        label={getString('common.configureOptions.validation')}
        items={[
          { label: getString('inputTypes.FIXED'), value: Validation.FIXED }
          // enable when BE adds support
          // { label: getString('allowedValues'), value: Validation.FIXED_SET, disabled: true },
          // { label: getString('common.configureOptions.regex'), value: Validation.REGEX, disabled: true }
        ]}
      />
      {props.formik.values.valueType === Validation.FIXED ? (
        <FormInput.Text name="fixedValue" label="Fixed Value" />
      ) : null}
      {props.formik.values.valueType === Validation.FIXED_SET ? <AllowedValuesField /> : null}
      {props.formik.values.valueType === Validation.REGEX ? (
        <FormInput.TextArea label={getString('common.configureOptions.regex')} name="regExValues" />
      ) : null}
    </>
  )
}

export default VariableValidation
