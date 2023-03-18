import { Spinner } from '@blueprintjs/core'
import { Layout, Text } from '@harness/uicore'
import React from 'react'

interface SuggestionsPanelProps {
  data: any
}

const SuggestionsCard = (suggestionItem: any) => {
  const { suggestionItem: suggestionItemValue } = suggestionItem
  return (
    <Layout.Vertical padding={{ bottom: 'medium' }}>
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
    <div
      style={{
        paddingLeft: '20px',
        overflowY: 'auto',
        border: '1px solid grey',
        backgroundColor: 'white',
        height: '500px',
        marginBottom: '20px'
      }}
    >
      <h3> Before you proceed , here are some suggestions that might help...</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
        {data.length ? (
          data.map((result: any) => <SuggestionsCard suggestionItem={result} key={result.uri} />)
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  )
}

export default SuggestionsPanel
