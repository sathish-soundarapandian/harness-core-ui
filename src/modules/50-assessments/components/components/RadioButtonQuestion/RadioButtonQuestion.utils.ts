import type { RadioButtonGroupProps } from '@harness/uicore/dist/components/RadioButton/RadioButtonGroup'
import type { QuestionResponse } from 'services/assessments'

export function getOptionsForRadioButtonQuestion(
  possibleResponses?: QuestionResponse['possibleResponses']
): RadioButtonGroupProps['options'] {
  let options: RadioButtonGroupProps['options'] = []
  if (Array.isArray(possibleResponses) && possibleResponses.length) {
    options = possibleResponses.map(possibleResponse => {
      const { optionId, optionText } = possibleResponse
      return {
        label: optionText,
        value: optionId
      }
    })
  }
  return options
}
