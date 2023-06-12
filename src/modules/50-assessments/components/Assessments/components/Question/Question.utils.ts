import type { OptionResponse, QuestionResponse } from 'services/assessments'

export interface QuestionOptions {
  option: OptionResponse
  sequence: string
}

export const getOptionsForQuestion = (possibleResponses?: QuestionResponse['possibleResponses']): QuestionOptions[] => {
  let options: QuestionOptions[] = []
  let sequenceNo = 64
  if (Array.isArray(possibleResponses) && possibleResponses.length) {
    options = possibleResponses.map(option => {
      sequenceNo = sequenceNo + 1
      return {
        option,
        sequence: String.fromCharCode(sequenceNo)
      }
    })
  }
  return options
}
