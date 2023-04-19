import React from 'react'
import { Button, ButtonVariation } from '@harness/uicore'
import css from './ExamplePrompt.module.scss'

interface ExamplePromptProps {
  minHeight: number
  prompt: string
  setPrompt: (prompt: string) => void
}
const ExamplePrompt: React.FC<ExamplePromptProps> = ({ minHeight, prompt, setPrompt }) => {
  const onClickPrompt = (): void => {
    setPrompt(prompt)
  }

  return (
    <div className={css.examplePromptContainer}>
      <div style={{ display: 'grid', gridTemplateRows: `${minHeight}px auto` }}>
        <div className={css.prompt}>{prompt}</div>
        <Button text={'Try it out'} variation={ButtonVariation.SECONDARY} onClick={onClickPrompt} />
      </div>
    </div>
  )
}

export default ExamplePrompt
