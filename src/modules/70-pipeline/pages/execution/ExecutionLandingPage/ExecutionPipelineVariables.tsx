import React from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { defaultTo, noop } from 'lodash-es'
import { PipelineVariablesContext } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { parse } from '@common/utils/YamlHelperMethods'
import {
  PipelineInfoConfig,
  useCreateVariablesForPipelineExecution,
  VariableMergeServiceResponse
} from 'services/pipeline-ng'
import type { Pipeline } from '@pipeline/utils/types'

export interface ExecutionPipelineVariablesProps {
  shouldFetch?: boolean
  accountIdentifier: string
  orgIdentifier: string
  projectIdentifier: string
  planExecutionId: string
}

export function ExecutionPipelineVariables(
  props: React.PropsWithChildren<ExecutionPipelineVariablesProps>
): React.ReactElement {
  const { shouldFetch, children, accountIdentifier, orgIdentifier, projectIdentifier, planExecutionId } = props
  const [variablesPipeline, setVariablesPipeline] = React.useState<PipelineInfoConfig>({} as PipelineInfoConfig)
  const [originalPipeline, setOriginalPipeline] = React.useState<PipelineInfoConfig>({} as PipelineInfoConfig)
  const [metadataMap, setMetadataMap] = React.useState<Required<VariableMergeServiceResponse>['metadataMap']>({})
  const [serviceExpressionPropertiesList, setServiceExpressionPropertiesList] = React.useState<
    Required<VariableMergeServiceResponse>['serviceExpressionPropertiesList']
  >([])
  const { mutate: getVariablesData, cancel } = useCreateVariablesForPipelineExecution({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      planExecutionId
    }
  })

  React.useEffect(() => {
    if (shouldFetch) {
      getVariablesData({} as unknown as void).then(data => {
        unstable_batchedUpdates(() => {
          setVariablesPipeline(
            parse<Pipeline>(defaultTo(data?.data?.variableMergeServiceResponse?.yaml, 'pipeline: {}')).pipeline
          )
          setOriginalPipeline(parse<Pipeline>(defaultTo(data?.data?.pipelineYaml, 'pipeline: {}')).pipeline)
          setMetadataMap(defaultTo(data?.data?.variableMergeServiceResponse?.metadataMap, {}))
          setServiceExpressionPropertiesList(
            defaultTo(data?.data?.variableMergeServiceResponse?.serviceExpressionPropertiesList, [])
          )
        })
      })
    }

    return () => {
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch])

  return (
    <PipelineVariablesContext.Provider
      value={{
        variablesPipeline,
        originalPipeline,
        metadataMap,
        serviceExpressionPropertiesList,
        error: null,
        initLoading: false,
        loading: false,
        setPipeline: noop,
        setResolvedPipeline: noop
      }}
    >
      {children}
    </PipelineVariablesContext.Provider>
  )
}
