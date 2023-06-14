import React from 'react'
import { Button, ButtonVariation } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { AssessmentsForm } from '@assessments/interfaces/Assessments'
import { isAllAnswered } from './SubmitButton.utils'

export default function SubmitButton(): JSX.Element {
  const { submitForm, values } = useFormikContext<AssessmentsForm>()
  const { getString } = useStrings()
  const isValid = isAllAnswered(values)
  return (
    <div>
      {isValid && (
        <Button
          rightIcon="chevron-right"
          variation={ButtonVariation.SECONDARY}
          text={getString('assessments.viewResults')}
          data-testid="questionSubmitButton"
          onClick={event => {
            event.preventDefault()
            submitForm && submitForm()
          }}
        />
      )}
    </div>
  )
}
