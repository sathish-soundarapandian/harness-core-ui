/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, getMultiTypeFromValue, SelectOption } from '@harness/uicore'
import { useFormikContext } from 'formik'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useStrings } from 'framework/strings'
import { getVariableTypeOptions, VariableType } from './ServiceOverridesUtils'

interface ServiceVariableOverrideProps {
  variablesOptions: SelectOption[]
  handleVariableChange: (val: SelectOption) => void
}

function ServiceVariableOverride({
  variablesOptions,
  handleVariableChange
}: ServiceVariableOverrideProps): React.ReactElement {
  const { getString } = useStrings()
  const formikProps = useFormikContext<any>()

  return (
    <>
      <FormInput.Select
        name="variableOverride.name"
        selectProps={{
          allowCreatingNewItems: true
        }}
        items={variablesOptions}
        label={getString('variableNameLabel')}
        placeholder={getString('common.selectName', { name: getString('variableLabel') })}
        onChange={handleVariableChange}
      />
      <FormInput.Select
        name="variableOverride.type"
        items={getVariableTypeOptions(getString)}
        label={getString('typeLabel')}
        placeholder={getString('common.selectName', { name: getString('service') })}
        onChange={() => {
          formikProps.setFieldValue('variableOverride.value', '')
        }}
      />
      {formikProps.values.variableOverride?.type !== VariableType.Secret && (
        <FormInput.MultiTextInput
          className="variableInput"
          name={`variableOverride.value`}
          label={getString('cd.overrideValue')}
          multiTextInputProps={{
            defaultValueToReset: '',
            textProps: {
              type: formikProps.values.variableOverride?.type === VariableType.Number ? 'number' : 'text'
            },
            multitypeInputValue: getMultiTypeFromValue(formikProps.values.variableOverride?.value)
          }}
        />
      )}
      {formikProps.values.variableOverride?.type === VariableType.Secret && (
        <MultiTypeSecretInput name={`variableOverride.value`} label={getString('cd.overrideValue')} isMultiType />
      )}
    </>
  )
}

export default ServiceVariableOverride
