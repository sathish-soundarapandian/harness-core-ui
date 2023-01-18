import produce from 'immer'
import { get, merge, omit, set } from 'lodash-es'
import React from 'react'
import { useParams } from 'react-router-dom'
import {
  DefaultNewStageId,
  DefaultNewStageName
} from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateForm/StageTemplateForm'
import { TemplatePipelineProvider } from '@templates-library/components/TemplatePipelineContext/TemplatePipelineContext'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { DefaultPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { sanitize } from '@common/utils/JSONUtils'
import { PipelineContextType } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StepGroupTemplateCanvasWithRef } from './StepGroupTemplateCanvas'

const StepGroupTemplateCanvasWrapper = (): React.ReactElement => {
  const {
    state: { template, gitDetails, storeMetadata },
    updateTemplate,
    isReadonly,
    renderPipelineStage,
    setIntermittentLoading
  } = React.useContext(TemplateContext)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const pipeline = React.useMemo(
    () =>
      produce({ ...DefaultPipeline }, draft => {
        set(
          draft,
          'stages[0].stage',
          merge(
            {},
            {
              name: DefaultNewStageName,
              identifier: DefaultNewStageId,
              type: template?.spec?.stageType,
              spec: {
                execution: {
                  steps: template?.spec?.steps as any
                }
              }
            }
          )
        )
      }),
    [template.spec]
  )

  const onUpdatePipeline = async (pipelineConfig: PipelineInfoConfig): Promise<void> => {
    const stage = get(pipelineConfig, 'stages[0].stage')
    const processNode = omit(stage, 'name', 'identifier', 'description', 'tags')
    sanitize(processNode, { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false })
    set(template, 'spec.steps', processNode.spec.execution.steps)
    await updateTemplate(template)
  }

  return (
    <TemplatePipelineProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier }}
      initialValue={pipeline}
      gitDetails={gitDetails}
      storeMetadata={storeMetadata}
      onUpdatePipeline={onUpdatePipeline}
      contextType={PipelineContextType.StepGroupTemplate}
      isReadOnly={isReadonly}
      renderPipelineStage={renderPipelineStage}
      setIntermittentLoading={setIntermittentLoading}
    >
      <StepGroupTemplateCanvasWithRef />
    </TemplatePipelineProvider>
  )
}

export const StepGroupTemplateCanvasWrapperWithRef = React.forwardRef(StepGroupTemplateCanvasWrapper)
