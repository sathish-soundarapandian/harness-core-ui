import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { KeyValuePairProps } from '../ExternalAPICall.types'

const KeyValuePair: React.FC<KeyValuePairProps> = ({ keyText, value, isLink }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="small">
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_400}>
        {keyText}:
      </Text>
      {isLink ? (
        <a href={value} target="_blank" rel="noreferrer">
          <Text lineClamp={1} font={{ variation: FontVariation.BODY }} color={Color.GREY_900}>
            {value ?? getString('na')}
          </Text>
        </a>
      ) : (
        <Text lineClamp={1} font={{ variation: FontVariation.BODY }} color={Color.GREY_900}>
          {value ?? getString('na')}
        </Text>
      )}
    </Layout.Horizontal>
  )
}

export default KeyValuePair
