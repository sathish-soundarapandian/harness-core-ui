import React, { useState } from 'react'
import cx from 'classnames'
import css from './DocsChat.module.scss'
import { Button, ButtonVariation, Layout } from '@harness/uicore'

interface Message {
  author: 'harness' | 'user'
  text: string
  timestamp: number
}

const sampleMessages: Array<Message> = [
  {
    author: 'user',
    text: 'What can Harness do for me',
    timestamp: Date.now()
  },
  {
    author: 'harness',
    text: 'Dont ask what Harness can do for you.',
    timestamp: Date.now()
  },
  {
    author: 'harness',
    text: 'Ask what you can do for Harness.',
    timestamp: Date.now()
  },
  {
    author: 'user',
    text: 'lol',
    timestamp: Date.now()
  }
]

function DocsChat(): JSX.Element {
  const [messages, setMessages] = useState<Array<Message>>(sampleMessages)
  const [userInput, setUserInput] = useState('')

  const handleUserInput = e => {
    setUserInput(e.target.value)
  }
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    const userMessage = userInput.trim()

    if (!userMessage) return

    const newMessages = [
      ...messages,
      {
        author: 'user',
        text: userMessage,
        timestamp: Date.now()
      } as Message
    ]
    setMessages(newMessages)
    setUserInput('')
  }

  return (
    <div className={css.container}>
      <div className={css.messagesContainer}>
        {messages.map(message => {
          return (
            <div
              key={message.text}
              className={cx(css.messageContainer, {
                [css.right]: message.author === 'harness',
                [css.left]: message.author === 'user'
              })}
            >
              <div
                className={cx(css.message, {
                  [css.harness]: message.author === 'harness',
                  [css.user]: message.author === 'user'
                })}
              >
                {message.text}
              </div>
            </div>
          )
        })}
      </div>
      <div className={css.inputContainer}>
        <form onSubmit={handleSubmit}>
          <Layout.Horizontal spacing="small">
            <textarea name="user-input" className={css.input} value={userInput} onChange={handleUserInput} />
            <Button type="submit" variation={ButtonVariation.SECONDARY} icon="fat-arrow-up" />
          </Layout.Horizontal>
        </form>
      </div>
    </div>
  )
}

export default DocsChat
