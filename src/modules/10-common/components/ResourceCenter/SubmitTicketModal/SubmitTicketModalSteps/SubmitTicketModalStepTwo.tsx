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
// eslint-disable-next-line no-restricted-imports
import ProjectsEmptyState from '@projects-orgs/pages/projects/projects-empty-state.png'
import SuggestionsPanel from './SuggestionsPanel'
import css from './SubmitTicketModalSteps.module.scss'
interface SubmitTicketModalStepTwoProps {
  name: string
  stepName: string
  searchBoxController: any
  resultListController: any
}
export const SubmitTicketModalStepTwo = (props: StepProps<any> & SubmitTicketModalStepTwoProps) => {
  const { stepName, nextStep, prevStepData, searchBoxController, resultListController } = props
  const { getString } = useStrings()

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

  // clearing the redux store on load of the component
  useEffect(() => {
    searchBoxController.updateText('')
    searchBoxController.submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={defaultInitialValues}
        formName="ticketDetailsForm"
        validationSchema={Yup.object().shape({
          issueType: Yup.string().required('Issue Type is required'),
          priority: Yup.string().required('Priority is required'),
          subject: Yup.string().required('Ticket Details are required')
        })}
        onSubmit={val => {
          nextStep?.({ ...prevStepData, val })
        }}
      >
        {() => (
          <Form>
            <Layout.Horizontal>
              <Layout.Vertical flex={{ alignItems: 'flex-start' }} style={{ width: '40%' }}>
                <Layout.Horizontal spacing="medium">
                  <FormInput.Select
                    name="issueType"
                    className={css.inputWidth}
                    items={issueTypes}
                    placeholder={'Select Issue Type'}
                    label={'Issue Type'}
                  />
                </Layout.Horizontal>
                <Layout.Horizontal spacing="medium">
                  <FormInput.Select
                    name="priority"
                    className={css.inputWidth}
                    items={priorityItems}
                    placeholder={'Select Priority'}
                    label={'Priority'}
                  />
                </Layout.Horizontal>
                <Layout.Horizontal spacing="medium">
                  <FormInput.Select
                    name="subject"
                    placeholder={'Enter the Subject'}
                    label={'Subject'}
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
                </Layout.Horizontal>
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  className={css.saveBtn}
                />
              </Layout.Vertical>
              <Layout.Vertical className={css.preview}>
                {state.value.length > 0 ? (
                  <SuggestionsPanel data={resultsState.results} />
                ) : (
                  <Layout.Vertical width="100%" padding="huge" flex={{ align: 'center-center' }}>
                    <img src={ProjectsEmptyState} className={css.img} />
                  </Layout.Vertical>
                )}
              </Layout.Vertical>
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

const defaultInitialValues = {
  issueType: '',
  priority: '',
  subject: ''
}

const issueTypes = [{ label: 'Bug', value: 'bug' }]
const priorityItems = [
  { label: 'P0', value: 'p0' },
  { label: 'P1', value: 'p1' }
]
