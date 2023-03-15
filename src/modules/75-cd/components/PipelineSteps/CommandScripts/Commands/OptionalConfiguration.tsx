import React from 'react'
import { FieldArray, FormikProps } from 'formik'
import {
  AllowedTypes,
  Button,
  ButtonVariation,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import { v4 as uuid } from 'uuid'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useStrings } from 'framework/strings'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
// import type { HttpStepFormData, HttpStepHeaderConfig, HttpStepOutputVariable } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './CommandEdit.module.scss'

export default function OptionalConfiguration(props: {
  formik: FormikProps<any>
  readonly?: boolean
  allowableTypes?: AllowedTypes
}): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  React.useEffect(() => {
    console.log('expressions', expressions)
  }, [expressions])
  const {
    formik: { values: formValues, setFieldValue },
    readonly,
    allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
  } = props

  return (
    <div className={stepCss.stepPanel}>
      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.parameters"
          label={getString('connectors.parameters')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          defaultValueToReset={[{ key: '', value: '' }]}
          //   disableTypeSelection
          allowedTypes={allowableTypes}
        >
          <FieldArray
            name="spec.parameters"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  {formValues.spec.parameters.map(({ id }: any, i: number) => (
                    <div className={css.headerRow} key={id}>
                      <FormInput.Text
                        name={`spec.parameters[${i}].key`}
                        placeholder={getString('pipeline.keyPlaceholder')}
                        disabled={readonly}
                        label="Key"
                        className={css.keyField}
                      />
                      <FormInput.MultiTextInput
                        name={`spec.parameters[${i}].value`}
                        placeholder={getString('common.valuePlaceholder')}
                        disabled={readonly}
                        multiTextInputProps={{
                          allowableTypes: allowableTypes,
                          expressions,
                          disabled: readonly
                        }}
                        label="Value"
                      />
                      <Button
                        variation={ButtonVariation.ICON}
                        icon="main-trash"
                        data-testid={`remove-parameter-${i}`}
                        onClick={() => remove(i)}
                        disabled={readonly}
                        className={css.deleteBtn}
                      />
                    </div>
                  ))}
                  <Button
                    icon="plus"
                    variation={ButtonVariation.LINK}
                    data-testid="add-header"
                    onClick={() => push({ key: '', value: '' })}
                    disabled={readonly}
                    className={css.addButton}
                  >
                    {getString('add')}
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
      </div>
    </div>
  )
}
