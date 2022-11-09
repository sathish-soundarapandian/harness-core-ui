import React from 'react'
import cx from 'classnames'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'
import { ConfigureOptions, ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/ConfigureOptions'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

type NameInputProps = {
    readonly: boolean
    name: string
    expressions: string[]
    allowableTypes: AllowedTypes
    placeholder: string
    label: string
    value?: string
    setFieldValue: (inputName: string, value: string) => void
}

const MultiTextInput = ({
    name,
    placeholder,
    label,
    readonly,
    expressions,
    allowableTypes,
    value,
    setFieldValue
}: NameInputProps): JSX.Element => {
    return (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
            <FormInput.MultiTextInput
                name={name}
                placeholder={placeholder}
                label={label}
                multiTextInputProps={{ expressions, allowableTypes }}
                disabled={readonly}
            />
            {getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                    value={value as string}
                    type="String"
                    variableName={name}
                    showRequiredField={false}
                    showDefaultField={false}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                    showAdvanced={true}
                    onChange={data => setFieldValue(name, data)}
                    isReadonly={readonly}
                />
            )}
        </div>
    )
}

export default MultiTextInput
