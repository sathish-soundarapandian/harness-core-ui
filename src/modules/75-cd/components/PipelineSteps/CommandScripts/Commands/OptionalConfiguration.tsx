import React from 'react'
import { get, defaultTo } from 'lodash-es'
import { FieldArray, FormikProps, connect } from 'formik'
import { AllowedTypes, Button, ButtonVariation, FormInput, MultiTypeInputType } from '@harness/uicore'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useStrings } from 'framework/strings'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './CommandEdit.module.scss'

function OptionalConfiguration(props: {
  formik?: FormikProps<any>
  readonly?: boolean
  allowableTypes?: AllowedTypes
  name: string
  readonlyValue: boolean
  disableSelection: boolean
  expressions?: string[]
}): React.ReactElement {
  const { getString } = useStrings()

  const {
    formik,
    readonly,
    allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME],
    name,
    readonlyValue = false,
    disableSelection = false,
    expressions
  } = props

  return (
    <div className={stepCss.stepPanel}>
      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name={name}
          label={getString('connectors.parameters')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          defaultValueToReset={[{ key: '', value: '' }]}
          disableTypeSelection={disableSelection}
          allowedTypes={allowableTypes}
        >
          <FieldArray
            name={name}
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  {defaultTo(get(formik?.values, name), []).map(({ id }: any, i: number) => (
                    <div className={css.headerRow} key={i}>
                      <FormInput.Text
                        name={`${name}[${i}].key`}
                        placeholder={getString('pipeline.keyPlaceholder')}
                        disabled={readonly || readonlyValue}
                        label="Key"
                        className={css.keyField}
                      />
                      <FormInput.MultiTextInput
                        name={`${name}[${i}].value`}
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

export default connect(OptionalConfiguration)
