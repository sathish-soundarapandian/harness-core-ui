import React from 'react'
import { useFormikContext } from 'formik'
import { FormInput, Layout, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  VariableType,
  labelStringMap
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableUtils'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { ServiceOverrideRowFormState } from '@cd/components/ServiceOverrides/ServiceOverridesUtils'

export function VariableOverrideEditable(): React.ReactElement {
  const { getString } = useStrings()
  const { values } = useFormikContext<ServiceOverrideRowFormState>()
  const variableType = values.variables?.[0]?.type

  return (
    <Layout.Horizontal spacing={'medium'}>
      <FormInput.Select
        name="variables.0.name"
        items={[
          // to be replaced with actual values
          { label: 'var1', value: 'var1' },
          { label: 'var2', value: 'var2' },
          { label: 'var3', value: 'var3' }
        ]}
      />
      <FormInput.Select
        name="variables.0.type"
        items={[
          { label: getString(labelStringMap[VariableType.String]), value: VariableType.String },
          { label: getString(labelStringMap[VariableType.Number]), value: VariableType.Number },
          { label: getString(labelStringMap[VariableType.Secret]), value: VariableType.Secret }
        ]}
      />
      {variableType === VariableType.Secret ? (
        <MultiTypeSecretInput small name={'variables.0.value'} label="" disabled={false} />
      ) : (
        <FormInput.MultiTextInput
          className="variableInput"
          name={'variables.0.value'}
          label=""
          disabled={false}
          multiTextInputProps={{
            mini: true,
            defaultValueToReset: '',
            // btnClassName:
            //   getMultiTypeFromValue(variable.value as string) === MultiTypeInputType.RUNTIME
            //     ? css.runtimeInputButton
            //     : '',
            textProps: {
              // disabled: !initialValues.canAddVariable || readonly,
              type: variableType === VariableType.Number ? 'number' : 'text'
            },
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
          }}
          data-testid="variables-test"
        />
      )}
    </Layout.Horizontal>
  )
}
