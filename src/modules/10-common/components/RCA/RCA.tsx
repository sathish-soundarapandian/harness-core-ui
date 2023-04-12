import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ExtractedInfo } from '../ErrorHandler/ErrorHandler'
import response from './openai-response.json'
import css from './RCA.module.scss'

interface OpenAIResponseInterface {
  errors: ExtractedInfo[]
}

function OpenAIResponse(props: OpenAIResponseInterface): React.ReactElement {
  const { getString } = useStrings()
  const { errors = [] } = props
  const markdownText = response.choices[0].text

  if (!errors.length) {
    return <></>
  }

  return (
    <Layout.Vertical
      padding={{ top: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge', right: 'xxlarge' }}
      className={css.main}
    >
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
            <ReactMarkdown className={css.openAiResponse}>{markdownText}</ReactMarkdown>
          </Layout.Vertical>
        )
      })}
    </Layout.Vertical>
  )
}

export default OpenAIResponse
