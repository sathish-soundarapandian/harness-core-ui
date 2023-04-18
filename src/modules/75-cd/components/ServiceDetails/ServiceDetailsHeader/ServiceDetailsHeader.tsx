/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useImperativeHandle } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Classes, Position } from '@blueprintjs/core'
import { Button, ButtonSize, Icon, Layout, Popover, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useGetServiceHeaderInfo } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { getReadableDateTime } from '@common/utils/dateUtils'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import type { ModulePathParams, ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ServiceHeaderRefetchRef } from '@cd/components/Services/ServiceStudio/ServiceStudio'
import { useServiceContext } from '@cd/context/ServiceContext'
import { ServiceTabs } from '@cd/components/Services/utils/ServiceUtils'
import { DeploymentTypeIcons } from '@cd/components/DeploymentTypeIcons/DeploymentTypeIcons'
import notificationImg from './notificationImg.svg'
import css from '@cd/components/ServiceDetails/ServiceDetailsHeader/ServiceDetailsHeader.module.scss'

export const ServiceDetailsHeader = (
  _props: unknown,
  ref: React.ForwardedRef<ServiceHeaderRefetchRef>
): JSX.Element => {
  const { accountId, orgIdentifier, projectIdentifier, serviceId, module } = useParams<
    ProjectPathProps & ModulePathParams & ServicePathProps
  >()
  const { getString } = useStrings()
  const { setDrawerOpen, notificationPopoverVisibility, setNotificationPopoverVisibility } = useServiceContext()
  const { tab } = useQueryParams<{ tab: string }>()
  const showNotificationIcon =
    useFeatureFlag(FeatureFlag.CDC_SERVICE_DASHBOARD_REVAMP_NG) && (!tab || tab === ServiceTabs.SUMMARY)

  const { loading, error, data, refetch } = useGetServiceHeaderInfo({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      serviceId
    }
  })

  //handler for attaching refetch function to the parent ref
  useImperativeHandle(ref, () => ({
    refetchData() {
      refetch()
    }
  }))

  useDocumentTitle([data?.data?.name || getString('services')])

  const TitleComponent =
    data?.data && !loading && !error ? (
      <Layout.Horizontal padding={{ top: 'small', right: 'medium' }} width="100%">
        <Layout.Horizontal margin={{ right: 'small' }}>
          <DeploymentTypeIcons
            deploymentTypes={defaultTo(data.data.deploymentTypes, [])}
            deploymentIconList={defaultTo(data.data.deploymentIconList, [])}
            size={38}
          />
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} className={css.serviceDetails}>
          <Layout.Vertical className={css.detailsSection} spacing={'small'}>
            <Text font={{ size: 'medium' }} color={Color.BLACK} className={css.textOverflow}>
              {data.data.name}
            </Text>
            <Text font={{ size: 'small' }} color={Color.GREY_500} className={css.textOverflow}>
              {`${getString('common.ID')}: ${serviceId}`}
            </Text>
            {data.data.description && (
              <Text font={{ size: 'small' }} color={Color.GREY_500} width={800} lineClamp={1}>
                {data.data.description}
              </Text>
            )}
          </Layout.Vertical>

          <Layout.Horizontal>
            <Layout.Vertical padding={{ right: showNotificationIcon ? 'xxlarge' : '' }}>
              <Layout.Horizontal margin={{ bottom: 'small' }}>
                <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK} margin={{ right: 'small' }}>
                  {getString('created')}
                </Text>
                <Text font={{ size: 'small' }}>{getReadableDateTime(data.data.createdAt, 'MMM DD, YYYY hh:mm a')}</Text>
              </Layout.Horizontal>
              <Layout.Horizontal>
                <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK} margin={{ right: 'small' }}>
                  {getString('lastUpdated')}
                </Text>
                <Text font={{ size: 'small' }}>
                  {getReadableDateTime(data.data.lastModifiedAt, 'MMM DD, YYYY hh:mm a')}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
            {showNotificationIcon && (
              <Popover
                interactionKind="click"
                popoverClassName={Classes.DARK}
                position={Position.LEFT}
                isOpen={notificationPopoverVisibility}
                content={
                  <Layout.Horizontal className={css.notificationPopover}>
                    <img src={notificationImg} alt={getString('cd.openTask.notificationImgAlt')} height={80} />
                    <Layout.Vertical padding={{ left: 'medium' }}>
                      <Text
                        font={{ variation: FontVariation.SMALL, weight: 'bold' }}
                        color={Color.GREY_100}
                        padding={{ bottom: 'xsmall' }}
                      >
                        {getString('cd.openTask.notificationPopoverExpression')}
                      </Text>
                      <Text
                        font={{ variation: FontVariation.SMALL }}
                        color={Color.GREY_100}
                        lineClamp={2}
                        padding={{ bottom: 'medium' }}
                      >
                        {getString('cd.openTask.notificationPopoverMsg')}
                      </Text>
                      <Button
                        size={ButtonSize.SMALL}
                        className={css.notificationPopoverBtn}
                        text={getString('cd.openTask.notificationPopoverBtn')}
                        onClick={() => setNotificationPopoverVisibility?.(false)}
                      />
                    </Layout.Vertical>
                  </Layout.Horizontal>
                }
              >
                <Icon
                  name="right-bar-notification"
                  size={24}
                  className={css.cursor}
                  onClick={() => {
                    setDrawerOpen?.(true)
                    setNotificationPopoverVisibility?.(false)
                  }}
                />
              </Popover>
            )}
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Layout.Horizontal>
    ) : (
      serviceId
    )

  return (
    <Page.Header
      title={TitleComponent}
      className={cx(css.header, { [css.headerWithDescShown]: data?.data?.description })}
      size="large"
      breadcrumbs={
        <NGBreadcrumbs
          links={[
            {
              url: routes.toServices({ orgIdentifier, projectIdentifier, accountId, module }),
              label: getString('services')
            }
          ]}
        />
      }
    />
  )
}

export const ServiceDetailHeaderRef = React.forwardRef(ServiceDetailsHeader)
