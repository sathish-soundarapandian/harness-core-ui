/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import cx from 'classnames'
import { Container, FontVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import Savings from './Savings'
import Utilisation from './Utilisation'
import ComputeCoverage from './ComputeCoverage'
import css from '../CommitmentOrchestrationBody.module.scss'

interface DataVisualisationContainerProps {
  data?: any
}

interface TabProps {
  title: string
  component: React.ReactNode
}

interface TabNavigationProps {
  tabs: TabProps[]
  commonProps?: Record<string, any>
  className?: string
  defaultTab?: number
}

const DataVisualisationContainer: React.FC<DataVisualisationContainerProps> = () => {
  const { getString } = useStrings()
  const tabsData: TabProps[] = useMemo(() => {
    return [
      {
        title: getString('ce.commitmentOrchestration.computeCoverage'),
        component: <ComputeCoverage />
      },
      {
        title: getString('ce.commitmentOrchestration.savings'),
        component: <Savings />
      },
      {
        title: getString('ce.commitmentOrchestration.commitmentUtilisation'),
        component: <Utilisation />
      }
    ]
  }, [getString])

  return (
    <Container className={cx(css.bodyWidgetsContainer, css.dataVisualisationContainer)}>
      <TabNavigation tabs={tabsData} className={css.tabsContainer} />
    </Container>
  )
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, commonProps, className, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState<number>(defaultTab)
  const TabsRef = useRef<HTMLDivElement>(null)
  const [highlightProps, setHighlightProps] = useState({
    width: 0,
    translatePos: 0
  })

  useEffect(() => {
    /* istanbul ignore else */
    if (TabsRef.current) {
      const width = TabsRef.current.children[activeTab].getBoundingClientRect().width
      let translatePos = 0
      if (activeTab > 0) {
        const tabNodes = TabsRef.current.children
        for (let i = 0; i < activeTab; i++) {
          translatePos += tabNodes[i].getBoundingClientRect().width
        }
      }
      setHighlightProps({ width, translatePos })
    }
  }, [activeTab, TabsRef.current])

  return (
    <Container>
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Layout.Horizontal
          className={className}
          flex={{ justifyContent: 'center', alignItems: 'center' }}
          ref={TabsRef}
        >
          {tabs.map((tab, index) => {
            return (
              <Container
                key={tab.title}
                className={cx(css.tab, {
                  [css.activeTab]: activeTab === index
                })}
                onClick={() => {
                  activeTab !== index && setActiveTab(index)
                }}
              >
                <Text font={{ variation: FontVariation.H6 }}>{tab.title}</Text>
              </Container>
            )
          })}
          {highlightProps.width && (
            <Container
              className={css.highlightTab}
              style={{
                width: highlightProps.width,
                transform: `translateX(${highlightProps.translatePos}px)`
              }}
            />
          )}
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Container className={css.componentWrapper}>
        {React.cloneElement((tabs[activeTab]?.component || /* istanbul ignore next */ <div />) as React.ReactElement, {
          ...commonProps
        })}
      </Container>
    </Container>
  )
}

export default DataVisualisationContainer
