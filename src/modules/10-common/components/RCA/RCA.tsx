import React, { useState, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button, ButtonSize, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ExtractedInfo } from '../ErrorHandler/ErrorHandler'
import { Separator } from '../Separator/Separator'
import response from './openai-response.json'
import css from './RCA.module.scss'

interface OpenAIResponseInterface {
  errors: ExtractedInfo[]
}

function OpenAIResponse(props: OpenAIResponseInterface): React.ReactElement {
  const { getString } = useStrings()
  const { errors = [] } = props
  const [errorIndex, setErrorIndex] = useState<number>(0)
  const [solutionIndex, setSolutionIndex] = useState<number>(0)
  const [showDetailedView, setShowDetailedView] = useState<boolean>(false)
  const scrollRef = useRef<Element | undefined>()

  const renderErrorDetailSeparator = useCallback((): React.ReactElement => {
    return (
      <Layout.Vertical>
        <Separator topSeparation={16} bottomSeparation={10} />
        <Layout.Horizontal spacing="small">
          <Icon name="gear" size={20} />
          <Text>{getString('common.possibleSolutions')}</Text>
        </Layout.Horizontal>
      </Layout.Vertical>
    )
  }, [])

  if (!errors.length) {
    return <></>
  }

  return (
    <Container ref={scrollRef}>
      <Layout.Vertical padding={{ top: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge', right: 'xxlarge' }}>
        {showDetailedView ? (
          <Layout.Vertical>
            <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start' }}>
              <Icon
                className={css.backBtn}
                name="arrow-left"
                size={16}
                onClick={() => {
                  setErrorIndex(0)
                  setSolutionIndex(0)
                  setShowDetailedView(false)
                }}
              />
              <Text font={{ variation: FontVariation.LEAD }}>{`${getString('error')} ${errorIndex + 1}`}</Text>
            </Layout.Horizontal>
            <Layout.Vertical spacing="medium" className={css.errorDetails} padding="large">
              <Text>{errors[errorIndex].error?.message}</Text>
              {renderErrorDetailSeparator()}
              <ReactMarkdown className={css.openAiResponse}>{response.choices[solutionIndex].text}</ReactMarkdown>
            </Layout.Vertical>
          </Layout.Vertical>
        ) : (
          <>
            <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start' }}>
              <Icon name="danger-icon" size={16} />
              <Text font={{ variation: FontVariation.LEAD }}>{`${getString('errors')} (${errors.length})`}</Text>
            </Layout.Horizontal>
            {errors.map((errorObject, index) => {
              const { error = {} } = errorObject
              return (
                <Layout.Vertical key={index} spacing="medium" className={css.errorDetails} padding="large">
                  <Text font={{ variation: FontVariation.LEAD }} color={Color.RED_500}>{`${getString('error')} ${
                    index + 1
                  }`}</Text>
                  <Text>{error.message}</Text>
                  {renderErrorDetailSeparator()}
                  {response.choices.map((item, _index) => (
                    <Layout.Vertical padding={{ top: 'small', bottom: 'small' }} spacing="xsmall" key={index}>
                      <ReactMarkdown className={css.openAiResponse}>{item.text}</ReactMarkdown>
                      <Button
                        text={getString('common.readMore')}
                        round
                        intent="primary"
                        size={ButtonSize.SMALL}
                        className={css.readMoreBtn}
                        onClick={() => {
                          setErrorIndex(index)
                          setSolutionIndex(_index)
                          setShowDetailedView(true)
                          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 0)
                        }}
                      />
                    </Layout.Vertical>
                  ))}
                </Layout.Vertical>
              )
            })}
          </>
        )}
      </Layout.Vertical>
    </Container>
  )
}

export default OpenAIResponse
