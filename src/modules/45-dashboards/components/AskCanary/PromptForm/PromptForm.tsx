import React from 'react'
import { Container } from '@harness/uicore'
import { useDashboardPrompt } from 'services/custom-dashboards'
import PromptInput from './PromptInput/PromptInput'
import css from './PromptForm.module.scss'

const PromptForm: React.FC = () => {
  const { mutate: sendPrompt } = useDashboardPrompt({})

  const handleSubmitPrompt = (prompt: string): void => {
    console.log(prompt)
    sendPrompt({ prompt })
  }

  return (
    <Container>
      <PromptInput onSubmitPrompt={handleSubmitPrompt} />
    </Container>
  )
}

export default PromptForm
