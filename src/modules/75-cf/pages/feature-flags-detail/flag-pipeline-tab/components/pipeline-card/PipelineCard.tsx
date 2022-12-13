/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Container, Text } from '@harness/uicore'
import { Icon } from '@harness/icons'
import { Color, FontVariation } from '@harness/design-system'
import { TimeAgo } from '@common/components'
import { useStrings } from 'framework/strings'
import css from './PipelineCard.module.scss'

interface PipelineCardProps {
  identifier: string
  pipelineName: string
  pipelineDescription?: string
  lastUpdatedAt: number
  isSelected: boolean
  onClick: () => void
}

const PipelineCard: React.FC<PipelineCardProps> = ({
  identifier,
  pipelineName,
  pipelineDescription,
  lastUpdatedAt,
  isSelected,
  onClick
}) => {
  const { getString } = useStrings()

  return (
    <Card selected={isSelected} onClick={onClick} role="listitem" className={css.card}>
      <Container className={css.layout}>
        <article>
          <Icon name="ff-solid" size={30} className={css.icon} />
          <Text font={{ variation: FontVariation.BODY2 }}>{pipelineName}</Text>
          <Text font={{ variation: FontVariation.SMALL }} lineClamp={1} color={Color.GREY_500}>
            {getString('idLabel')} {identifier}
          </Text>
          {pipelineDescription && (
            <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
              {pipelineDescription}
            </Text>
          )}
        </article>
        <Text
          tag="footer"
          font={{ variation: FontVariation.TINY }}
          padding={{ top: 'medium' }}
          flex={{ justifyContent: 'space-between' }}
          color={Color.GREY_500}
        >
          {getString('common.lastModified')}
          <TimeAgo time={lastUpdatedAt} icon={undefined} inline color={Color.GREY_800} />
        </Text>
      </Container>
    </Card>
  )
}

export default PipelineCard
