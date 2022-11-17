/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useImperativeHandle } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import { useGetServiceHeaderInfo } from 'services/cd-ng'
import { getReadableDateTime } from '@common/utils/dateUtils'
import type { ModulePathParams, ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ServiceHeaderRefetchRef } from '@cd/components/Services/ServiceStudio/ServiceStudio'
import { DeploymentTypeIcons } from '@cd/components/DeploymentTypeIcons/DeploymentTypeIcons'
import css from '@cd/components/ServiceDetails/ServiceDetailsHeader/ServiceDetailsHeader.module.scss'

export const ServiceDetailsHeader = (
  _props: unknown,
  ref: React.ForwardedRef<ServiceHeaderRefetchRef>
): JSX.Element => {
  const { accountId, orgIdentifier, projectIdentifier, serviceId, module } = useParams<
    ProjectPathProps & ModulePathParams & ServicePathProps
  >()
  const { getString } = useStrings()
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
          <DeploymentTypeIcons deploymentTypes={data.data.deploymentTypes || []} size={38} />
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} className={css.serviceDetails}>
          <Layout.Vertical className={css.detailsSection}>
            <Layout.Horizontal
              margin={{ bottom: 'small' }}
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text
                font={{ size: 'medium' }}
                color={Color.BLACK}
                margin={{ right: 'small' }}
                className={css.textOverflow}
              >
                {data.data.name}
              </Text>
              <Text font={{ size: 'small' }} color={Color.GREY_500} className={css.textOverflow}>
                {`${getString('common.ID')}: ${serviceId}`}
              </Text>
            </Layout.Horizontal>
            <Text
              font={{ size: 'small' }}
              color={Color.GREY_500}
              className={css.textOverflow}
              margin={{ right: 'small' }}
            >
              {data.data.description}
            </Text>
          </Layout.Vertical>
          <Layout.Vertical>
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
        </Layout.Horizontal>
      </Layout.Horizontal>
    ) : (
      serviceId
    )

  return (
    <Page.Header
      title={TitleComponent}
      className={css.header}
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
