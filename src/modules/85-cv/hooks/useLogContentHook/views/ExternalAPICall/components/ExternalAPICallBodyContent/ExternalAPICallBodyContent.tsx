import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { CopyText } from '@common/components/CopyText/CopyText'
import { useStrings } from 'framework/strings'
import type { ApiCallLogDTOField } from 'services/cv'
import KeyValuePair from '../KeyValuePairDisplay'
import { getStringifyText, isValidJson } from '../../ExternalAPICallContent.utils'
import css from '../../ExternalAPICall.module.scss'

export default function ExternalAPICallBodyContent({
  data,
  noDataText
}: {
  data: ApiCallLogDTOField
  noDataText: string
}): JSX.Element | null {
  const { getString } = useStrings()

  if (!data) {
    return null
  }

  const isDataIsText = data.type === 'TEXT'

  if (isDataIsText || !isValidJson(data.value)) {
    return <KeyValuePair keyText={getString('requestBodyLabel')} value={data.value as string} />
  }

  return (
    <>
      <Container data-testid="externalAPICallBodyContent_Json" flex={{ alignItems: 'flex-start' }}>
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_400}>
          {getString('requestBodyLabel')}:
        </Text>
        <CopyText
          iconAlwaysVisible
          iconName="duplicate"
          className={css.copy}
          textToCopy={getStringifyText(noDataText, data.value)}
        />
      </Container>
      <Container padding="small" background={Color.WHITE} className={css.responseBody}>
        <pre>{getStringifyText(noDataText, data.value)}</pre>
      </Container>
    </>
  )
}
