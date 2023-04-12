import React, { useLayoutEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import css from './DocsChat.module.scss'

interface Message {
  author: 'harness' | 'user'
  text: string
  timestamp: number
}

const sampleMessages: Array<Message> = [
  {
    author: 'user',
    text: 'Can Harness deploye to Kubernetes? Is yes, how?',
    timestamp: Date.now()
  },
  {
    author: 'harness',
    text: 'Yes, Harness can deploy to Kubernetes. It requires the following: Kubernetes manifests and values YAML files, an artifact (if not hardcoded in manifests or values file), and a Kubernetes cluster. Harness takes the artifacts and Kubernetes manifests provided and deploys them to the target Kubernetes cluster. It can deploy Kubernetes objects via manifests, remote sources, and Helm charts. It supports different Kubernetes objects as managed and unmanaged workloads. The major steps of a Harness Kubernetes deployment involve installing the Harness Kubernetes Delegate in the target cluster, adding Harness Connectors, defining the Harness Service, defining the Harness Environment and Infrastructure Definition, and adding the Canary, Blue Green, or Rollout steps to the Deploy stage.',
    timestamp: Date.now()
  },
  {
    author: 'user',
    text: 'Who can create a User Group?',
    timestamp: Date.now()
  },
  {
    author: 'harness',
    text: 'Manage Permissions for User Groups is required to create a User Group.',
    timestamp: Date.now()
  }
]

function DocsChat(): JSX.Element {
  const [messages, setMessages] = useState<Array<Message>>(sampleMessages)
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(true)
  const messageList = useRef<HTMLDivElement>(null)

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
      <div className={css.messagesContainer} ref={messageList}>
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
        {loading ? loadingMessage : null}
      </div>
      <div className={css.inputContainer}>
        <form onSubmit={handleSubmit}>
          <Layout.Horizontal spacing="small">
            <textarea
              name="user-input"
              className={css.input}
              value={userInput}
              onChange={handleUserInput}
              onKeyDown={handleKeyDown}
            />
            <Button type="submit" variation={ButtonVariation.SECONDARY} icon="key-enter" height={42} />
          </Layout.Horizontal>
        </form>
      </div>
    </div>
  )
}

export default DocsChat
