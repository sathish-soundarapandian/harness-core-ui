/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Drawer } from '@blueprintjs/core'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  getErrorInfoFromErrorObject,
  Icon,
  Layout,
  PageError,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import type { GetOpenTasksQueryParams } from 'services/cd-ng'
import { useGetOpenTasks } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { useServiceContext } from '@cd/context/ServiceContext'
import openTaskEmptyState from './openTaskEmptyState.svg'
import { OpenTaskCard } from './OpenTaskCard/OpenTaskCard'
import css from './ServiceDetailsSummaryV2.module.scss'
import style from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer.module.scss'

export default function OpenTasks(): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const [bannerVisible, setBannerVisible] = useState<boolean>(true)
  const { drawerOpen, setDrawerOpen, setNotificationPopoverVisibility } = useServiceContext()
  const drawerOpenFromBanner = React.useRef(false)
  const { getString } = useStrings()

  //3 days ago
  const startTime = useMemo(() => Date.now() - 3 * 24 * 60 * 60000, [])

  const queryParams: GetOpenTasksQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId,
    startTime
  }

  const { data, loading, error, refetch } = useGetOpenTasks({ queryParams })

  const openTasksData = data?.data
  const countOfTasks = openTasksData?.pipelineDeploymentDetails?.length

  const onDrawerClose = (): void => {
    setDrawerOpen?.(false)
    drawerOpenFromBanner.current && setNotificationPopoverVisibility?.(true)
    drawerOpenFromBanner.current = false
  }

  return (
    <>
      {bannerVisible && countOfTasks ? (
        <Container className={css.openTaskBannerStyle}>
          <Layout.Horizontal>
            <Text
              padding={{ right: 'small' }}
              font={{ variation: FontVariation.SMALL_SEMI }}
              icon="warning-icon"
              iconProps={{ color: Color.ORANGE_700 }}
            >
              {getString('cd.openTask.bannerMsg', { count: countOfTasks })}
            </Text>
            <Button
              variation={ButtonVariation.SECONDARY}
              size={ButtonSize.SMALL}
              text={getString('cd.openTask.seeOpenTask')}
              onClick={() => {
                drawerOpenFromBanner.current = true
                setDrawerOpen?.(true)
                setBannerVisible(false)
              }}
            />
          </Layout.Horizontal>
          <Icon
            name="Stroke"
            color={Color.GREY_700}
            onClick={() => {
              setBannerVisible(false)
              setNotificationPopoverVisibility?.(true)
            }}
            className={css.cursor}
          />
        </Container>
      ) : null}
      <Drawer
        enforceFocus={false}
        size={'calc(100% - 650px)'}
        isOpen={!!drawerOpen}
        data-testid={'openTaskDrawer'}
        canOutsideClickClose={true}
        onClose={onDrawerClose}
      >
        <Button
          minimal
          className={style.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={onDrawerClose}
        />
        <Layout.Vertical padding="xxxlarge" className={css.openTasksBgColor} height={'100vh'}>
          <Text font={{ variation: FontVariation.BLOCKQUOTE }} padding={{ bottom: 'xlarge' }}>
            {getString('cd.openTask.title')}
          </Text>
          <Layout.Vertical className={css.overflowOpenTasks}>
            {openTasksData?.pipelineDeploymentDetails?.length ? (
              openTasksData.pipelineDeploymentDetails?.map((item, idx) => {
                return item && <OpenTaskCard key={`${item.identifier}_${idx}`} openTask={item} />
              })
            ) : (
              <Layout.Vertical
                flex={{ alignItems: 'center', justifyContent: 'center' }}
                className={css.openTaskEmptyState}
              >
                {loading ? (
                  <Icon name="spinner" color={Color.BLUE_500} size={30} />
                ) : error ? (
                  <PageError onClick={() => refetch?.()} message={getErrorInfoFromErrorObject(error)} />
                ) : (
                  <>
                    <img src={openTaskEmptyState} alt={getString('cd.openTask.openTaskEmptyStateMsg')} />
                    <Text font={{ variation: FontVariation.BODY }}>
                      {getString('cd.openTask.openTaskEmptyStateMsg')}
                    </Text>
                  </>
                )}
              </Layout.Vertical>
            )}
          </Layout.Vertical>
        </Layout.Vertical>
      </Drawer>
    </>
  )
}
