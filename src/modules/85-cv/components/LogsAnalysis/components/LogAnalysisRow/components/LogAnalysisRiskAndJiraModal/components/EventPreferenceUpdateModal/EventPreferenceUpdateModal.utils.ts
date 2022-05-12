// import type { UseStringsReturn } from 'framework/strings'
// import { EventPreferenceForm, EventPreferenceFormFieldNames } from './EventPreferenceUpdateModal.type'

// export const eventPriorities = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5']

// export const eventPreferenceFormInitialValues = {
//   [EventPreferenceFormFieldNames.IS_NOT_A_RISK]: false,
//   [EventPreferenceFormFieldNames.REASON]: '',
//   [EventPreferenceFormFieldNames.PRIORITY]: null
// }

// export function EventPreferenceFormValidation(
//   values: EventPreferenceForm,
//   getString: UseStringsReturn['getString']
// ): Record<string, string> {
//   const requiredErrors: Record<string, string> = {}

//   if (!values[EventPreferenceFormFieldNames.REASON].trim()) {
//     requiredErrors[EventPreferenceFormFieldNames.REASON] = getString('pipeline.verification.logs.reasonRequired')
//   }

//   if (!values[EventPreferenceFormFieldNames.PRIORITY] && !values[EventPreferenceFormFieldNames.IS_NOT_A_RISK]) {
//     requiredErrors[EventPreferenceFormFieldNames.IS_NOT_A_RISK] = getString('cv.logs.priorityOrRiskSelectionRequired')
//   }
//   return requiredErrors
// }
