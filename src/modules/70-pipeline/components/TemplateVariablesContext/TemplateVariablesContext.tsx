/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import type { GitQueryParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { parse, yamlStringify } from '@common/utils/YamlHelperMethods'
import {
  Failure,
  NGTemplateInfoConfig,
  NGVariable,
  useCreateVariablesV2,
  useGetYamlWithTemplateRefsResolved,
  VariableMergeServiceResponse
} from 'services/template-ng'
import type { UseMutateAsGetReturn } from '@common/hooks/useMutateAsGet'
import type { StageElementConfig, StepElementConfig } from 'services/cd-ng'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { ServiceExpressionProperties } from 'services/pipeline-ng'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'

const templateTypeYamlKeyMap: { [key: string]: string } = {
  monitoredservice: 'monitoredService',
  secretmanager: 'secretManager',
  customdeployment: 'customDeployment',
  artifactsource: 'artifactSource'
}

export interface MonitoredServiceConfig {
  environmentRef: string
  identifier: string
  name: string
  serviceRef: string
  sources: string
  type: string
  variables: AllNGVariables[]
  __uuid: string
  spec?: any
}

export interface TemplateVariablesData {
  variablesTemplate: StepElementConfig | StageElementConfig | MonitoredServiceConfig
  variablesTemplateVariables: NGVariable[]
  originalTemplate: NGTemplateInfoConfig
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  serviceExpressionPropertiesList: ServiceExpressionProperties[]
  error?: UseMutateAsGetReturn<Failure | Error>['error'] | null
  initLoading: boolean
  loading: boolean
}

export const TemplateVariablesContext = React.createContext<TemplateVariablesData>({
  variablesTemplate: { name: '', identifier: '' },
  variablesTemplateVariables: [],
  originalTemplate: { name: '', identifier: '', versionLabel: '', type: 'Step' },
  metadataMap: {},
  serviceExpressionPropertiesList: [],
  error: null,
  initLoading: true,
  loading: false
})

export function useTemplateVariables(): TemplateVariablesData {
  return React.useContext(TemplateVariablesContext)
}

export function TemplateVariablesContextProvider(
  props: React.PropsWithChildren<{ template: NGTemplateInfoConfig; storeMetadata?: StoreMetadata }>
): React.ReactElement {
  const { template: originalTemplate, storeMetadata = {} } = props
  const [
    { variablesTemplate, variablesTemplateVariables, metadataMap, serviceExpressionPropertiesList },
    setTemplateVariablesData
  ] = React.useState<
    Pick<
      TemplateVariablesData,
      'metadataMap' | 'variablesTemplate' | 'serviceExpressionPropertiesList' | 'variablesTemplateVariables'
    >
  >({
    variablesTemplate: { name: '', identifier: '' },
    metadataMap: {},
    serviceExpressionPropertiesList: [],
    variablesTemplateVariables: []
  })
  const params = useParams<TemplateStudioPathProps>()
  const { accountId, orgIdentifier, projectIdentifier } = params
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [resolvedTemplate, setResolvedTemplate] = React.useState<NGTemplateInfoConfig>(originalTemplate)

  const { data, error, initLoading, loading } = useMutateAsGet(useCreateVariablesV2, {
    body: yamlStringify({ template: resolvedTemplate }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      parentEntityConnectorRef: storeMetadata.connectorRef,
      parentEntityRepoName: storeMetadata.repoName
    },
    debounce: 800
  })

  const {
    data: resolvedTemplateResponse,
    initLoading: initLoadingResolvedTemplate,
    loading: loadingResolvedTemplate
  } = useMutateAsGet(useGetYamlWithTemplateRefsResolved, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      ...getGitQueryParamsWithParentScope(storeMetadata, params, repoIdentifier, branch)
    },
    body: {
      originalEntityYaml: yamlStringify(originalTemplate)
    }
  })

  React.useEffect(() => {
    if (resolvedTemplateResponse?.data?.mergedPipelineYaml) {
      setResolvedTemplate(parse(resolvedTemplateResponse.data.mergedPipelineYaml))
    }
  }, [resolvedTemplateResponse])

  React.useEffect(() => {
    const variablesYaml = parse(defaultTo(data?.data?.yaml, ''))
    const templateType =
      templateTypeYamlKeyMap[resolvedTemplate.type?.toLowerCase()] || resolvedTemplate.type?.toLowerCase()

    setTemplateVariablesData({
      metadataMap: defaultTo(data?.data?.metadataMap, {}),
      variablesTemplate: get(variablesYaml, templateType),
      serviceExpressionPropertiesList: defaultTo(data?.data?.serviceExpressionPropertiesList, []),
      variablesTemplateVariables: get(variablesYaml, 'variables')
    })
  }, [data?.data?.metadataMap, data?.data?.yaml])

  return (
    <TemplateVariablesContext.Provider
      value={{
        variablesTemplate,
        variablesTemplateVariables,
        originalTemplate: resolvedTemplate,
        metadataMap,
        serviceExpressionPropertiesList,
        error,
        initLoading: initLoading || initLoadingResolvedTemplate,
        loading: loading || loadingResolvedTemplate
      }}
    >
      {props.children}
    </TemplateVariablesContext.Provider>
  )
}
