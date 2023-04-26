/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Text, Container, TagsPopover, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo, isEmpty } from 'lodash-es'
import type { ServiceResponse } from 'services/cd-ng'
import { ServiceMenu } from '../ServicesListColumns/ServicesListColumns'
import css from './ServiceCard.module.scss'

interface ServiceCardProps {
  data: ServiceResponse
  onEdit?: () => Promise<void>
  onRefresh?: () => Promise<void>
  onServiceSelect?: (data: any) => Promise<void>
  isForceDeleteEnabled: boolean
}

const ServiceCard: React.FC<ServiceCardProps> = props => {
  const { data, onRefresh, onServiceSelect, isForceDeleteEnabled } = props

  return (
    <Card className={css.card} onClick={() => onServiceSelect && onServiceSelect(data?.service)}>
      <Container className={css.projectInfo}>
        <div className={css.mainTitle}>
          <Text
            lineClamp={1}
            color={Color.GREY_800}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '32px',
              wordBreak: 'break-word'
            }}
          >
            {data?.service?.name}
          </Text>
          <ServiceMenu data={data?.service} onRefresh={onRefresh} isForceDeleteEnabled={isForceDeleteEnabled} />
        </div>

        <Layout.Horizontal margin={{ top: 'xsmall', bottom: 'xsmall' }} className={css.idTags}>
          <Text
            lineClamp={2}
            color={Color.GREY_500}
            style={{
              fontSize: '12px',
              lineHeight: '24px',
              wordBreak: 'break-word'
            }}
          >
            Id: {data?.service?.identifier}
          </Text>

          {!isEmpty(data?.service?.tags) && (
            <TagsPopover
              className={css.tagsPopover}
              iconProps={{ size: 14, color: Color.GREY_600 }}
              tags={defaultTo(data?.service?.tags, {})}
            />
          )}
        </Layout.Horizontal>

        {data?.service?.description && (
          <div className={css.serviceInfo}>
            <div className={css.cardInfoRow}>
              <div className={css.cardInfoValue}>
                <Layout.Vertical>
                  <Text lineClamp={3}>{data?.service?.description}</Text>
                </Layout.Vertical>
              </div>
            </div>
          </div>
        )}
      </Container>
    </Card>
  )
}

export default ServiceCard
