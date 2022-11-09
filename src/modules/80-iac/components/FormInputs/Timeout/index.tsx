import React from 'react'
import cx from 'classnames'
import { AllowedTypes as MultiTypeAllowedTypes, FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

type TimeoutProps = {
    readonly: boolean
    expressions: string[]
    allowableTypes: MultiTypeAllowedTypes
    value: string
}

const Timeout = ({ readonly, expressions, allowableTypes }: TimeoutProps): JSX.Element => {
    const { getString } = useStrings()
    return (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
            <FormInput.MultiTextInput
                name="timeout"
                label={getString('pipelineSteps.timeoutLabel')}
                placeholder={getString('pipelineSteps.timeoutPlaceholder')}
                multiTextInputProps={{ expressions, allowableTypes }}
                disabled={readonly}
            />
        </div>
    )
}

export default Timeout
