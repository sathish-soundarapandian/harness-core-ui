import { Layout, Text } from '@harness/uicore'
import React from 'react'

interface SuggestionsPanelProps {
  data: any
}

const SuggestionsCard = (suggestionItem: any) => {
  const { suggestionItem: suggestionItemValue } = suggestionItem
  return (
    <Layout.Vertical margin={{ bottom: '10px' }}>
      <a href={suggestionItemValue.clickUri}>
        <li>{suggestionItemValue.title}</li>
      </a>
      <Text>{suggestionItemValue.excerpt}</Text>
    </Layout.Vertical>
  )
}

const SuggestionsPanel = (props: SuggestionsPanelProps) => {
  const { data } = props

  return (
    <div style={{ padding: '0px 0px 0px 20px', overflowY: 'auto' }}>
      <h3> Some of the suggestions that might help...</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
        {data.map((result: any) => (
          <SuggestionsCard suggestionItem={result} key={result.uri} />
        ))}
      </div>
    </div>
  )
}

export default SuggestionsPanel
