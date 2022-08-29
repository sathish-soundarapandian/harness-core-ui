/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useState } from 'react'
import get from 'lodash/get'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { compact, isEmpty, map, merge } from 'lodash-es'
import type { EntityGitDetails } from 'services/template-ng'
import { sanitize } from '@common/utils/JSONUtils'
import type { GetPipelineQueryParams, TemplateStepNode, StepElementConfig } from 'services/pipeline-ng'
import { getTemplateTypesByRef } from '@pipeline/utils/templateUtils'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { DeploymentInfra } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/DeploymentInfraWrapper/DeploymentInfraUtils'

export interface DeploymentConfigExecutionStepWrapper {
  step: TemplateStepNode
}

export interface DeploymentConfig {
  infrastructure: DeploymentInfra
  execution: {
    steps: DeploymentConfigExecutionStepWrapper[]
  }
}

export interface DrawerData {
  type: DrawerTypes
  data?: {
    stepConfig?: {
      node: TemplateStepNode | StepElementConfig
    }
    drawerConfig?: {
      shouldShowApplyChangesBtn: boolean
    }
    isDrawerOpen?: boolean
  }
}

export interface DeploymentContextProps {
  onDeploymentConfigUpdate: (configValues: any) => Promise<void>
  deploymentConfigInitialValues: DeploymentConfig
  isReadOnly: boolean
  gitDetails: EntityGitDetails
  queryParams: GetPipelineQueryParams
  stepsFactory: AbstractStepFactory
}

export interface DeploymentConfigValues
  extends Omit<DeploymentContextProps, 'queryParams' | 'deploymentConfigInitialValues' | 'onDeploymentConfigUpdate'> {
  deploymentConfig: DeploymentConfig
  updateDeploymentConfig: (configValues: any) => Promise<void>
  templateTypes: { [key: string]: string }
  allowableTypes: AllowedTypesWithRunTime[]
  setTemplateTypes: (templateTypes: TemplateTypes) => void
  drawerData: DrawerData
  setDrawerData: (values: DrawerData) => void
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
  },
  execution: {
    steps: []
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
  updateDeploymentConfig: (_configValues: any) => new Promise<void>(() => undefined),
  setTemplateTypes: (_templateTypes: TemplateTypes) => undefined,
  drawerData: { type: DrawerTypes.AddStep },
  setDrawerData: (_values: DrawerData) => undefined,
  stepsFactory: {} as AbstractStepFactory
})

export type TemplateTypes = { [p: string]: string }

export function DeploymentContextProvider(props: React.PropsWithChildren<DeploymentContextProps>): React.ReactElement {
  const { onDeploymentConfigUpdate, deploymentConfigInitialValues, gitDetails, queryParams, stepsFactory, isReadOnly } =
    props

  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>(
    deploymentConfigInitialValues || initialValues
  )
  const [drawerData, setDrawerData] = React.useState<DrawerData>({ type: DrawerTypes.AddStep })

  const [templateTypes, setTemplateTypes] = useState<TemplateTypes>({})

  const handleConfigUpdate = useCallback(
    async (configValues: DeploymentConfig) => {
      const sanitizedDeploymentConfig = sanitize(configValues, {
        removeEmptyArray: false,
        removeEmptyObject: false,
        removeEmptyString: false
      }) as DeploymentConfig

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
        get(deploymentConfig, 'execution.steps'),
        (executionStep: DeploymentConfigExecutionStepWrapper) => executionStep?.step?.template?.templateRef
      )
    ) as string[]
    const unresolvedTemplateRefs = allTemplateRefs.filter(templateRef => {
      return isEmpty(get(templateTypes, templateRef))
    })
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
        setTemplateTypes(merge({}, templateTypes, resp.templateTypes))
      })
    }
  }, [deploymentConfig])

  return (
    <DeploymentContext.Provider
      value={{
        updateDeploymentConfig: handleConfigUpdate,
        deploymentConfig,
        isReadOnly,
        gitDetails,
        templateTypes,
        allowableTypes,
        setTemplateTypes,
        drawerData,
        setDrawerData,
        stepsFactory
      }}
    >
      {props.children}
    </DeploymentContext.Provider>
  )
}

export function useDeploymentContext(): DeploymentConfigValues {
  return useContext(DeploymentContext)
}
