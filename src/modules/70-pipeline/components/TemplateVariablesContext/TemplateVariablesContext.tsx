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
  useCreateVariablesV2,
  useGetYamlWithTemplateRefsResolved,
  VariableMergeServiceResponse
} from 'services/template-ng'
import type { UseMutateAsGetReturn } from '@common/hooks/useMutateAsGet'
import type { StageElementConfig, StepElementConfig } from 'services/cd-ng'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { ServiceExpressionProperties } from 'services/pipeline-ng'
import type { YamlExtraProperties } from 'services/pipeline-ng'

const templateTypeYamlKeyMap: { [key: string]: string } = {
  monitoredservice: 'monitoredService',
  secretmanager: 'secretManager',
  customdeployment: 'customDeployment'
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
  originalTemplate: NGTemplateInfoConfig
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  serviceExpressionPropertiesList: ServiceExpressionProperties[]
  error?: UseMutateAsGetReturn<Failure | Error>['error'] | null
  initLoading: boolean
  loading: boolean
}

export const TemplateVariablesContext = React.createContext<TemplateVariablesData>({
  variablesTemplate: { name: '', identifier: '' },
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
  props: React.PropsWithChildren<{ template: NGTemplateInfoConfig }>
): React.ReactElement {
  const { template: originalTemplate } = props
  const [{ variablesTemplate, metadataMap, serviceExpressionPropertiesList }, setTemplateVariablesData] =
    React.useState<
      Pick<TemplateVariablesData, 'metadataMap' | 'variablesTemplate' | 'serviceExpressionPropertiesList'>
    >({
      variablesTemplate: { name: '', identifier: '' },
      metadataMap: {},
      serviceExpressionPropertiesList: []
    })
  const { accountId, orgIdentifier, projectIdentifier } = useParams<TemplateStudioPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [resolvedTemplate, setResolvedTemplate] = React.useState<NGTemplateInfoConfig>(originalTemplate)

  const { data, error, initLoading, loading } = useMutateAsGet(useCreateVariablesV2, {
    body: yamlStringify({ template: resolvedTemplate }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    },
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
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
      repoIdentifier,
      branch,
      getDefaultFromOtherRepo: true
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
    const templateType =
      templateTypeYamlKeyMap[resolvedTemplate.type?.toLowerCase()] || resolvedTemplate.type?.toLowerCase()

    setTemplateVariablesData({
      metadataMap: defaultTo(data?.data?.metadataMap as YamlExtraProperties, {}),
      variablesTemplate: get(parse(defaultTo(data?.data?.yaml, '')), templateType),
      serviceExpressionPropertiesList: defaultTo(data?.data?.serviceExpressionPropertiesList, [])
    })
  }, [data?.data?.metadataMap, data?.data?.yaml])

  return (
    <TemplateVariablesContext.Provider
      value={{
        variablesTemplate,
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
