/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Container, getErrorInfoFromErrorObject, Icon, Layout, PageError, Text } from '@harness/uicore'
import { Drawer } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import type {
  FreezeSummaryResponse,
  GetFrozenExecutionDetailsQueryParams} from 'services/cd-ng';
import {
  useGetFrozenExecutionDetails
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import frozenExecutionEmptyState from './FrozenExecutionEmptyState.svg'
import { FrozenExecutionListTable } from './FrozenExecutionListTable'
import css from './FrozenExecutionDrawer.module.scss'
import style from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer.module.scss'

interface FrozenExecutionProps {
  planExecutionId: string | undefined
  drawerOpen: boolean
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function FrozenExecutionDrawer(props: FrozenExecutionProps): JSX.Element {
  const { planExecutionId, drawerOpen, setDrawerOpen } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelineType<PipelinePathProps>>()
  const [drawerVisible, setDrawerVisible] = useState<boolean>(drawerOpen)
  const { getString } = useStrings()

  const queryParams: GetFrozenExecutionDetailsQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier: orgIdentifier,
    projectIdentifier: projectIdentifier,
    planExecutionId: defaultTo(planExecutionId, '')
  }
  const { data, loading, error, refetch } = useGetFrozenExecutionDetails({ queryParams, lazy: !drawerVisible })

  const tableData = defaultTo(
    data?.data?.freezeList?.map(res => res?.freeze),
    []
  ) as FreezeSummaryResponse[]

  return (
    <>
      <Drawer
        enforceFocus={false}
        size={'calc(100% - 400px)'}
        isOpen={drawerVisible}
        data-testid={'frozenExecutionDrawer'}
        canOutsideClickClose={true}
        onClose={
          /* istanbul ignore next */ () => {
            setDrawerOpen(false)
          }
        }
      >
        <Button
          minimal
          className={style.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => {
            setDrawerVisible(false)
            setDrawerOpen(false)
          }}
        />
        <Layout.Vertical className={css.frozenExecutionBgColor} height={'100vh'}>
          <Layout.Horizontal
            spacing="medium"
            flex={{ alignItems: 'center', justifyContent: 'space-between' }}
            className={css.headerStyle}
            padding={{ top: 'large', bottom: 'large', right: 'xxlarge' }}
          >
            <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'start' }}>
              <Text font={{ variation: FontVariation.BLOCKQUOTE }}>{getString('common.freezeWindows')}</Text>
              <ExecutionStatusLabel status={ExecutionStatusEnum.AbortedByFreeze} />
            </Layout.Horizontal>
            <Icon name="refresh" color={Color.PRIMARY_7} onClick={() => refetch()} className={css.cursor} />
          </Layout.Horizontal>
          {loading ? (
            <Container
              flex={{ justifyContent: 'center', alignItems: 'center' }}
              height={'calc(100vh - 120px'}
              data-test="FrozenExecutionListTableLoading"
            >
              <Icon name="spinner" color={Color.GREY_500} size={30} />
            </Container>
          ) : error ? (
            <Container
              data-test="FrozenExecutionListTableError"
              height={'calc(100vh - 120px'}
              flex={{ justifyContent: 'center' }}
            >
              <PageError onClick={() => refetch()} message={getErrorInfoFromErrorObject(error)} />
            </Container>
          ) : !tableData.length ? (
            <Layout.Vertical flex={{ alignItems: 'center', justifyContent: 'center' }} height={'calc(100vh - 200px'}>
              <img
                src={frozenExecutionEmptyState}
                alt={getString('pipeline.frozenExecList.emptyStateMsg')}
                className={css.emptyStateStyle}
              />
              <Text font={{ variation: FontVariation.BODY }} margin={{ left: 'xxxlarge' }}>
                {getString('pipeline.frozenExecList.emptyStateMsg')}
              </Text>
            </Layout.Vertical>
          ) : (
            <FrozenExecutionListTable data={tableData} />
          )}
        </Layout.Vertical>
      </Drawer>
    </>
  )
}
