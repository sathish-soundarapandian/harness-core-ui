/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { ButtonSize, ButtonVariation, Card, Icon, IconName, Layout, Heading } from '@wings-software/uicore'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { ComingSoonIcon } from '@common/components/ComingSoonIcon/ComingSoonIcon'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { StageType } from '@pipeline/utils/stageHelpers'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { Category, StageActions } from '@common/constants/TrackingConstants'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import type { PipelineStageProps } from '../PipelineStage'
import EmptyStageView from './EmptyStageView'
import StageHoverView from './StageHoverView'
import css from './AddStageView.module.scss'

export interface AddStageViewProps {
  callback: (type: string) => void
  stages: Array<PipelineStageProps>
  isParallel?: boolean
  contextType?: string
  onUseTemplate?: () => void
}

export interface SelectedAddStageTypeData {
  title?: string
  description?: string
  type?: string
  icon?: IconName
  hoverIcon?: IconName
  isComingSoon?: boolean
}

export function AddStageView({
  callback,
  isParallel = false,
  stages,
  contextType,
  onUseTemplate
}: AddStageViewProps): JSX.Element {
  const isTemplatesEnabled = useFeatureFlag(FeatureFlag.NG_TEMPLATES)
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const [selectedType, setSelectedType] = React.useState<SelectedAddStageTypeData | undefined>(undefined)

  useEffect(() => {
    trackEvent(StageActions.LoadSelectStageTypeView, {
      category: Category.STAGE
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className={cx(css.createNewContent, { [css.parallel]: isParallel })}>
      <div className={css.stageTypeSection}>
        <Layout.Horizontal className={css.stageTitle} margin={{ bottom: 'large' }}>
          <Heading level={6} color={Color.GREY_800}>
            {getString('pipeline.addStage.title')}
          </Heading>
          {isContextTypeNotStageTemplate(contextType) && isTemplatesEnabled && (
            <RbacButton
              text={getString('common.useTemplate')}
              variation={ButtonVariation.SECONDARY}
              size={ButtonSize.SMALL}
              icon="template-library"
              iconProps={{ size: 12 }}
              onClick={onUseTemplate}
              featuresProps={{
                featuresRequest: {
                  featureNames: [FeatureIdentifier.TEMPLATE_SERVICE]
                }
              }}
            />
          )}
        </Layout.Horizontal>
        <div className={css.createNewCards}>
          {stages
            .filter(stage => stage.type !== StageType.Template)
            .map(stage => (
              <React.Fragment key={stage.type}>
                {stage.isHidden !== true && (!stage.isApproval || !isParallel) ? (
                  <div>
                    <Card
                      data-testid={`stage-${stage.type}`}
                      onMouseOver={() => selectedType?.type !== stage.type && setSelectedType(stage)}
                      onMouseLeave={() => setSelectedType(undefined)}
                      interactive={true}
                      disabled={stage.isDisabled}
                      className={cx(css.cardNew)}
                      onClick={e => {
                        if (stage.isDisabled) {
                          e.stopPropagation()
                        } else {
                          // call telemetry
                          trackEvent(StageActions.SelectStage, { stageType: stage.type })
                          callback(stage.type)
                        }
                      }}
                    >
                      {stage.isComingSoon && (
                        <ComingSoonIcon className={css.comingSoon} active={selectedType?.type === stage.type} />
                      )}
                      <Icon name={stage.icon} size={24} {...stage.iconsProps} style={stage.iconsStyle} />
                    </Card>
                    <div className={cx(css.cardTitle, { [css.selected]: selectedType?.type === stage.type })}>
                      {stage.name}
                    </div>
                  </div>
                ) : null}
              </React.Fragment>
            ))}
        </div>
      </div>
      {selectedType ? <StageHoverView selectedStageType={selectedType} /> : <EmptyStageView />}
    </div>
  )
}
