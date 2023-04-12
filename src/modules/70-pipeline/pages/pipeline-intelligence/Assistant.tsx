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
  if (!text) {
    return ''
  }

  // Remove initial "Answer: "
  text = text.trim().replace(/^Answer: /, '')

  // Convert Markdown-style links to HTML links
  text = text.replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

  // Split text into lines and trim each line
  const lines = text.split('\n').map(line => line.trim())

  // Initialize an array to hold the formatted output
  const formattedLines = []

  // Iterate through the lines and format them
  lines.forEach((line, index) => {
    if (line.startsWith('#')) {
      // Format headings
      const level = line.lastIndexOf('#') + 1
      const headingText = line.slice(level).trim()
      formattedLines.push(`<h${level}>${headingText}</h${level}>`)
    } else if (line.startsWith('*')) {
      // Format lists
      const listItem = line.replace(/^\*/, '').trim()
      if (index === 0 || !lines[index - 1].startsWith('*')) {
        formattedLines.push('<ul>')
      }
      formattedLines.push(`<li>${listItem}</li>`)
      if (index === lines.length - 1 || !lines[index + 1].startsWith('*')) {
        formattedLines.push('</ul>')
      }
    } else if (line.startsWith('|')) {
      // Format tables
      const tableCells = line.split('|').map(cell => cell.trim())
      if (index === 0 || !lines[index - 1].startsWith('|')) {
        formattedLines.push('<table>')
      }
      formattedLines.push('<tr>')
      tableCells.forEach((cell, cellIndex) => {
        if (cell) {
          formattedLines.push(`<td>${cell}</td>`)
        }
      })
      formattedLines.push('</tr>')
      if (index === lines.length - 1 || !lines[index + 1].startsWith('|')) {
        formattedLines.push('</table>')
      }
    } else if (line) {
      // Format paragraphs
      formattedLines.push(`<p>${line}</p>`)
    }
  })

  // Join the formatted lines to get the final output
  const prettyText = formattedLines.join('\n')

  return prettyText
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
                  keyEvent.stopPropagation()
                  keyEvent.preventDefault()
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
