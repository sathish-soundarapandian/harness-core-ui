import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import { Container, Layout, ModalDialog, Text } from '@wings-software/uicore'
import cdPipelineIllustration from '@pipeline/pages/pipeline-list/images/cd-pipeline-illustration.svg'
import { useStrings } from 'framework/strings'
import type { ExecutionListProps } from '../ExecutionList'
import cdExecutionIllustration from '../images/cd-execution-illustration.svg'
import { useExecutionListEmptyAction } from './useExecutionListEmptyAction'
import css from './ExecutionListEmpty.module.scss'

export function OverviewExecutionListEmpty({
  isPipelineInvalid,
  onRunPipeline
}: Pick<ExecutionListProps, 'isPipelineInvalid' | 'onRunPipeline'>): JSX.Element {
  const { getString } = useStrings()
  const { hasNoPipelines, loading, EmptyAction } = useExecutionListEmptyAction(!!isPipelineInvalid, onRunPipeline)
  return (
    <ModalDialog
      isOpen={true}
      style={{ width: 610 }}
      enforceFocus={false}
      portalClassName={css.overviewNoExecutions}
      usePortal={true}
    >
      {!loading && (
        <Layout.Horizontal>
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
