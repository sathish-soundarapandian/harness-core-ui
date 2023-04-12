import React from 'react'
import ReactMarkdown from 'react-markdown'
import response from './openai-response.json'
import css from './RCA.module.scss'

function OpenAIResponse() {
  const markdownText = response.choices[0].text

  return (
    <div>
      <ReactMarkdown className={css.openAiResponse}>{markdownText}</ReactMarkdown>
    </div>
  )
}

export default OpenAIResponse
