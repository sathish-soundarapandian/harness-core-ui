import React from 'react'
import cx from 'classnames'
import { FormInput } from '@harness/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

type NameInputProps = {
    readonly: boolean
    isNewStep: boolean
    items?: IOptionProps[]
    name: string
    label: string
}

const RadioGroup = ({ name, label, readonly, items = [] }: NameInputProps): JSX.Element => {
    return (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.RadioGroup name={name} label={label} radioGroup={{ inline: true }} items={items} disabled={readonly} />
        </div>
    )
}

export default RadioGroup
