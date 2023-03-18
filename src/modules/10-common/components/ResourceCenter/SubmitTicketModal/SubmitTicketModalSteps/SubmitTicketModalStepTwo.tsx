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
import { useStrings } from 'framework/strings'
import SuggestionsPanel from './SuggestionsPanel'
import css from './SubmitTicketModalSteps.module.scss'
interface SubmitTicketModalStepTwoProps {
  name: string
  stepName: string
  searchBoxController: any
  resultListController: any
}
export const SubmitTicketModalStepTwo = (props: StepProps<any> & SubmitTicketModalStepTwoProps) => {
  const { stepName, nextStep, searchBoxController, resultListController } = props
  const { getString } = useStrings()

  // State Management for coveo controllers

  const [state, setState] = useState(searchBoxController.state)

  const [resultsState, setResultsState] = useState(resultListController.state)

  const [suggestionItems, setSuggestionItems] = useState([])

  // Subscribing to the controller states

  useEffect(() => searchBoxController.subscribe(() => setState(searchBoxController.state)), [searchBoxController])

  useEffect(
    () => resultListController.subscribe(() => setResultsState(resultListController.state)),
    [resultListController]
  )

  useEffect(() => {
    setSuggestionItems(
      state.suggestions?.map((suggestion: any) => {
        return { label: suggestion.rawValue, value: suggestion.rawValue }
      })
    )
  }, [state.suggestions])

  return (
    <Layout.Vertical spacing="small" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={{
          subject: ''
        }}
        formName="ticketDetailsForm"
        validationSchema={Yup.object().shape({
          subject: Yup.string().required('Ticket Details are required')
        })}
        onSubmit={val => {
          nextStep?.({ val })
        }}
      >
        {() => (
          <Form>
            <Layout.Vertical>
              <FormInput.Select
                name="subject"
                label={'Ticket Subject'}
                className={css.inputWidth}
                items={suggestionItems}
                onQueryChange={(val: any) => {
                  searchBoxController.updateText(val)
                }}
                onChange={(val: any) => {
                  searchBoxController.updateText(val)
                  searchBoxController.submit()
                }}
              />
              {state.value.length > 0 && <SuggestionsPanel data={resultsState.results} />}
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
