import React from 'react'
import cx from 'classnames'
import { FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

type NameInputProps = {
  readonly: boolean
  isNewStep: boolean
}

const NameInput = ({ readonly, isNewStep }: NameInputProps): JSX.Element => {
  const { getString } = useStrings()
  return (
    <div className={cx(stepCss.formGroup, stepCss.lg)}>
      <FormInput.InputWithIdentifier
        inputLabel={getString('name')}
        isIdentifierEditable={isNewStep}
        inputGroupProps={{
          disabled: readonly
        }}
      />
    </div>
  )
}

export default NameInput
