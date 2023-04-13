import { debounce, get, isEmpty } from 'lodash-es'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import { Accordion, Button, ButtonSize, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { State } from '@pipeline/components/logsContent/LogsState/types'
import type { ExecutionPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { Separator } from '../Separator/Separator'
import css from './RCA.module.scss'

interface OpenAIResponseInterface {
  query?: string
  enableSearch: () => void
  disableSearch: () => void
  setQuery: (queryStr: string) => void
  logKeysFromState: State
}

const SUMMARY_VIEW_CHAR_LIMIT = 500
// const OPENAI_KEY = 'Bearer *****'

const mock = {
  id: 'chatcmpl-74fseKuRCYL3gSyfOcRhGD3UCgmJy',
  object: 'chat.completion',
  created: 1681348656,
  model: 'gpt-3.5-turbo-0301',
  usage: {
    prompt_tokens: 543,
    completion_tokens: 192,
    total_tokens: 735
  },
  choices: [
    {
      message: {
        role: 'assistant',
        content:
          '[ \n  { \n    "Error": "Traceback (most recent call last):",\n    "Cause": "Code error - ZeroDivisionError: division by zero",\n    "Solution": "Check the code for any division by zero and fix it",\n    "Category": "Code error"\n  },\n  {\n    "Error": "  File \\"\\u003cstring\\u003e\\", line 1, in \\u003cmodule\\u003e",\n    "Cause": "Code error - Syntax error",\n    "Solution": "Check the syntax of the code at the specified line and fix it",\n    "Category": "Code error"\n  },\n  {\n    "Error": "ZeroDivisionError: division by zero",\n    "Cause": "Code error - Division by zero",\n    "Solution": "Check the code for any division by zero and fix it",\n    "Category": "Code error"\n  }\n]'
      },
      finish_reason: 'stop',
      index: 0
    }
  ]
}

function OpenAIResponse(props: OpenAIResponseInterface): React.ReactElement {
  const { getString } = useStrings()
  const pathParams = useParams<ExecutionPathProps & ModulePathParams>()

  const { query, disableSearch, enableSearch, setQuery, logKeysFromState } = props
  const [errorIndex, setErrorIndex] = useState<number>(0)
  const [itemForDetailedView, setItemForDetailedView] = useState<any>()
  const [showDetailedView, setShowDetailedView] = useState<boolean>(false)
  const scrollRef = useRef<Element | undefined>()
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [openAIResponses, setOpenAIResponses] = useState<any>([])
  const [errors, setErrors] = useState<any[]>([])

  const prepareResponses = useCallback((input: any) => {
    const choices = JSON.parse(get(input, 'choices.0.message.content')) as any[]
    const possibleSolutions = choices.map(choice => choice['Solution']).filter(item => !!item)
    const suitableResponses = possibleSolutions.map(solution => {
      return { message: { content: solution } }
    })
    setOpenAIResponses({ choices: suitableResponses })
    setErrors(choices.map(choice => choice.Error))
  }, [])

  useEffect(() => {
    logKeysFromState.logKeys.map(logKey => {
      getBlobFromOpenAI(logKey, pathParams.accountId).then((res: unknown) => {
        if (res) {
          prepareResponses(mock)
        }
      })
    })
  }, [logKeysFromState.logKeys])

  const getBlobFromOpenAI = async (key: string, accountId: string) => {
    const apiResponse = await (
      await fetch(`https://localhost:8181/log-service/blob/download/gpterrorresp?accountID=${accountId}&key=${key}`, {
        headers: { 'x-harness-token': '', 'content-type': 'application/json' },
        method: 'GET'
      })
    ).json()
    return apiResponse
  }

  const debounceFetchOpenAISuggestions = useCallback(
    debounce((query: string) => getOpenAISuggestions(query), 1000),
    []
  )

  useEffect(() => {
    if (query) {
      setShowDetailedView(false)
      setItemForDetailedView(undefined)
      debounceFetchOpenAISuggestions(query)
      setOpenAIResponses(undefined)
    }
  }, [query])

  useEffect(() => {
    if (isFetching) {
      disableSearch()
    } else {
      enableSearch()
    }
  }, [isFetching])

  // const getOpenAISuggestions = async (_query: string) => {
  //   try {
  //     setIsFetching(true)
  //     const fixedQuerySuffix =
  //       'These error messages are seen when running a Harness Continuous Integration step in a Cloud environment on an Ubuntu 22.04 Virtual Machine'
  //     const payload = {
  //       model: 'gpt-3.5-turbo',
  //       messages: [
  //         {
  //           role: 'user',
  //           content: fixedQuerySuffix.concat(_query)
  //         }
  //       ],
  //       temperature: 0.7
  //     }
  //     const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //       method: 'POST',
  //       headers: {
  //         accept: 'application/json',
  //         'Content-Type': 'application/json',
  //         Authorization: OPENAI_KEY
  //       },
  //       body: JSON.stringify(payload)
  //     })
  //     if (response.ok) {
  //       const jsonResponse = await response.json()
  //       setOpenAIResponses(jsonResponse)
  //     }
  //   } catch (e) {}
  //   setIsFetching(false)
  // }

  const getOpenAISuggestions = async (_query: string) => {
    setIsFetching(true)
    setTimeout(() => setIsFetching(false), 5000)
    setOpenAIResponses({
      id: 'chatcmpl-74mc6pgC126UTbBqmbpKH2k77m6pk',
      object: 'chat.completion',
      created: 1681374538,
      model: 'gpt-3.5-turbo-0301',
      usage: { prompt_tokens: 38, completion_tokens: 143, total_tokens: 181 },
      choices: [
        {
          message: {
            role: 'assistant',
            content:
              'To install pytest on an Ubuntu 22.04 Virtual Machine, you can follow these steps:\n\n1. Open the Terminal on your Ubuntu VM.\n2. Run the following command to update the package list:\n\n   ```\n   sudo apt update\n   ```\n\n3. Once the package list is updated, run the following command to install pytest:\n\n   ```\n   sudo apt install python3-pytest\n   ```\n\n4. After the installation is complete, you can verify the version of pytest by running the following command:\n\n   ```\n   pytest --version\n   ```\n\n   This should display the version of pytest installed on your Ubuntu VM.\n\n5. You can now use pytest to run tests in your Python projects.'
          },
          finish_reason: 'stop',
          index: 0
        }
      ]
    })
  }

  const renderErrorDetailSeparator = useCallback((): React.ReactElement => {
    return (
      <Layout.Vertical>
        <Separator topSeparation={16} bottomSeparation={10} />
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start' }}>
          <Icon name="ai" size={30} />
          <Text color={Color.PRIMARY_7}>
            {getString('common.possibleSolution').concat(showDetailedView ? '' : 's')}
          </Text>
        </Layout.Horizontal>
      </Layout.Vertical>
    )
  }, [showDetailedView])

  const renderView = useCallback((): JSX.Element => {
    if (isFetching) {
      return (
        <Layout.Vertical flex={{ justifyContent: 'center' }} padding={{ top: 'huge' }} margin={{ top: 'huge' }}>
          <Icon name="loading" size={40} color={Color.BLUE_600} />
          <Text font={{ variation: FontVariation.BODY }}>{getString('common.fetchingFromOpenAI')}</Text>
        </Layout.Vertical>
      )
    }
    if (query) {
      return !isEmpty(openAIResponses) ? (
        <Layout.Vertical>
          <Icon
            className={css.backBtn}
            name="arrow-left"
            size={16}
            onClick={() => {
              setQuery('')
              setShowDetailedView(false)
              prepareResponses(mock)
            }}
          />
          <Layout.Vertical spacing="medium" className={css.errorDetails} padding="large">
            {openAIResponses?.choices?.map((item: any, _index: any) => {
              const content = get(item, 'message.content', '')
              return (
                <Layout.Vertical padding={{ top: 'small', bottom: 'small' }} spacing="xsmall" key={_index}>
                  <ReactMarkdown className={css.openAiResponse}>{content}</ReactMarkdown>
                </Layout.Vertical>
              )
            })}
          </Layout.Vertical>
        </Layout.Vertical>
      ) : (
        <Layout.Vertical flex={{ justifyContent: 'center' }} padding={{ top: 'huge' }} margin={{ top: 'huge' }}>
          <Icon name="loading" size={40} color={Color.BLUE_600} />
          <Text font={{ variation: FontVariation.BODY }}>{getString('common.fetchingFromOpenAI')}</Text>
        </Layout.Vertical>
      )
    } else {
      if (showDetailedView) {
        return (
          <Layout.Vertical>
            <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start' }}>
              <Icon
                className={css.backBtn}
                name="arrow-left"
                size={16}
                onClick={() => {
                  setShowDetailedView(false)
                }}
              />
              <Text font={{ variation: FontVariation.LEAD }}>{`${getString('error')} ${errorIndex + 1}`}</Text>
            </Layout.Horizontal>
            <Layout.Vertical spacing="medium" className={css.errorDetails} padding="large">
              <Text>{errors[errorIndex]}</Text>
              {renderErrorDetailSeparator()}
              <ReactMarkdown className={css.openAiResponse}>
                {get(itemForDetailedView, 'message.content', '')}
              </ReactMarkdown>
            </Layout.Vertical>
          </Layout.Vertical>
        )
      } else {
        return (
          <>
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
                <Icon name="danger-icon" size={16} />
                <Text font={{ variation: FontVariation.LEAD }}>{`${getString('errors')} (${errors.length})`}</Text>
              </Layout.Horizontal>
            </Layout.Horizontal>
            <Accordion activeId={'0'} className={css.accordion}>
              {errors?.map((err, index) => {
                return (
                  <Accordion.Panel
                    id={index.toString()}
                    summary={
                      <Layout.Vertical key={index} spacing="medium" className={css.errorDetails} padding="large">
                        <Text font={{ variation: FontVariation.LEAD }} color={Color.RED_500}>{`${getString('error')} ${
                          index + 1
                        }`}</Text>
                        <Text>{err}</Text>
                      </Layout.Vertical>
                    }
                    details={
                      <Layout.Vertical key={index} spacing="medium" className={css.errorDetails} padding="large">
                        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start' }}>
                          <Icon name="ai" size={30} />
                          <Text color={Color.PRIMARY_7}>
                            {getString('common.possibleSolution').concat(showDetailedView ? '' : 's')}
                          </Text>
                        </Layout.Horizontal>
                        {openAIResponses?.choices?.map((item: any, _index: any) => {
                          const content = get(item, 'message.content', '')
                          const shouldTrim = content.length > SUMMARY_VIEW_CHAR_LIMIT
                          return (
                            <Layout.Vertical padding={{ top: 'small', bottom: 'small' }} spacing="xsmall" key={index}>
                              <ReactMarkdown className={css.openAiResponse}>
                                {shouldTrim ? content.slice(0, SUMMARY_VIEW_CHAR_LIMIT).concat('...') : content}
                              </ReactMarkdown>
                              {shouldTrim ? (
                                <Button
                                  text={getString('common.readMore')}
                                  round
                                  intent="primary"
                                  size={ButtonSize.SMALL}
                                  className={css.readMoreBtn}
                                  onClick={() => {
                                    setItemForDetailedView(item)
                                    setErrorIndex(index)
                                    setShowDetailedView(true)
                                    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 0)
                                  }}
                                />
                              ) : null}
                            </Layout.Vertical>
                          )
                        })}
                      </Layout.Vertical>
                    }
                  ></Accordion.Panel>
                )
              })}
            </Accordion>
          </>
        )
      }
    }
  }, [showDetailedView, errors, openAIResponses, query, isFetching])

  return (
    <Container ref={scrollRef} height="100%">
      <Layout.Vertical padding={{ top: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge', right: 'xxlarge' }} height="100%">
        {renderView()}
      </Layout.Vertical>
    </Container>
  )
}

export default OpenAIResponse
