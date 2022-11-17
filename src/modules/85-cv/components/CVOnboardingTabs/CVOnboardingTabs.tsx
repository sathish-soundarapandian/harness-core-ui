/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Tabs, Tab, Icon, IconName } from '@harness/uicore'
import ContentEditable from 'react-contenteditable'
import cx from 'classnames'
import type { OnClickHandlerParams } from '@cv/hooks/CVTabsHook/useCVTabsHook'

import css from './CVOnboardingTabs.module.scss'

interface CVTabProps<T> {
  defaultEntityName: string
  setName: (val: string) => void
  iconName: IconName
  tabProps: any[]
  onNext: ({ data, prevTab, newTab }: OnClickHandlerParams<T>) => void
  onPrevious: (prevTab: number, newTab: number) => void
  currentTab: number
  maxEnabledTab: number
}

const CVOnboardingTabs: React.FC<CVTabProps<any>> = props => {
  const [editable, setEditable] = useState(false)

  return (
    <div className={css.tabWrapper}>
      <Tabs
        id="monitoring-sources"
        selectedTabId={props.currentTab}
        defaultSelectedTabId={1}
        onChange={(newTabId: number, prevTabId: number, event) => {
          if (newTabId === 0) {
            event.preventDefault()
          } else if (newTabId > prevTabId) {
            props.onNext({ prevTab: prevTabId, newTab: newTabId })
          } else if (newTabId < prevTabId) {
            props.onPrevious(prevTabId, newTabId)
          }
        }}
      >
        <Tab
          id={0}
          title={
            <div>
              <Icon name={props.iconName} size={16} className={css.nameTypeIcon} />
              <ContentEditable
                html={props.defaultEntityName}
                disabled={!editable}
                className={cx({ [css.editable]: editable })}
                tagName="span"
                onChange={ev => {
                  const val = ev.target.value.replace(/&nbsp;/g, ' ')
                  if (val) {
                    props.setName(val)
                  }
                }}
                onBlur={() => {
                  setEditable(false)
                }}
                onKeyPress={event => {
                  if (event.which === 32) {
                    // space
                    event.stopPropagation()
                  } else if (event.which === 13) {
                    // enter
                    setEditable(false)
                  }
                }}
              />
              <Icon
                name="edit"
                size={12}
                className={css.nameEditIcon}
                onClick={() => {
                  setEditable(true)
                }}
              />
            </div>
          }
          panel={<></>}
        />
        {props.tabProps?.map((item, index) => {
          return (
            <Tab
              key={`${item}${index}`}
              id={item.id}
              title={item.title}
              panel={item.component}
              disabled={item.id <= props.currentTab || item.id <= props.maxEnabledTab ? false : true}
            />
          )
        })}
      </Tabs>
    </div>
  )
}

export default CVOnboardingTabs
