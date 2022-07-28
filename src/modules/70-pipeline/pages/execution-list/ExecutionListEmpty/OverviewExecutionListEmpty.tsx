/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import { Container, Layout, ModalDialog, Text } from '@wings-software/uicore'
import cdPipelineIllustration from '@pipeline/pages/pipeline-list/images/cd-pipeline-illustration.svg'
import { useStrings } from 'framework/strings'
import cdExecutionIllustration from '../images/cd-execution-illustration.svg'
import { useExecutionListEmptyAction } from './useExecutionListEmptyAction'
import css from './ExecutionListEmpty.module.scss'

export interface OverviewExecutionListProps {
  onRunPipeline(): void
  onHide: () => void
  isPipelineInvalid?: boolean
}

export function OverviewExecutionListEmpty({
  isPipelineInvalid,
  onRunPipeline,
  onHide
}: OverviewExecutionListProps): JSX.Element {
  const { getString } = useStrings()
  const { hasNoPipelines, loading, EmptyAction } = useExecutionListEmptyAction(!!isPipelineInvalid, onRunPipeline)
  return (
    <ModalDialog
      isOpen={true}
      style={{ width: 610 }}
      enforceFocus={false}
      portalClassName={css.overviewNoExecutions}
      usePortal={true}
      isCloseButtonShown={true}
      onClose={onHide}
    >
      {!loading && (
        <Layout.Horizontal className={cx({ [css.imageNoPipeline]: !hasNoPipelines })}>
          <Layout.Vertical width="40%">
            <Text
              className={css.noPipelineText}
              margin={{ top: 'medium', bottom: 'small' }}
              font={{ weight: 'bold', size: 'medium' }}
              color={Color.GREY_700}
            >
              {hasNoPipelines
                ? getString('pipeline.OverviewEmptyStates.createPipelineHeaderMsg')
                : getString('pipeline.OverviewEmptyStates.runPipelineHeaderMsg')}
            </Text>
            <Text
              margin={{ top: 'xsmall', bottom: 'xlarge' }}
              font={{ variation: FontVariation.BODY }}
              color={Color.GREY_700}
              padding={{ bottom: 'small' }}
            >
              {hasNoPipelines
                ? getString('pipeline.OverviewEmptyStates.createPipelineInfo')
                : getString('pipeline.OverviewEmptyStates.runPipelineInfo')}
            </Text>
            <EmptyAction />
          </Layout.Vertical>
          <Container width="50%">
            <img src={hasNoPipelines ? cdPipelineIllustration : cdExecutionIllustration} />
          </Container>
        </Layout.Horizontal>
      )}
    </ModalDialog>
  )
}
