import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import Lottie from 'react-lottie-player'
import { Configuration, OpenAIApi } from 'openai'
import { Drawer } from '@blueprintjs/core'
import { Button, ButtonVariation, Container, Heading, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { LogAnalysisRowData } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import { DrawerProps } from '../LogAnalysisDetailsDrawer/LogAnalysisDetailsDrawer.constants'
import { getFormattedText } from './AIDrawer.utils'
import * as animationData from './animation.json'
import css from './AIDrawer.module.scss'
import style from '../LogAnalysisDetailsDrawer/LogAnalysisDetailsDrawer.module.scss'

const configuration = new Configuration({
  apiKey: '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'
})

const openai = new OpenAIApi(configuration)

export interface UpdateEventPreferenceDrawerProps {
  rowData: LogAnalysisRowData
  onHide: (isCallAPI?: boolean, clusterId?: string) => void
  activityId: string
}

export default function AIDrawer(props: UpdateEventPreferenceDrawerProps): JSX.Element | null {
  const { rowData, onHide } = props || {}
  const { message } = rowData

  const [defaultLottie, setDefaultLottie] = useState<object | undefined>()

  const [aiResponse, setAiResponse] = useState<{
    exceptionType: string
    description: string
    example: string
    solution: string
    link: string
    risk: string
    fileDetails: string
  } | null>(null)

  const [isOpen, setOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const onHideCallback = useCallback(() => {
    setOpen(false)
    onHide()
  }, [onHide])

  const fetchAIData = async () => {
    setIsLoading(true)
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `
      what kind of exception is this and tell the 
        1. exception name without java.lang, 
        2. detailed description
        3. mardown formatted real world code sample for it with out explanation.  
        4. probable solution for it with example code
        5. link to its documentation
        6. how risk it is, rate it from "High", "Medium" or "Less"
        7. In which file and which line the exception happened, give the file name and line number alone

        Give the result as a minified JSON format. Use exceptionType, description, example, solution, link, risk and fileDetails as property names in the JSON response

        ${message}
      `,
      temperature: 0,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })

    // const splittedResponse = aiResponse?.split("|");

    const responseText = response.data.choices[0].text

    let finalData

    if (responseText?.includes('Answer:')) {
      finalData = JSON.parse(response.data.choices[0].text?.split('Answer:')?.[1] || '{}')
    } else {
      finalData = JSON.parse(response.data.choices[0].text || '{}')
    }

    setIsLoading(false)
    setAiResponse(finalData)
  }

  useEffect(() => {
    fetchAIData()
  }, [])

  useEffect(() => {
    import('./animation.json').then(json => {
      setDefaultLottie(json)
    })
  }, [])

  //   {
  //     "exceptionType": "NullPointerException",
  //     "description": "A NullPointerException is an exception that occurs when an application attempts to use an object reference that has the null value. This means that the application is trying to use an object that does not exist, which can cause the application to crash.",
  //     "example": "String str = null;\nSystem.out.println(str.length());",
  //     "solution": "The best way to avoid a NullPointerException is to check for null values before attempting to use an object. For example, the following code checks for a null value before attempting to use the object:\nif (str != null) {\n    System.out.println(str.length());\n}",
  //     "link": "https://docs.oracle.com/javase/7/docs/api/java/lang/NullPointerException.html",
  //     "risk": "High",
  //     "fileDetails": "N/A"
  // }

  const getDrawerContent = (): JSX.Element => {
    return (
      <>
        <Container className={css.formSection} data-testid="updateEventPreferenceDrawer-Container">
          <Container className={style.headingContainer} data-testid="updateEventPreferenceDrawer">
            <Heading level={2} font={{ variation: FontVariation.H4 }}>
              🚀 AI Log Analysis
            </Heading>
            <Button variation={ButtonVariation.SECONDARY} icon="service-jira">
              Create Jira for this log
            </Button>
          </Container>

          {defaultLottie && isLoading && (
            <Lottie animationData={defaultLottie} play style={{ width: 200, margin: '0 auto' }} />
          )}

          {!isLoading && (
            <Container padding="large">
              <Text margin={{ bottom: 'large' }} font={{ variation: FontVariation.H2 }}>
                {aiResponse?.exceptionType}
              </Text>

              <Text margin={{ bottom: 'small' }} font={{ variation: FontVariation.H4 }}>
                Description:
              </Text>
              <Text margin={{ bottom: 'large' }} font={{ variation: FontVariation.BODY1 }}>
                {aiResponse?.description}
              </Text>

              <Text margin={{ bottom: 'small' }} font={{ variation: FontVariation.H4 }}>
                Example:
              </Text>
              <Text margin={{ bottom: 'large' }} font={{ variation: FontVariation.YAML }}>
                <code dangerouslySetInnerHTML={{ __html: getFormattedText(aiResponse?.example) }} />
              </Text>

              <Text margin={{ bottom: 'small' }} font={{ variation: FontVariation.H4 }}>
                Documentation:
              </Text>
              <a
                style={{ display: 'inline-block', marginBottom: '24px' }}
                rel="noreferrer"
                target="_blank"
                href={aiResponse?.link}
              >
                {aiResponse?.exceptionType}
              </a>

              <Text margin={{ bottom: 'small' }} font={{ variation: FontVariation.H4 }}>
                File details:
              </Text>
              <Text margin={{ bottom: 'large' }} font={{ variation: FontVariation.BODY1 }}>
                {aiResponse?.fileDetails}
              </Text>
            </Container>
          )}
        </Container>
      </>
    )
  }

  return (
    <>
      <Drawer
        {...DrawerProps}
        size="50%"
        isOpen={isOpen}
        onClose={() => onHideCallback()}
        className={cx(style.main, css.updatePreferenceDrawer)}
      >
        {getDrawerContent()}
      </Drawer>
      <Button
        data-testid="UpdateEventDrawerClose_button_top"
        minimal
        className={cx(style.almostFullScreenCloseBtn, css.updatePreferenceDrawerCloseBtn)}
        icon="cross"
        withoutBoxShadow
        onClick={() => onHideCallback()}
      />
    </>
  )
}
