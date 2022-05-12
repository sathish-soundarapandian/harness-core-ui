/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { BorderProps } from '@harness/design-system'
import cx from 'classnames'
import { ECSResourceObject, QualityOfService, ResourceDetails, ResourceObject } from '@ce/types'

import css from './RecommendationDiffViewer.module.scss'

interface DiffBlockProps {
  text: string
  color: string
  textColor: string
  resources: ResourceDetails
  border?: BorderProps
  qualityOfService?: QualityOfService
  dataTestId?: string
}

const DiffBlock: React.FC<DiffBlockProps> = ({
  text,
  color,
  resources,
  textColor,
  border,
  qualityOfService,
  dataTestId
}) => {
  const innerElement = (
    <>
      <Text font={{ mono: true, variation: FontVariation.BODY }} color={Color.GREY_600}>
        {text}:
      </Text>
      <Layout.Horizontal padding={{ left: 'medium', top: 'xsmall' }}>
        <Text font={{ mono: true, variation: FontVariation.BODY }} color={Color.GREY_600}>
          memory:
        </Text>
        <Text
          font={{ mono: true, variation: FontVariation.BODY }}
          color={textColor}
          padding={{ left: 'small' }}
          data-testid={`${dataTestId}-memVal`}
        >
          {resources?.memory}
        </Text>
      </Layout.Horizontal>
      {qualityOfService !== QualityOfService.BURSTABLE ? (
        <Layout.Horizontal padding={{ left: 'medium', top: 'xsmall' }}>
          <Text font={{ mono: true, variation: FontVariation.BODY }} color={Color.GREY_600}>
            cpu:
          </Text>
          {resources?.cpu ? (
            <Text
              font={{ mono: true, variation: FontVariation.BODY }}
              color={textColor}
              padding={{ left: 'xsmall' }}
              data-testid={`${dataTestId}-cpuVal`}
            >
              {resources.cpu}
            </Text>
          ) : null}
        </Layout.Horizontal>
      ) : null}
    </>
  )
  return border ? (
    <Container
      background={color}
      padding={{
        left: 'xxlarge',
        top: 'small',
        bottom: 'small'
      }}
      className={cx(
        { [css.borderLeft]: border.left },
        { [css.borderRight]: border.right },
        { [css.borderBottom]: border.bottom }
      )}
    >
      {innerElement}
    </Container>
  ) : (
    <Container
      background={color}
      padding={{
        left: 'xxlarge',
        top: 'small',
        bottom: 'small'
      }}
    >
      {innerElement}
    </Container>
  )
}

interface RecommendationDiffViewerProps {
  recommendedResources: ResourceObject
  currentResources: ResourceObject
  qualityOfService: QualityOfService
}

const RecommendationDiffViewer: React.FC<RecommendationDiffViewerProps> = ({
  recommendedResources,
  currentResources,
  qualityOfService
}) => {
  return (
    <Container className={css.diffContainer}>
      <DiffBlock resources={currentResources.limits} text="limits" color={Color.GREEN_100} textColor={Color.RED_700} />
      <DiffBlock
        resources={
          qualityOfService === QualityOfService.GUARANTEED ? recommendedResources.requests : recommendedResources.limits
        }
        text="limits"
        color={Color.GREEN_100}
        border={{ left: true, right: true }}
        textColor={Color.GREEN_700}
        qualityOfService={qualityOfService}
        dataTestId="limitsId"
      />
      <DiffBlock
        resources={currentResources.requests}
        text="request"
        color={Color.PRIMARY_1}
        textColor={Color.RED_700}
      />
      <DiffBlock
        resources={recommendedResources.requests}
        text="request"
        color={Color.PRIMARY_1}
        border={{ left: true, right: true, bottom: true }}
        textColor={Color.GREEN_700}
        dataTestId="requestId"
      />
    </Container>
  )
}

interface ECSRecommendationDiffViewerProps {
  recommendedResources: ECSResourceObject
  currentResources: ECSResourceObject
}

export const ECSRecommendationDiffViewer: React.FC<ECSRecommendationDiffViewerProps> = ({
  recommendedResources,
  currentResources
}) => {
  return (
    <Container className={css.diffContainer}>
      <DiffBlock
        resources={currentResources.requests}
        text="request"
        color={Color.PRIMARY_1}
        textColor={Color.RED_700}
      />
      <DiffBlock
        resources={recommendedResources.requests}
        text="request"
        color={Color.PRIMARY_1}
        border={{ left: true, right: true, bottom: true }}
        textColor={Color.GREEN_700}
        dataTestId="requestId"
      />
    </Container>
  )
}

export default RecommendationDiffViewer
