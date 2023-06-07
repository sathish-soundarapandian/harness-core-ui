/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Icon, IconName } from '@wings-software/uicore'
import cx from 'classnames'

import type { YamlSnippetMetaData, GetYamlSchemaQueryParams } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getIconNameForTag } from '@common/utils/SnippetUtils'
import type { SnippetFetchResponse } from '@common/interfaces/YAMLBuilderProps'
import SnippetDetails from './SnippetDetails'

import css from './SnippetSection.module.scss'

export interface SnippetSectionProps {
  entityType: GetYamlSchemaQueryParams['entityType']
  showIconMenu?: boolean
  width?: React.CSSProperties['width']
  snippets?: YamlSnippetMetaData[]
  onSnippetCopy?: (identifier: string) => Promise<void>
  snippetFetchResponse?: SnippetFetchResponse
}

const SnippetSection: React.FC<SnippetSectionProps> = props => {
  const { showIconMenu, entityType, snippets, onSnippetCopy, snippetFetchResponse } = props
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>('')
  const [snippetList, setSnippetList] = useState<YamlSnippetMetaData[]>()
  const { getString } = useStrings()

  useEffect(() => {
    setSnippetList(snippets)
  }, [snippets])

  const onIconClick = (event: React.MouseEvent<Element, MouseEvent>, icon?: string): void => {
    event.preventDefault()
    if (selectedIcon === icon) {
      setSelectedIcon('')
      setSnippetList(snippets)
    } else {
      setSelectedIcon(icon)
      const snippetsClone = snippets
      setSnippetList(snippetsClone?.filter(snippet => getIconNameForTag(snippet.iconTag || '') === icon))
    }
  }

  const getIconCategories = (_snippets?: YamlSnippetMetaData[]): IconName[] | null => {
    if (!_snippets) {
      return null
    }
    return [...new Set(_snippets.map(snippet => getIconNameForTag(snippet?.iconTag || '')))]
  }

  const getIconList = (): React.ReactElement | null => {
    return (
      <React.Fragment>
        {getIconCategories(snippets)?.map(icon => (
          <div
            className={cx(css.snippetIcon, { [css.active]: icon === selectedIcon })}
            key={icon}
            onClick={event => onIconClick(event, icon)}
            title={icon}
          >
            <Icon name={icon as IconName} size={25} />
          </div>
        ))}
      </React.Fragment>
    )
  }

  return (
    <div className={css.main}>
      {showIconMenu ? <div className={css.snippetIcons}>{getIconList()}</div> : null}
      {snippetList ? (
        <div className={css.snippets}>
          <SnippetDetails
            entityType={entityType}
            selectedIcon={selectedIcon}
            snippets={snippetList}
            onSnippetCopy={onSnippetCopy}
            snippetFetchResponse={snippetFetchResponse}
          />
        </div>
      ) : (
        <div className={cx(css.noSnippets, css.fillSpace)}>{getString('yamlBuilder.snippets.noSnippetsFound')}</div>
      )}
    </div>
  )
}

export default SnippetSection
