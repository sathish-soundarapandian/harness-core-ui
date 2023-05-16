/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { ExpandingSearchInputHandle } from '@harness/uicore';
import { Container, ExpandingSearchInput } from '@harness/uicore'
import { useGlobalEventListener } from '@common/hooks'
import type { ExecutionLogSearchProps } from './ExecutionLog.types'
import { getKeyDownListener, handleKeyDown, handleSearchChange } from './ExecutionLog.utils'

const ExecutionLogSearch: React.FC<ExecutionLogSearchProps> = ({ state, actions }) => {
  const { currentIndex, linesWithResults } = state.searchData
  const searchRef = React.useRef<ExpandingSearchInputHandle>()

  useGlobalEventListener('keydown', getKeyDownListener(searchRef))

  return (
    <Container height="fit-content" onKeyDown={handleKeyDown(actions)}>
      <ExpandingSearchInput
        flip
        theme="dark"
        ref={searchRef}
        showPrevNextButtons
        onChange={handleSearchChange(actions)}
        fixedText={`${Math.min(currentIndex + 1, linesWithResults.length)} / ${linesWithResults.length}`}
        onNext={/* istanbul ignore next */ () => actions.goToNextSearchResult()}
        onPrev={/* istanbul ignore next */ () => actions.goToPrevSearchResult()}
        onEnter={/* istanbul ignore next */ () => actions.goToNextSearchResult()}
      />
    </Container>
  )
}

export default ExecutionLogSearch
