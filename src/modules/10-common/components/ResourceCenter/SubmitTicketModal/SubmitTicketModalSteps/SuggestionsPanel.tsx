import { Layout, Text } from '@harness/uicore'
import React from 'react'
import css from './SubmitTicketModalSteps.module.scss'

interface SuggestionsPanelProps {
  data: any
}

const SuggestionsCard = (suggestionItem: any): JSX.Element => {
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

const SuggestionsPanel = (props: SuggestionsPanelProps): JSX.Element => {
  const { data } = props

  return (
    <div className={css.suggestionsPanel}>
      <h3> Before you proceed, here are some suggestions that might help...</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
        {data.map((result: any) => (
          <SuggestionsCard suggestionItem={result} key={result.uri} />
        ))}
      </div>
    </div>
  )
}

export default SuggestionsPanel
