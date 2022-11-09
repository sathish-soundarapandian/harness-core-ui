import React from 'react'
import type { AllowedTypes as MultiTypeAllowedTypes } from '@harness/uicore'
import NameInput from './FormInputs/NameInput'
import Timeout from './FormInputs/Timeout'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

type NameTimeoutProps = {
    readonly: boolean
    expressions: string[]
    allowableTypes: MultiTypeAllowedTypes
    isNewStep: boolean
    timeout: string
}

const NameTimeout = ({ readonly, expressions, allowableTypes, isNewStep, timeout }: NameTimeoutProps): JSX.Element => {
    return (
        <>
            <NameInput readonly={readonly} isNewStep={isNewStep} />
            <Timeout value={timeout} readonly={readonly} expressions={expressions} allowableTypes={allowableTypes} />
            <div className={stepCss.divider} />
        </>
    )
}

export { NameTimeout }
