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
import css from './SubmitTicketModalSteps.module.scss'
interface SubmitTicketModalStepTwoProps {
  name: string
  stepName: string
  searchBoxController: any
  resultListController: any
  pageController: any
}
export const SubmitTicketModalStepTwo = (props: StepProps<any> & SubmitTicketModalStepTwoProps) => {
  const { stepName, nextStep, prevStepData, searchBoxController, resultListController, pageController } = props
  const { getString } = useStrings()

  const [state, setState] = useState(searchBoxController.state)

  const [resultsState, setResultsState] = useState(resultListController.state)

  const [pagerState, setPagerState] = useState(pageController.state)

  const [suggestionItems, setSuggestionItems] = useState([])

  useEffect(() => searchBoxController.subscribe(() => setState(searchBoxController.state)), [searchBoxController])

  useEffect(
    () => resultListController.subscribe(() => setResultsState(resultListController.state)),
    [resultListController]
  )

  useEffect(() => pageController.subscribe(() => setPagerState(pageController.state)), [pageController])

  useEffect(() => {
    setSuggestionItems(
      state.suggestions?.map((suggestion: any) => {
        return { label: suggestion.rawValue, value: suggestion.rawValue }
      })
    )
  }, [state.suggestions])

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={defaultInitialValues}
        formName="ticketDetailsForm"
        validationSchema={Yup.object().shape({
          subject: Yup.string().required('Ticket Details are required')
        })}
        onSubmit={val => {
          nextStep?.({ ...prevStepData, val })
        }}
      >
        {() => (
          <Form>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.manifestForm}
            >
              <Layout.Horizontal spacing="medium">
                <FormInput.MultiTypeInput
                  name="subject"
                  placeholder={'Enter the Subject'}
                  label={'Subject'}
                  className={css.inputWidth}
                  selectItems={suggestionItems}
                  useValue
                  multiTypeInputProps={{
                    onChange: (val: any) => {
                      searchBoxController.updateText(val?.value)
                      searchBoxController.submit()
                    },
                    selectProps: {
                      items: suggestionItems,
                      addClearBtn: true
                    }
                  }}
                />
              </Layout.Horizontal>
              <ul>
                {resultsState.results.map((result: any) => {
                  return (
                    <a key={result.uri} href={result.clickUri}>
                      <li>{result.title}</li>
                    </a>
                  )
                })}
              </ul>
              <nav className="pager">
                {pagerState.currentPages.map((page: any) => (
                  <button
                    key={page}
                    disabled={pageController.isCurrentPage(page)}
                    onClick={() => pageController.selectPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </nav>
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

const defaultInitialValues = {
  subject: ''
}
