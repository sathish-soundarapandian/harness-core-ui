/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import {
  Button,
  Card,
  Carousel,
  Icon,
  Layout,
  Text,
  Container,
  PageError,
  ButtonVariation,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { defaultTo, isUndefined, noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { EnvironmentPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  GetActiveServiceInstancesForEnvironmentQueryParams,
  ResponseInstanceGroupedByServiceList,
  useGetActiveServiceInstancesForEnvironment
} from 'services/cd-ng'
import EnvironmentDetailInstanceDialog from './EnvironmentDetailInstanceDialog'
import { ServiceDetailEmptyState } from './EnvironmentDetailsUtils'
import { EnvironmentDetailTable, TableType } from './EnvironmentDetailTable'

import css from './EnvironmentDetailSummary.module.scss'

interface EnvironmentDetailInstancesProps {
  setServiceId: React.Dispatch<React.SetStateAction<string | undefined>>
}

interface ServiceListProp {
  serviceId: string | undefined
  serviceName: string | undefined
}

function createGroups(arr: ServiceListProp[] | undefined): ServiceListProp[][] {
  if (isUndefined(arr)) {
    return []
  }
  const numGroups = Math.ceil(arr.length / 4)
  return new Array(numGroups).fill('').map((_, i) => arr.slice(i * 4, (i + 1) * 4))
}

export function EnvironmentDetailInstances(props: EnvironmentDetailInstancesProps): React.ReactElement {
  const { setServiceId } = props
  const { getString } = useStrings()
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false)
  const [selectedService, setSelectedService] = useState<string>()
  const [svc, setSvc] = useState<string>('')
  const [activeSlide, setActiveSlide] = useState<number>(1)
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    ProjectPathProps & EnvironmentPathProps
  >()

  const queryParams: GetActiveServiceInstancesForEnvironmentQueryParams = {
    accountIdentifier: accountId,
    environmentIdentifier,
    orgIdentifier,
    projectIdentifier
  }

  const { data, loading, error, refetch } = useGetActiveServiceInstancesForEnvironment({ queryParams })
  const serviceDetail = defaultTo(data, [] as ResponseInstanceGroupedByServiceList)

  const serviceInfoPreview = (service: ServiceListProp | undefined): JSX.Element => {
    const serviceId = service?.serviceId
    const serviceName = service?.serviceName
    if (isUndefined(serviceId)) {
      return <></>
    }
    return (
      <Card
        className={cx(css.serviceCards, css.cursor)}
        onClick={() => {
          if (selectedService === serviceId) {
            setSelectedService(undefined)
            setServiceId(undefined)
          } else {
            setSelectedService(serviceId)
            setServiceId(serviceId)
          }
        }}
        selected={selectedService === serviceId}
      >
        <div className={css.serviceCardTitle}>
          <Text
            font={{ variation: FontVariation.CARD_TITLE }}
            icon="services"
            lineClamp={1}
            width={250}
            tooltipProps={{ isDark: true }}
          >
            {serviceName}
          </Text>
        </div>
        <EnvironmentDetailTable
          tableType={TableType.SUMMARY}
          data={serviceDetail?.data?.instanceGroupedByServiceList}
          tableStyle={css.summaryTableStyle}
          serviceFilter={serviceId}
          setRowClickFilter={noop}
        />
        <Text
          color={Color.PRIMARY_7}
          width={50}
          font={{ variation: FontVariation.BODY2 }}
          onClick={e => {
            e.stopPropagation()
            setSvc(serviceId)
            setIsDetailsDialogOpen(true)
          }}
          className={css.cursor}
        >
          {getString('cd.environmentDetailPage.seeFull')}
        </Text>
      </Card>
    )
  }

  const serviceList = serviceDetail?.data?.instanceGroupedByServiceList?.map(item => {
    return { serviceId: item.serviceId, serviceName: item.serviceName }
  })

  const renderCards = createGroups(serviceList)

  const noDataState = !serviceDetail?.data?.instanceGroupedByServiceList?.length || !renderCards.length
  const renderState = React.useMemo(() => {
    if (loading) {
      return (
        <Container className={css.loadingContainer} height={300}>
          <Icon name="spinner" color={Color.BLUE_500} size={30} />
        </Container>
      )
    }
    if (error) {
      return (
        <Container data-test="ActiveServiceInstancesError" height={300} flex={{ justifyContent: 'center' }}>
          <PageError onClick={() => refetch?.()} message={getErrorInfoFromErrorObject(error)} />
        </Container>
      )
    }
    return <ServiceDetailEmptyState />
  }, [error, loading, refetch])

  return (
    <Container>
      <div className={css.titleStyle}>
        <Text color={Color.GREY_800} font={{ weight: 'bold' }}>
          {getString('services')}
        </Text>
        <Button
          variation={ButtonVariation.LINK}
          style={{ paddingRight: 0 }}
          icon="panel-table"
          text={getString('cd.environmentDetailPage.viewInTable')}
          onClick={() => {
            setSvc('')
            setIsDetailsDialogOpen(true)
          }}
          disabled={noDataState}
        />
      </div>
      <EnvironmentDetailInstanceDialog
        isOpen={isDetailsDialogOpen}
        setIsOpen={setIsDetailsDialogOpen}
        serviceFilter={svc}
        data={serviceDetail?.data?.instanceGroupedByServiceList}
      />
      {noDataState ? (
        renderState
      ) : (
        <Carousel
          previousElement={
            activeSlide > 1 ? (
              <Button
                intent="primary"
                className={css.prevButton}
                icon="double-chevron-left"
                minimal
                iconProps={{
                  size: 22,
                  color: Color.PRIMARY_7
                }}
              />
            ) : (
              <span />
            )
          }
          nextElement={
            activeSlide < Math.ceil(defaultTo(serviceList, []).length / 4) ? (
              <Button
                intent="primary"
                className={css.nextButton}
                icon="double-chevron-right"
                minimal
                iconProps={{
                  size: 22,
                  color: Color.PRIMARY_7
                }}
              />
            ) : (
              <span />
            )
          }
          hideIndicators={true}
          onChange={setActiveSlide}
          slideClassName={css.slideStyle}
        >
          {renderCards.map((item, idx) => {
            return (
              <Layout.Horizontal key={idx} className={css.cardGrid}>
                {item[0] && serviceInfoPreview(item[0])}
                {item[1] && serviceInfoPreview(item[1])}
                {item[2] && serviceInfoPreview(item[2])}
                {item[3] && serviceInfoPreview(item[3])}
              </Layout.Horizontal>
            )
          })}
        </Carousel>
      )}
    </Container>
  )
}
