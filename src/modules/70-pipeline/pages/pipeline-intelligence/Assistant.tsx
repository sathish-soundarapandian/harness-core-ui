import React from 'react'
import {
  Color,
  FontVariation,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Layout,
  PageSpinner,
  Text
} from '@harness/uicore'
import { noop } from 'lodash-es'
import { useGetTemplates } from 'services/pipeline-ng'

import css from '@freeze-windows/components/FreezeWindowStudioBody/FreezeWindowStudioBody.module.scss'
import { Spinner } from '@blueprintjs/core'

function PrettyText({ text }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: text
      }}
    />
  )
}

function prettyRender(text) {
  if (!text) return ''
  text = text.replace(/\s{2,}/g, ' ').trim()
  text = text.replace(/(\*{1,3})\s+/g, '$1')
  text = text.replace(/\s+(\*{1,3})/g, '$1')
  text = text.replace(/(\|)\s+/g, '$1')
  text = text.replace(/\s+(\|)/g, '$1')
  text = text.replace(/\n/g, ' ')
  text = text.replace(/(\.)(\s+)(\w)/g, '$1\n\n$3')
  text = text.replace(/(\:)(\s+)(\|)/g, '$1\n\n$3')
  text = text.replace(/(Reference:)/g, '\n\n$1')
  text = text.replace(/(See the following:)/g, '\n\n$1')
  text = text.replace(/(\#\s+Before You Begin)/g, '\n\n$1')
  text = text.replace(/(\#\#\s+Stages)/g, '\n\n$1')
  text = text.replace(/(\#\#\s+Pipelines)/g, '\n\n$1')
  text = text.replace(/(http(s)?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')
  return text
}
export default function Assistant(props) {
  const [query, setQuery] = React.useState('')
  const [questionAndAnswers, setQuestionAndAnswers] = React.useState([
    { question: 'Who are you', answer: 'I am Harness Assistant' }
  ])

  const { data, refetch, loading } = useGetTemplates({
    queryParams: {
      query: ''
    },
    lazy: true
  })

  React.useEffect(() => {
    if (!loading) {
      setQuestionAndAnswers(items => [
        ...items.slice(0, -1),
        { question: items.at(-1).question, answer: prettyRender(data?.data) || items.at(-1).answer }
      ])
    }
  }, [loading])

  const askQuestion = question => {
    // Make API call here
    refetch({ queryParams: { query: question } })

    setQuestionAndAnswers(items => [...items, { question, loading: true }])
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
                    {qNa.loading ? (
                      <Spinner size={16} className={css.spinnerAssistant} />
                    ) : (
                      <Text
                        style={{ whiteSpace: 'pre-line' }}
                        color={Color.GREY_1000}
                        font={{ size: 'medium', weight: '500' }}
                        margin={{ top: '5px' }}
                      >
                        <PrettyText text={qNa.answer} />
                      </Text>
                    )}
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
