/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useState } from 'react'
import get from 'lodash/get'
import { merge, map, compact, isEmpty } from 'lodash-es'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import type { NGTemplateInfoConfig, EntityGitDetails } from 'services/template-ng'
import { sanitize } from '@common/utils/JSONUtils'
import type { GetPipelineQueryParams } from 'services/pipeline-ng'
import { getTemplateTypesByRef, TemplateServiceDataType } from '@pipeline/utils/templateUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'
import type { PermissionCheck } from 'services/rbac'

export interface DeploymentContextProps {
  onDeploymentConfigUpdate: (configValues: any) => Promise<void>
  deploymentConfigInitialValues: NGTemplateInfoConfig['spec']
  isReadOnly: boolean
  gitDetails: EntityGitDetails
  queryParams: GetPipelineQueryParams
  templateIdentifier?: string
}

export interface DeploymentConfigValues
  extends Omit<DeploymentContextProps, 'queryParams' | 'deploymentConfigInitialValues' | 'onDeploymentConfigUpdate'> {
  deploymentConfig: NGTemplateInfoConfig['spec']
  updateDeploymentConfig: (configValues: any) => Promise<void>
  templateTypes: { [key: string]: string }
  templateServiceData?: TemplateServiceDataType
  allowableTypes: AllowedTypesWithRunTime[]
}
const initialValues = {
  infrastructure: {
    variables: [],
    fetchInstancesScript: {
      store: {
        type: 'Inline',
        spec: {}
      }
    },
    instanceAttributes: [{ fieldName: 'hostName', jsonPath: '', description: '' }]
  }
}
const allowableTypes: AllowedTypesWithRunTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME,
  MultiTypeInputType.EXPRESSION
]
const DeploymentContext = React.createContext<DeploymentConfigValues>({
  deploymentConfig: initialValues,
  isReadOnly: false,
  allowableTypes: allowableTypes,
  gitDetails: {},
  templateTypes: {},
  updateDeploymentConfig: (_configValues: any) => new Promise<void>(() => undefined)
} as DeploymentConfigValues)

export function DeploymentContextProvider(props: React.PropsWithChildren<DeploymentContextProps>): React.ReactElement {
  const { onDeploymentConfigUpdate, deploymentConfigInitialValues, gitDetails, queryParams, templateIdentifier } = props

  const [deploymentConfig, setDeploymentConfig] = useState<NGTemplateInfoConfig['spec']>(
    deploymentConfigInitialValues || initialValues
  )

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

  const [isEdit] = usePermission(
    {
      resourceScope: {
        accountIdentifier: queryParams.accountIdentifier,
        orgIdentifier: queryParams.orgIdentifier,
        projectIdentifier: queryParams.projectIdentifier
      },
      resource: {
        resourceType: ResourceType.TEMPLATE,
        resourceIdentifier: templateIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_TEMPLATE],
      options: {
        skipCache: true,
        skipCondition: (permissionCheck: PermissionCheck) => {
          /* istanbul ignore next */
          return permissionCheck.resourceIdentifier === '-1'
        }
      }
    },
    [queryParams.accountIdentifier, queryParams.orgIdentifier, queryParams.projectIdentifier, templateIdentifier]
  )

  const isReadOnly = !isEdit

  return (
    <DeploymentContext.Provider
      value={{
        updateDeploymentConfig: handleConfigUpdate,
        deploymentConfig,
        isReadOnly,
        gitDetails,
        templateTypes,
        templateServiceData,
        allowableTypes
      }}
    >
      {props.children}
    </DeploymentContext.Provider>
  )
}

export function useDeploymentContext(): DeploymentConfigValues {
  return useContext(DeploymentContext)
}
