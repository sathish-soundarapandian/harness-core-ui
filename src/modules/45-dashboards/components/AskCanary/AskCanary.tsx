import React, { useState } from 'react'
import { Dialog } from '@harness/uicore'
import cx from 'classnames'
import IntroBox from './IntroBox/IntroBox'
import PromptForm from './PromptForm/PromptForm'
import css from './AskCanary.module.scss'

const AskCanary: React.FC = () => {
  const [isPromptOpen, setPromptOpen] = useState<boolean>(false)

  return (
    <div className={css.container}>
      <IntroBox onOpenPrompt={() => setPromptOpen(true)} />
      <Dialog
        isOpen={isPromptOpen}
        enforceFocus={false}
        onClose={() => setPromptOpen(false)}
        className={cx(css.promptDialog)}
      >
        <PromptForm />
      </Dialog>
    </div>
  )
}

export default AskCanary
