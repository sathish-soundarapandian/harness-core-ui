/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { Popover, Position, PopoverInteractionKind, Spinner, Intent } from '@blueprintjs/core'

import { Icon, IconName, shouldShowError } from '@wings-software/uicore'
import { getIconNameForTag } from '@common/utils/SnippetUtils'
import type { YamlSnippetMetaData } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { SnippetFetchResponse } from '@common/interfaces/YAMLBuilderProps'

import css from './Snippet.module.scss'

type SnippetInterface = YamlSnippetMetaData & {
  onSnippetCopy?: (identifier: string) => Promise<void>
  snippetFetchResponse?: SnippetFetchResponse
}

const Snippet: React.FC<SnippetInterface> = props => {
  const { getString } = useStrings()
  const { name, description, version, identifier, iconTag, onSnippetCopy, snippetFetchResponse } = props
  const [tooltipLabel, setTooltipLabel] = useState(getString('snippets.copyToClipboard'))
  const [isFetching, setIsFetching] = useState<boolean>(false)

  useEffect(() => {
    const { snippet = '', loading, error } = snippetFetchResponse || {}
    if (!loading) {
      if (error) {
        shouldShowError(error)
          ? setTooltipLabel(error.data?.message || error?.message)
          : setTooltipLabel(getString('somethingWentWrong'))
      } else {
        navigator?.clipboard?.writeText(snippet)
        setTooltipLabel(getString('snippets.copied'))
      }
      setIsFetching(false)
    }
  }, [snippetFetchResponse])

  const getPopoverContent = (): JSX.Element => {
    return (
      <div className={css.popoverContent}>
        <span className={css.tooltipLabel}>{tooltipLabel}</span>
        {isFetching ? <Spinner size={Spinner.SIZE_SMALL} intent={Intent.PRIMARY} className={css.loader} /> : null}
      </div>
    )
  }

  return (
    <div className={cx(css.flexCenter, css.snippet)} key={name}>
      <span className={css.icon}>
        <Icon name={getIconNameForTag(iconTag || '') as IconName} size={25} />
      </span>
      <div className={css.fullWidth}>
        <div className={css.name}>
          <div className={css.snippetName}>{name}</div>
        </div>
        <div className={css.description}>{description}</div>
        <div className={css.snippetVersion}>
          {getString('version')} {version}
        </div>
      </div>
      <Popover
        minimal
        position={Position.BOTTOM}
        interactionKind={PopoverInteractionKind.HOVER}
        content={getPopoverContent()}
        onOpening={() => {
          setIsFetching(false)
          setTooltipLabel(getString('snippets.copyToClipboard'))
        }}
      >
        <div className={css.copy}>
          <Icon
            name="copy"
            size={20}
            className={css.snippetIcon}
            onClick={async (event: React.MouseEvent<HTMLHeadingElement, globalThis.MouseEvent>) => {
              event.preventDefault()
              event.stopPropagation()
              setIsFetching(true)
              setTooltipLabel(getString('fetching').concat('...'))
              if (identifier) {
                await onSnippetCopy?.(identifier)
              }
            }}
          />
        </div>
      </Popover>
    </div>
  )
}

export default Snippet
