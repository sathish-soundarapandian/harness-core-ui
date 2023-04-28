/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Text, Formik, Button, ButtonVariation, StepProps, FormInput } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import React, { useEffect, useState } from 'react'
import { Form } from 'formik'
import { debounce } from 'lodash-es'
import { useStrings } from 'framework/strings'
import SuggestionsPanel from './SuggestionsPanel'
import css from './SubmitTicketModalSteps.module.scss'
interface SubmitTicketModalStepOneProps {
  name: string
  stepName: string
  searchBoxController: any
  resultListController: any
}
export const SubmitTicketModalStepOne = (props: StepProps<any> & SubmitTicketModalStepOneProps): JSX.Element => {
  const { stepName, nextStep, searchBoxController, resultListController } = props
  const { getString } = useStrings()

  // State Management for coveo controllers

  const [, setState] = useState(searchBoxController.state)

  const [resultsState, setResultsState] = useState(resultListController.state)

  const [resultsSuggestions, setResultsSuggestions] = useState([])

  // Subscribing to the controller states

  useEffect(() => {
    // The subscribe method returns a function for unregistering the listener, so you can call unsubscribe to stop listening to state updates
    const unsubscribe = searchBoxController.subscribe(() => setState(searchBoxController.state))

    return unsubscribe
  }, [searchBoxController])

  useEffect(() => {
    const unsubscribe = resultListController.subscribe(() => setResultsState(resultListController.state))

    return unsubscribe
  }, [resultListController])

  const debouncedUpdate = React.useCallback(
    debounce((data: { subject: string }): void => {
      searchBoxController.updateText(data.subject)
      searchBoxController.submit()
    }, 300),
    [searchBoxController]
  )

  useEffect(() => {
    setResultsSuggestions(resultsState.results)
  }, [resultsState.results])

  return (
    <Layout.Vertical spacing="small">
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={{
          subject: ''
        }}
        formName="ticketDetailsForm"
        validate={debouncedUpdate}
        validationSchema={Yup.object().shape({
          subject: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: getString('common.resourceCenter.ticketmenu.ticketDetails')
            })
          )
        })}
        onSubmit={nextStep as () => void}
      >
        {formik => (
          <Form>
            <Layout.Vertical>
              <FormInput.Text
                name="subject"
                label={getString('common.resourceCenter.ticketmenu.ticketSubject')}
                className={css.inputWidth}
              />
              {formik.values.subject && resultsSuggestions.length > 0 ? (
                <SuggestionsPanel data={resultsSuggestions} />
              ) : (
                <div style={{ height: '580px' }} />
              )}
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('continue')}
                rightIcon="chevron-right"
                className={css.saveBtn}
              />
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
