/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Fragment, ReactElement } from 'react'
import type { Row } from 'react-table'
import { Color, Layout, Text } from '@harness/uicore'
import ReactTimeago from 'react-timeago'
import { killEvent } from '@common/utils/eventUtils'
import type { DelegateGroupDetails } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getInstanceStatus } from './utils/DelegateHelper'
import css from './DelegatesPage.module.scss'

export function DelegateInstanceList({ row }: { row: Row<DelegateGroupDetails> }): ReactElement {
  const data = row.original
  const { getString } = useStrings()

  const { USE_IMMUTABLE_DELEGATE } = useFeatureFlags()

  const columnWidths = USE_IMMUTABLE_DELEGATE
    ? /*istanbul ignore next */ {
        icon: '5%',
        name: '24%',
        tags: '15%',
        version: '11%',
        instanceStatus: '18%',
        heartbeat: '14%',
        status: '12%',
        actions: '1%'
      }
    : {
        icon: '8%',
        name: '27%',
        tags: '15%',
        version: '15%',
        heartbeat: '15%',
        status: '15%',
        actions: '5%'
      }
  return (
    <div role="list" onClick={killEvent}>
      <Fragment key={data.delegateGroupIdentifier}>
        {
          /*istanbul ignore next */ data?.delegateInstanceDetails?.length ? (
            data?.delegateInstanceDetails?.map(del => {
              return (
                <div
                  className={`${css.instancesContainer} ${css.podDetailsContainer}`}
                  key={data.delegateGroupIdentifier}
                >
                  <Layout.Horizontal key={del?.uuid} width="100%" spacing={'small'}>
                    <Layout.Horizontal width={columnWidths.icon} />
                    <Layout.Horizontal width={columnWidths.name}>
                      <Text lineClamp={1}>{del?.hostName} </Text>
                    </Layout.Horizontal>
                    <Layout.Horizontal width={columnWidths.tags}></Layout.Horizontal>
                    <Layout.Horizontal width={columnWidths.version}>
                      <Text>{del.version}</Text>
                    </Layout.Horizontal>
                    {USE_IMMUTABLE_DELEGATE && (
                      <Layout.Horizontal width={columnWidths?.instanceStatus}>
                        {getInstanceStatus(data)}
                      </Layout.Horizontal>
                    )}
                    <Layout.Horizontal width={columnWidths.heartbeat}>
                      <Text>
                        {del.lastHeartbeat ? <ReactTimeago date={del.lastHeartbeat} live /> : getString('na')}
                      </Text>
                    </Layout.Horizontal>
                    <Layout.Vertical width={columnWidths.status}>
                      <Text
                        icon="full-circle"
                        iconProps={{
                          size: 6,
                          color: del.activelyConnected ? Color.GREEN_600 : Color.GREY_400,
                          padding: 'small'
                        }}
                      >
                        {del.activelyConnected ? getString('connected') : getString('delegate.notConnected')}
                      </Text>
                    </Layout.Vertical>
                    <Layout.Vertical width={columnWidths.actions} />
                  </Layout.Horizontal>
                </div>
              )
            })
          ) : (
            <Layout.Horizontal className={css.delegateItemSubcontainer}>
              <Text color={Color.BLACK} className={css.noInstances}>
                {getString('delegates.noInstances')}
              </Text>
            </Layout.Horizontal>
          )
        }
      </Fragment>
    </div>
  )
}
