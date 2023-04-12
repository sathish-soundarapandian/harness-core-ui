import React from 'react'
import { Color, FontVariation, Formik, FormikForm, FormInput, Heading, Layout, Text } from '@harness/uicore'
import { noop } from 'lodash-es'

import css from '@freeze-windows/components/FreezeWindowStudioBody/FreezeWindowStudioBody.module.scss'

export default function Assistant(props) {
  const [query, setQuery] = React.useState('')
  const [questionAndAnswers, setQuestionAndAnswers] = React.useState([
    { question: 'Who are you', answer: 'I am Harness Assistant' },
    { question: 'Which technology you use', answer: 'GPT' }
  ])

  const askQuestion = question => {
    // Make API call here
    setQuestionAndAnswers(items => [...items, { question, answer: 'This is Answer from API' }])
    setQuery('')
  }

  return (
    <Layout.Vertical
      flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
      style={{
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <Formik enableReinitialize onSubmit={noop} formName={'Standardization'} initialValues={{ question: query }}>
        {formikProps => {
          return (
            <FormikForm
              onKeyDown={keyEvent => {
                if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
                  if (keyEvent.shiftKey || formikProps.values.question?.trim() === '') {
                    return
                  }
                  askQuestion(formikProps.values.question)
                  // make API call here
                }
              }}
            >
              {questionAndAnswers.map(qNa => {
                return (
                  <Layout.Vertical margin={{ bottom: 'medium' }}>
                    <Text style={{ whiteSpace: 'pre-line' }}>{qNa.question}</Text>
                    <Text
                      style={{ whiteSpace: 'pre-line' }}
                      color={Color.GREY_1000}
                      font={{ size: 'medium', weight: '500' }}
                      margin={{ top: '5px' }}
                    >
                      {qNa.answer}
                    </Text>
                  </Layout.Vertical>
                )
              })}
              <FormInput.TextArea
                value={query.trim() ? query : ''}
                onChange={e => {
                  setQuery(e.target.value)
                }}
                className={css.assistantInputText}
                name={'question'}
                placeholder={'How can I help you'}
                maxLength={16000}
                textArea={{
                  style: { minWidth: 400 }
                }}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
