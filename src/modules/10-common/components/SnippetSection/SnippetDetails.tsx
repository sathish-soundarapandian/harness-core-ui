/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import cx from 'classnames'

import { Icon } from '@wings-software/uicore'
import type { YamlSnippetMetaData, GetYamlSchemaQueryParams } from 'services/cd-ng'
import type { SnippetFetchResponse } from '@common/interfaces/YAMLBuilderProps'
import i18n from './SnippetDetails.i18n'
import Snippet from './Snippet'

import css from './SnippetDetails.module.scss'

interface SnippetDetailsProps {
  entityType: GetYamlSchemaQueryParams['entityType']
  selectedIcon?: string
  snippets?: YamlSnippetMetaData[]
  onSnippetCopy?: (identifier: string) => Promise<void>
  snippetFetchResponse?: SnippetFetchResponse
}

const SnippetDetails: React.FC<SnippetDetailsProps> = props => {
  const { entityType, onSnippetCopy, snippetFetchResponse, selectedIcon } = props
  const [snippets, setSnippets] = useState<YamlSnippetMetaData[]>()
  const [searchedSnippet, setSearchedSnippet] = useState('')

  useEffect(() => {
    setSearchedSnippet('')
  }, [selectedIcon])

  const onSnippetSearch = (query: string): void => {
    const snippetsClone = props.snippets as YamlSnippetMetaData[]
    setSnippets(snippetsClone.filter(snippet => snippet.name?.toLowerCase().includes(query.toLowerCase())))
  }

  const handleSnippetSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault()
    const query = event.target.value
    if (query) {
      setSearchedSnippet(query)
      onSnippetSearch(query)
    } else onSearchClear()
  }

  const onSearchClear = (event?: React.MouseEvent<HTMLElement>): void => {
    event?.preventDefault()
    setSnippets(props.snippets)
    setSearchedSnippet('')
  }

  useEffect(() => {
    setSnippets(props.snippets)
  }, [props.snippets])

  return (
    <div className={css.main}>
      <div className={css.title}>
        <span style={{ textTransform: 'capitalize' }}>{entityType.replace(/s$/, '')}</span>&nbsp;
        {i18n.title}
      </div>
      <div className={css.searchBar}>
        <span className={css.searchIcon}>
          <Icon name={'main-search'} size={20} />
        </span>
        <input
          placeholder="Search"
          name="snippet-search"
          className={css.search}
          onChange={handleSnippetSearch}
          value={searchedSnippet}
        />
        {searchedSnippet ? (
          <span className={css.closeIcon}>
            <Icon name={'main-close'} size={10} onClick={onSearchClear} />
          </span>
        ) : null}
      </div>
      {snippets && snippets?.length > 0 ? (
        <div className={css.snippets}>
          {snippets?.map(snippet => (
            <Snippet
              key={snippet.name}
              {...snippet}
              onSnippetCopy={onSnippetCopy}
              snippetFetchResponse={snippetFetchResponse}
            />
          ))}
        </div>
      ) : (
        <div className={cx(css.noSnippets, css.fillSpace)}>No snippets found.</div>
      )}
    </div>
  )
}

export default SnippetDetails
