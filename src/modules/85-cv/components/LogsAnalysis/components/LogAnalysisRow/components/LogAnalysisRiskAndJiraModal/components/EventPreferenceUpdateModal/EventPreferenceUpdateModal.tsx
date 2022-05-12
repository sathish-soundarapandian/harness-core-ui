// import React from 'react'
// import type { IDialogProps } from '@blueprintjs/core'
// import { Dialog, Button, Formik, FormikForm, FormInput, Text, Container, FontVariation, Color } from '@harness/uicore'
// import { useModalHook } from '@harness/use-modal'
// import { useStrings } from 'framework/strings'
// import {
//   EventPreferenceForm,
//   EventPreferenceFormFieldNames,
//   EventPreferenceUpdateModalReturn,
//   UseEventPreferenceUpdateModalProps
// } from './EventPreferenceUpdateModal.type'
// import {
//   eventPreferenceFormInitialValues,
//   EventPreferenceFormValidation,
//   eventPriorities
// } from './EventPreferenceUpdateModal.utils'
// import css from './EventPreferenceUpdateModal.module.scss'

// const useEventPreferenceUpdateModal = (props: UseEventPreferenceUpdateModalProps): EventPreferenceUpdateModalReturn => {
//   const { getString } = useStrings()

//   const { onSubmitOfEventPreferenceEdit } = props

//   const modalPropsLight: IDialogProps = {
//     isOpen: true,
//     usePortal: true,
//     autoFocus: true,
//     canEscapeKeyClose: true,
//     canOutsideClickClose: false,
//     isCloseButtonShown: false,
//     enforceFocus: false,
//     title: getString('pipeline.verification.logs.eventPreference'),
//     style: { width: 600, height: 'fit-content', padding: '24px' }
//   }

//   const [openModal, hideModal] = useModalHook(() => (
//     <Dialog onClose={hideModal} {...modalPropsLight}>
//       <Formik<EventPreferenceForm>
//         formName="eventPreference"
//         initialValues={eventPreferenceFormInitialValues}
//         onSubmit={formValues => {
//           onSubmitOfEventPreferenceEdit(formValues)
//         }}
//         validate={values => EventPreferenceFormValidation(values, getString)}
//       >
//         {formikProps => {
//           return (
//             <FormikForm>
//               <FormInput.CheckBox
//                 onChange={e => {
//                   if (e.currentTarget.checked) {
//                     formikProps.values.priority = null
//                   }
//                 }}
//                 name="isNotARisk"
//                 label={getString('pipeline.verification.logs.notARiskLabel')}
//               />

//               <div className={css.separator} />

//               {!formikProps.values.isNotARisk && (
//                 <FormInput.RadioGroup
//                   name="priority"
//                   label={getString('pipeline.verification.logs.eventPriorityLabel')}
//                   items={eventPriorities.map(priority => ({
//                     label: <Text>{priority}</Text>,
//                     value: priority
//                   }))}
//                   className={css.priorityRadioGroup}
//                   // onChange={val => {
//                   //   if (val.currentTarget.value === formikProps.values[EventPreferenceFormFieldNames.PRIORITY]) {
//                   //     formikProps.values.priority = null
//                   //   }
//                   // }}
//                 />
//               )}
//               {formikProps.errors[EventPreferenceFormFieldNames.IS_NOT_A_RISK] &&
//                 formikProps.touched[EventPreferenceFormFieldNames.PRIORITY] && (
//                   <Text
//                     icon="circle-cross"
//                     iconProps={{ color: Color.RED_500, size: 12 }}
//                     className={css.errorText}
//                     font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}
//                   >
//                     {getString('cv.logs.priorityOrRiskSelectionRequired')}
//                   </Text>
//                 )}
//               <FormInput.TextArea className={css.reasonTextArea} name="reason" label={getString('reason')} />
//               <Container padding={{ bottom: 'small' }}>
//                 <Button
//                   // disabled={!formikProps.isValid}
//                   text={getString('submit')}
//                   margin={{ right: 'small' }}
//                   type="submit"
//                   intent="primary"
//                 />
//                 <Button text={getString('cancel')} onClick={hideModal} />
//               </Container>
//             </FormikForm>
//           )
//         }}
//       </Formik>
//     </Dialog>
//   ))

//   return { openEventPreferenceEditModal: openModal, closeEventPreferenceEditModal: hideModal }
// }

// export default useEventPreferenceUpdateModal
