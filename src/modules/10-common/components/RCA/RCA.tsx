import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button, ButtonSize, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ExtractedInfo } from '../ErrorHandler/ErrorHandler'
import { Separator } from '../Separator/Separator'
import mockedResponse from './openai-response.json'
import css from './RCA.module.scss'

interface OpenAIResponseInterface {
  errors: ExtractedInfo[]
}

const SUMMARY_VIEW_CHAR_LIMIT = 500

function OpenAIResponse(props: OpenAIResponseInterface): React.ReactElement {
  const { getString } = useStrings()
  const { errors = [] } = props
  const [errorIndex, setErrorIndex] = useState<number>(0)
  const [solutionIndex, setSolutionIndex] = useState<number>(0)
  const [showDetailedView, setShowDetailedView] = useState<boolean>(false)
  const scrollRef = useRef<Element | undefined>()
  const [responses, setResponses] = useState<any>(mockedResponse)

  const getBlobFromOpenAI = async (key: string, accountId: string) => {
    const apiResponse = await (
      await fetch(`https://rutvijlog.ngrok.io/blob/download/gpterrorresp?accountID=${accountId}&key=${key}`, {
        headers: { 'x-harness-token': '', 'content-type': 'application/json' },
        method: 'GET'
      })
    ).json()
    return apiResponse
  }

  useEffect(() => {
    try {
      const temp_key =
        'accountId%3AkmpySmUISimoRrJL6NL73w%2ForgId%3Adefault%2FprojectId%3Arutvijtest%2FpipelineId%3Ahostedvm%2FrunSequence%3A16%2Flevel0%3Apipeline%2Flevel1%3Astages%2Flevel2%3ABuild%2Flevel3%3Aspec%2Flevel4%3Aexecution%2Flevel5%3Asteps%2Flevel6%3ARun'
      const temp_acct_id = 'kmpySmUISimoRrJL6NL73w'
      getBlobFromOpenAI(temp_key, temp_acct_id).then((res: unknown) => {
        setResponses(res)
      })
    } catch (e) {}
  }, [])

  const renderErrorDetailSeparator = useCallback((): React.ReactElement => {
    return (
      <Layout.Vertical>
        <Separator topSeparation={16} bottomSeparation={10} />
        <Layout.Horizontal spacing="small">
          <Icon name="gear" size={20} />
          <Text color={Color.PRIMARY_7}>
            {getString('common.possibleSolution').concat(showDetailedView ? '' : 's')}
          </Text>
        </Layout.Horizontal>
      </Layout.Vertical>
    )
  }, [showDetailedView])

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
                  {responses.choices.map((item: any, _index: any) => (
                    <Layout.Vertical padding={{ top: 'small', bottom: 'small' }} spacing="xsmall" key={index}>
                      <ReactMarkdown className={css.openAiResponse}>
                        {item.text.length > SUMMARY_VIEW_CHAR_LIMIT
                          ? item.text.slice(0, SUMMARY_VIEW_CHAR_LIMIT).concat('...')
                          : item.text}
                      </ReactMarkdown>
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
