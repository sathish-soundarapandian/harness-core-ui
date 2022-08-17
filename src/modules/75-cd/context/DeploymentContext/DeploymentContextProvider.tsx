/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useState } from 'react'
import get from 'lodash/get'
import { merge, map, compact, isEmpty } from 'lodash-es'
import type { NGTemplateInfoConfig, EntityGitDetails } from 'services/template-ng'
import { sanitize } from '@common/utils/JSONUtils'
import type { GetPipelineQueryParams } from 'services/pipeline-ng'
import { getTemplateTypesByRef, TemplateServiceDataType } from '@pipeline/utils/templateUtils'

export interface DeploymentContextProps {
  onDeploymentConfigUpdate: (configValues: any) => Promise<void>
  deploymentConfigInitialValues: NGTemplateInfoConfig['spec']
  isReadonly: boolean
  gitDetails: EntityGitDetails
  queryParams: GetPipelineQueryParams
}

export interface DeploymentConfigValues
  extends Omit<DeploymentContextProps, 'queryParams' | 'deploymentConfigInitialValues' | 'onDeploymentConfigUpdate'> {
  deploymentConfig: NGTemplateInfoConfig['spec']
  updateDeploymentConfig: (configValues: any) => Promise<void>
  templateTypes: { [key: string]: string }
  templateServiceData?: TemplateServiceDataType
}

const DeploymentContext = React.createContext<DeploymentConfigValues>({} as DeploymentConfigValues)

export function DeploymentContextProvider(props: React.PropsWithChildren<DeploymentContextProps>): React.ReactElement {
  const { onDeploymentConfigUpdate, deploymentConfigInitialValues, isReadonly, gitDetails, queryParams } = props

  const [deploymentConfig, setDeploymentConfig] = useState<NGTemplateInfoConfig['spec']>(deploymentConfigInitialValues)

  const [templateTypes, setTemplateTypes] = useState<{ [p: string]: string }>({})
  const [templateServiceData, setTemplateServiceData] = useState<TemplateServiceDataType>()

  // TODO: Add proper types once form is ready
  const handleConfigUpdate = useCallback(
    async (configValues: any) => {
      const sanitizedDeploymentConfig = sanitize(configValues, {
        removeEmptyArray: false,
        removeEmptyObject: false,
        removeEmptyString: false
      })

      // update in local state
      setDeploymentConfig(sanitizedDeploymentConfig)

      // update in context
      await onDeploymentConfigUpdate(sanitizedDeploymentConfig)
    },
    [deploymentConfig, onDeploymentConfigUpdate]
  )

  // Template ref resolving for rendering in execution tab

  useEffect(() => {
    const allTemplateRefs = compact(
      map(
        get(deploymentConfig, 'spec.execution.stepTemplateRefs'),
        stepTemplateRefObj => Object.values(stepTemplateRefObj)?.[0]
      )
    ) as string[]
    const unresolvedTemplateRefs = allTemplateRefs.filter(templateRef => isEmpty(get(templateTypes, templateRef)))
    if (unresolvedTemplateRefs.length > 0) {
      getTemplateTypesByRef(
        {
          accountIdentifier: queryParams.accountIdentifier,
          orgIdentifier: queryParams.orgIdentifier,
          projectIdentifier: queryParams.projectIdentifier,
          templateListType: 'Stable',
          repoIdentifier: gitDetails.repoIdentifier,
          branch: gitDetails.branch,
          getDefaultFromOtherRepo: true
        },
        unresolvedTemplateRefs
      ).then(resp => {
        setTemplateTypes(merge(templateTypes, resp.templateTypes))
        setTemplateServiceData(merge(templateServiceData, resp.templateServiceData))
      })
    }
  }, [deploymentConfig, queryParams, gitDetails, templateTypes, templateServiceData])

  return (
    <DeploymentContext.Provider
      value={{
        updateDeploymentConfig: handleConfigUpdate,
        deploymentConfig,
        isReadonly,
        gitDetails,
        templateTypes,
        templateServiceData
      }}
    >
      {props.children}
    </DeploymentContext.Provider>
  )
}

export function useDeploymentContext(): DeploymentConfigValues {
  return useContext(DeploymentContext)
}
