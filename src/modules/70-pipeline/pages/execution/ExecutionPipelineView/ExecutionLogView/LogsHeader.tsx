/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './LogsHeader.module.scss'

export interface LogsHeaderProps {
  onNext(searchText: string): void
  onPrev(searchText: string): void
  searchDir: string
  subHeader?: string
  header?: string
  showCross?: boolean
  redirectToLogView?: any
}
function LogsHeader(props: LogsHeaderProps) {
  const { subHeader = '', /* searchDir */ header = 'Logs', showCross = false, redirectToLogView } = props
  const { getString } = useStrings()
  /*const onSearch = (text: string) => {
    if (searchDir === 'prev') {
      props.onPrev(text)
    } else if (searchDir === 'next') {
      props.onNext(text)
    }
  }*/

  return (
    <Container className={css.headerContainer}>
      <header className={css.logsHeader}>
        <section className={css.headerContent}>
          <Text className={css.header}>{header}</Text>
          <Text font="small" className={css.subHeader}>
            {subHeader}
          </Text>
        </section>
        <div></div>
      </header>

      <section className={css.headerActions}>
        {redirectToLogView && (
          <Button
            text={getString('logView')}
            className={css.redirectBtn}
            onClick={() => {
              redirectToLogView()
            }}
          ></Button>
        )}
        <div className={css.searchInput}>
          {/*TODO: curent implementation is not working (temporary removed)<ExpandingSearchInput
            onChange={onSearch}
            onEnter={onSearch}
            placeholder="Search"
            onPrev={props.onPrev}
            onNext={props.onNext}
            showPrevNextButtons
            throttle={200}
          />*/}
        </div>
        {/* TODO: disabled until implementation is done*/}
        {/* <Button disabled minimal icon="download" className={css.download}></Button> */}
        {/* <Icon name="download" size={16} className={css.btn} /> */}
        {showCross && <Button minimal icon="cross" className={css.remove}></Button>}
      </section>
    </Container>
  )
}

export default LogsHeader
