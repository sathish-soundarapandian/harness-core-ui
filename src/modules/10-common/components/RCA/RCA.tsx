import { debounce, get } from 'lodash-es'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button, ButtonSize, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ExtractedInfo } from '../ErrorHandler/ErrorHandler'
import { Separator } from '../Separator/Separator'
import css from './RCA.module.scss'

interface OpenAIResponseInterface {
  errors: ExtractedInfo[]
  query?: string
  enableSearch: () => void
  disableSearch: () => void
}

const SUMMARY_VIEW_CHAR_LIMIT = 500
const OPENAI_KEY = 'Bearer *****'

function OpenAIResponse(props: OpenAIResponseInterface): React.ReactElement {
  const { getString } = useStrings()
  const { errors = [], query, disableSearch, enableSearch } = props
  const [errorIndex, setErrorIndex] = useState<number>(0)
  const [solutionIndex, setSolutionIndex] = useState<number>(0)
  const [showDetailedView, setShowDetailedView] = useState<boolean>(false)
  const scrollRef = useRef<Element | undefined>()
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [openAIResponses, setResponses] = useState<any>([])

  // const getBlobFromOpenAI = async (key: string, accountId: string) => {
  //   const apiResponse = await (
  //     await fetch(`https://rutvijlog.ngrok.io/blob/download/gpterrorresp?accountID=${accountId}&key=${key}`, {
  //       headers: { 'x-harness-token': '', 'content-type': 'application/json' },
  //       method: 'GET'
  //     })
  //   ).json()
  //   return apiResponse
  // }

  // useEffect(() => {
  //   try {
  //     const temp_key =
  //       'accountId%3AkmpySmUISimoRrJL6NL73w%2ForgId%3Adefault%2FprojectId%3Arutvijtest%2FpipelineId%3Ahostedvm%2FrunSequence%3A16%2Flevel0%3Apipeline%2Flevel1%3Astages%2Flevel2%3ABuild%2Flevel3%3Aspec%2Flevel4%3Aexecution%2Flevel5%3Asteps%2Flevel6%3ARun'
  //     const temp_acct_id = 'kmpySmUISimoRrJL6NL73w'
  //     getBlobFromOpenAI(temp_key, temp_acct_id).then((res: unknown) => {
  //       setResponses(res)
  //     })
  //   } catch (e) {}
  // }, [])

  const debounceFetchOpenAISuggestions = useCallback(
    debounce((query: string) => getOpenAISuggestions(query), 1000),
    []
  )

  useEffect(() => {
    if (query) {
      debounceFetchOpenAISuggestions(query)
    }
  }, [query])

  useEffect(() => {
    if (isFetching) {
      disableSearch()
    } else {
      enableSearch()
    }
  }, [isFetching])

  const getOpenAISuggestions = async (query: string) => {
    try {
      setIsFetching(true)
      const fixedQuerySuffix =
        'These error messages are seen when running a Harness Continuous Integration step in a Cloud environment on an Ubuntu 22.04 Virtual Machine'
      const payload = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: fixedQuerySuffix.concat(query)
          }
        ],
        temperature: 0.7
      }
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: OPENAI_KEY
        },
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        const jsonResponse = await response.json()
        setResponses(jsonResponse)
      }
    } catch (e) {}
    setIsFetching(false)
  }

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

  const renderView = useCallback((): JSX.Element => {
    if (showDetailedView) {
      return (
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
            <ReactMarkdown className={css.openAiResponse}>{openAIResponses.choices[solutionIndex].text}</ReactMarkdown>
          </Layout.Vertical>
        </Layout.Vertical>
      )
    } else {
      return (
        <>
          <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start' }}>
            <Icon name="danger-icon" size={16} />
            <Text font={{ variation: FontVariation.LEAD }}>{`${getString('errors')} (${errors.length})`}</Text>
          </Layout.Horizontal>
          {errors?.map((errorObject, index) => {
            const { error = {} } = errorObject
            return (
              <Layout.Vertical key={index} spacing="medium" className={css.errorDetails} padding="large">
                <Text font={{ variation: FontVariation.LEAD }} color={Color.RED_500}>{`${getString('error')} ${
                  index + 1
                }`}</Text>
                <Text>{error.message}</Text>
                {renderErrorDetailSeparator()}
                {openAIResponses?.choices?.map((item: any, _index: any) => {
                  const content = get(item, 'message.content', '')
                  return (
                    <Layout.Vertical padding={{ top: 'small', bottom: 'small' }} spacing="xsmall" key={index}>
                      <ReactMarkdown className={css.openAiResponse}>
                        {content.length > SUMMARY_VIEW_CHAR_LIMIT
                          ? content.slice(0, SUMMARY_VIEW_CHAR_LIMIT).concat('...')
                          : content}
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
                  )
                })}
              </Layout.Vertical>
            )
          })}
        </>
      )
    }
  }, [showDetailedView, errors, openAIResponses])

  return (
    <Container ref={scrollRef}>
      <Layout.Vertical padding={{ top: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge', right: 'xxlarge' }}>
        {renderView()}
      </Layout.Vertical>
    </Container>
  )
}

export default OpenAIResponse
