import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Button, ButtonSize, Icon, Layout, Text } from '@harness/uicore'
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

  if (!errors.length) {
    return <></>
  }

  return (
    <Layout.Vertical padding={{ top: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge', right: 'xxlarge' }}>
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
            <Layout.Vertical>
              <Separator topSeparation={16} bottomSeparation={10} />
              <Layout.Horizontal spacing="small">
                <Icon name="gear" size={20} />
                <Text>{getString('common.possibleSolutions')}</Text>
              </Layout.Horizontal>
            </Layout.Vertical>
            {response.choices.map(item => (
              <Layout.Vertical padding={{ top: 'small', bottom: 'small' }} spacing="xsmall">
                <ReactMarkdown className={css.openAiResponse}>{item.text}</ReactMarkdown>
                <Button
                  text={getString('common.readMore')}
                  round
                  intent="primary"
                  size={ButtonSize.SMALL}
                  className={css.readMoreBtn}
                />
              </Layout.Vertical>
            ))}
          </Layout.Vertical>
        )
      })}
    </Layout.Vertical>
  )
}

export default OpenAIResponse
