import React from 'react'
import { useParams } from 'react-router-dom'
import { PipelineProvider } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { useStrings } from 'framework/strings'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'

export const IACMStudioProvider = ({ children }: any) => {
    console.log('provider');
    const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
    const { getString } = useStrings()
    return (
        <PipelineProvider
            stagesMap={stagesCollection.getAllStagesAttributes(getString)}
            queryParams={{
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
            }}
            pipelineIdentifier={'iac-studio'}
            renderPipelineStage={() => <></>}
            stepsFactory={factory}
            runPipeline={console.log}
        >
            {children}
        </PipelineProvider>
    )
}