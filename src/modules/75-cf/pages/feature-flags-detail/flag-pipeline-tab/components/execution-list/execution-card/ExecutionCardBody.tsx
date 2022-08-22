/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Collapse, Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { FC } from 'react'
import type { FeaturePipelineExecution, Variation } from 'services/cf'
import { useStrings } from 'framework/strings'
import useFlagVariation from '../../../hooks/useFlagVariation'
import TargetItem from './targeting/TargetItem'
import TargetGroupItem from './targeting/TargetGroupItem'
import PercentageRolloutItem from './targeting/PercentageRolloutItem'
import StageStatus from './stage-status/StageStatus'
import css from '../ExecutionList.module.scss'

interface ExecutionCardBodyProps {
  executionHistoryItem: FeaturePipelineExecution
  flagVariations: Variation[]
}

const ExecutionCardBody: FC<ExecutionCardBodyProps> = ({ flagVariations, executionHistoryItem }) => {
  const { getVariationColorById } = useFlagVariation({
    flagVariations
  })

  const { getString } = useStrings()

  const percentageRolloutRules =
    executionHistoryItem.triggerDetails.rules?.filter(rule => rule.serve.distribution) || []

  return (
    <Container padding="medium" flex={{ justifyContent: 'space-between', alignItems: 'baseline' }} width="100%">
      <Collapse
        heading={
          <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_900} margin={{ left: 'small' }}>
            {getString('cf.featureFlags.flagPipeline.triggerDetails')}
          </Text>
        }
        collapseClassName={css.collapse}
      >
        <div className={css.collapseBody}>
          {executionHistoryItem.triggerDetails.state && (
            <>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500} inline>
                {getString('cf.featureFlags.flagPipeline.flagState')}:
              </Text>
              <Text
                font={{ variation: FontVariation.SMALL_SEMI }}
                color={Color.GREY_900}
                inline
                data-testid="flag-state"
              >
                {executionHistoryItem.triggerDetails.state}
              </Text>
            </>
          )}

          {executionHistoryItem.triggerDetails.defaultServe && (
            <>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500} inline>
                {getString('cf.featureFlags.flagPipeline.defaultServe')}:
              </Text>
              <Text
                icon="full-circle"
                iconProps={{
                  size: 12,
                  style: {
                    color: getVariationColorById(executionHistoryItem.triggerDetails.defaultServe.variation as string)
                  }
                }}
                font={{ variation: FontVariation.SMALL_BOLD }}
                color={Color.GREY_900}
                data-testid="defaultServe"
              >
                {executionHistoryItem.triggerDetails.defaultServe.variation}
              </Text>
            </>
          )}
          {executionHistoryItem.triggerDetails.defaultOffVariation && (
            <>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500} inline>
                {getString('cf.featureFlags.flagPipeline.defaultOffVariation')}:
              </Text>
              <Text
                icon="full-circle"
                iconProps={{
                  size: 12,
                  style: {
                    color: getVariationColorById(
                      executionHistoryItem.triggerDetails.defaultOffVariation.variation as string
                    )
                  }
                }}
                font={{ variation: FontVariation.SMALL_BOLD }}
                color={Color.GREY_900}
                data-testid="defaultOffVariation"
              >
                {executionHistoryItem.triggerDetails.defaultOffVariation.variation}
              </Text>
            </>
          )}

          {(executionHistoryItem.triggerDetails.variationMap || percentageRolloutRules.length > 0) && (
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500} inline>
              {getString('cf.featureFlags.flagPipeline.targeting')}:
            </Text>
          )}

          {executionHistoryItem.triggerDetails.variationMap?.map(variationMapItem => (
            <>
              {variationMapItem.targets && (
                <TargetItem
                  targets={variationMapItem.targets}
                  variation={variationMapItem.variation}
                  getVariationColorById={getVariationColorById}
                />
              )}
              {variationMapItem.targetSegments && (
                <TargetGroupItem
                  targetSegments={variationMapItem.targetSegments}
                  variation={variationMapItem.variation}
                  getVariationColorById={getVariationColorById}
                />
              )}
            </>
          ))}
          {percentageRolloutRules.map(percentageRollout => (
            <PercentageRolloutItem
              key={percentageRollout.ruleId}
              percentageRollout={percentageRollout}
              flagVariations={flagVariations}
            />
          ))}
        </div>
      </Collapse>

      <Layout.Horizontal spacing="small" margin={{ right: 'medium' }}>
        <StageStatus executionHistoryItem={executionHistoryItem} />
      </Layout.Horizontal>
    </Container>
  )
}

export default ExecutionCardBody
