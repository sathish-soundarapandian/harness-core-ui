export interface AssessmentsForm {
  userResponse: FormatedResponse
}

export interface FormatedResponse {
  [sectionId: string]: { [index: string]: string[] }
}

export interface SectionDetails {
  id: string
  name: string
  questionIds: string[]
}
