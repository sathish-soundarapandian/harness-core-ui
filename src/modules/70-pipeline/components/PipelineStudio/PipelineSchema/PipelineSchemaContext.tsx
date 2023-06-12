/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import {
  GetSchemaYamlQueryParams,
  GetStaticSchemaYamlQueryParams,
  ResponseJsonNode,
  ResponseYamlSchemaResponse,
  useGetSchemaYaml,
  useGetStaticSchemaYaml,
  useGetStepYamlSchema
} from 'services/pipeline-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useToaster } from '@common/exports'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

export interface PipelineSchemaData {
  pipelineSchema: ResponseJsonNode | null
  loopingStrategySchema: ResponseYamlSchemaResponse | null
}

const PipelineSchemaContext = React.createContext<PipelineSchemaData>({
  pipelineSchema: null,
  loopingStrategySchema: null
})

export function usePipelineSchema(): PipelineSchemaData {
  return React.useContext(PipelineSchemaContext)
}

export function PipelineSchemaContextProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { STATIC_YAML_SCHEMA } = useFeatureFlags()

  const commonQueryParams = {
    entityType: 'Pipelines',
    projectIdentifier: projectIdentifier,
    orgIdentifier: orgIdentifier,
    accountIdentifier: accountId,
    scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
  }

  const { data: pipelineSchemaV1, error: schemaError } = useGetSchemaYaml({
    queryParams: {
      ...commonQueryParams
    } as GetSchemaYamlQueryParams,
    lazy: STATIC_YAML_SCHEMA
  })

  const { data: pipelineStaticSchema, error: staticSchemaError } = useGetStaticSchemaYaml({
    queryParams: {
      ...commonQueryParams
    } as GetStaticSchemaYamlQueryParams,
    lazy: !STATIC_YAML_SCHEMA
  })

  const pipelineSchema = defaultTo(pipelineSchemaV1, pipelineStaticSchema)

  const error = defaultTo(schemaError, staticSchemaError)

  const { data: loopingStrategySchema } = useGetStepYamlSchema({
    queryParams: {
      entityType: 'StrategyNode',
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier }),
      yamlGroup: 'STEP'
    }
  })
  if (error?.message) {
    showError(getRBACErrorMessage(error), undefined, 'pipeline.get.yaml.error')
  }
  return (
    <PipelineSchemaContext.Provider value={{ pipelineSchema, loopingStrategySchema }}>
      {props.children}
    </PipelineSchemaContext.Provider>
  )
}
