import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { Icon, Layout } from '@harness/uicore'
import css from './DocsChat.module.scss'

interface Message {
  author: 'harness' | 'user'
  text: string
  timestamp?: number
}

const sampleMessages: Array<Message> = [
  {
    author: 'harness',
    text: 'Hi, I can search the Harness Docs for you. How can I help you?',
    timestamp: Date.now()
  }
]

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

const renderText = txt =>
  txt.split(' ').map(part =>
    URL_REGEX.test(part) ? (
      <a href={part} className={css.link} target="_blank" rel="noreferrer">
        {part}{' '}
      </a>
    ) : (
      part + ' '
    )
  )

function DocsChat(): JSX.Element {
  const [messages, setMessages] = useState<Array<Message>>([])
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messageList = useRef<HTMLDivElement>(null)

  const getAnswer = (oldMessages: Array<Message>, query: string): void => {
    setLoading(true)
    fetch(window.getApiBaseUrl('/notifications/api/notifications/harness-bot'), {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        question: query
      })
    })
      .then(res => res.json())
      .then(res => {
        setMessages([
          ...oldMessages,
          {
            author: 'harness',
            text: res?.data?.response || 'Something went wrong'
          } as Message
        ])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // read first set of messages from local if available
  useEffect(() => {
    const _localMessages = sessionStorage.getItem('messages')
    if (!_localMessages) {
      setMessages(sampleMessages)
      return
    }
    try {
      const localMessages = JSON.parse(_localMessages)
      if (localMessages && localMessages.length > 0) {
        setMessages(localMessages)
      } else {
        setMessages(sampleMessages)
      }
    } catch (_err) {
      // something
    }
  }, [])

  useEffect(() => {
    if (messages.length > 1) {
      sessionStorage.setItem('messages', JSON.stringify(messages))
    }
  }, [messages])

  const handleUserInput = e => {
    setUserInput(e.target.value)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && e.metaKey === true) {
      handleSubmit(e)
    }
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    const userMessage = userInput.trim()

    if (!userMessage) return

    const newMessageList = [
      ...messages,
      {
        author: 'user',
        text: userMessage,
        timestamp: Date.now()
      } as Message
    ]
    setMessages(newMessageList)

    getAnswer(newMessageList, userMessage)

    setUserInput('')
  }

  useLayoutEffect(() => {
    messageList.current?.scrollTo(0, messageList.current?.scrollHeight)
  }, [messages])

  const loadingMessage = (
    <div className={cx(css.messageContainer, css.right)}>
      <div className={cx(css.message, css.harness, css.loader)}>
        <div className={css.dotflashing}></div>
      </div>
    </div>
  )

  return (
    <div className={css.container}>
      <div className={css.header}>Harness DocsChat</div>
      <div className={css.messagesContainer} ref={messageList}>
        {messages.map((message, index) => {
          return (
            <div
              key={message.text + index}
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
                {renderText(message.text)}
              </div>
            </div>
          )
        })}
        {loading ? loadingMessage : null}
      </div>
      <div className={css.inputContainer}>
        <form onSubmit={handleSubmit}>
          <Layout.Horizontal spacing="small">
            <input
              type="text"
              name="user-input"
              className={css.input}
              value={userInput}
              onChange={handleUserInput}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button type="submit" className={css.submitButton}>
              <Icon name="key-enter" />
            </button>
          </Layout.Horizontal>
        </form>
      </div>
    </div>
  )
}

export default DocsChat
