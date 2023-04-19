import React from 'react'
import { Button, Icon } from '@harness/uicore'
import { TextArea } from '@blueprintjs/core'
import css from './PromptInput.module.scss'

interface PromptInputProps {
  onSubmitPrompt: () => void
  prompt: string
  setPrompt: React.Dispatch<React.SetStateAction<string>>
}
const PromptInput: React.FC<PromptInputProps> = ({ onSubmitPrompt, prompt, setPrompt }) => {
  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setPrompt(event.target.value)
  }

  const onSendInput = () => {
    onSubmitPrompt()
  }

  return (
    <div className={css.input}>
      <TextArea
        className={css.textArea}
        placeholder="Ask Captain Canary about Dashboards..."
        onChange={onChange}
        value={prompt}
        growVertically
      />
      <Button className={css.inputButton} minimal onClick={onSendInput}>
        <Icon name={'pipeline-deploy'} style={{ margin: 0 }} />
      </Button>
    </div>
  )
}

export default PromptInput
