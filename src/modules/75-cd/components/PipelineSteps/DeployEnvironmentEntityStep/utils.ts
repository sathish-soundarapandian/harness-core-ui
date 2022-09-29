/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import type { DeploymentStageConfig } from 'services/cd-ng'
import type { StringsMap } from 'stringTypes'

export interface DeployEnvironmentEntityCustomStepProps {
  getString: (key: keyof StringsMap) => string
  stageIdentifier: string
  serviceRef?: string
  environmentRef?: string
  infrastructureRef?: string
  clusterRef?: string
}
export interface DeployEnvironmentEntityConfig {
  environment?: DeploymentStageConfig['environment']
  environments?: DeploymentStageConfig['environments']
  gitOpsEnabled?: DeploymentStageConfig['gitOpsEnabled']
}

export interface DeployEnvironmentEntityFormState {
  environment?: DeploymentStageConfig['environment']
  environments?: DeploymentStageConfig['environments']
  gitOpsEnabled?: DeploymentStageConfig['gitOpsEnabled']
  infrastructureRef?: string
}

export function processInitialValues(initialValues: DeployEnvironmentEntityConfig): DeployEnvironmentEntityFormState {
  if (initialValues.environment) {
    return {
      environment: {
        environmentRef: defaultTo(initialValues.environment?.environmentRef, ''),
        deployToAll: initialValues.environment?.deployToAll
      },
      infrastructureRef: defaultTo(initialValues.environment?.infrastructureDefinition?.identifier, '')
    }
  } else {
    return {
      environments: {
        values: defaultTo(initialValues.environments?.values, [])
      }
    }
  }
}

export function processFormValues(
  data: DeployEnvironmentEntityFormState,
  initialValues: DeployEnvironmentEntityConfig
): DeployEnvironmentEntityConfig {
  // Dummy condition for the time being
  const deployToAll = data.environment?.environmentRef === initialValues.environment?.environmentRef + 'test'

  if (data.environment?.environmentRef === '') {
    return {
      ...data,
      environment: {
        environmentRef: defaultTo(data.environment?.environmentRef, ''),
        deployToAll: false
      }
    }
  }

  return {
    ...data,
    environment: {
      environmentRef: defaultTo(data.environment?.environmentRef, ''),
      deployToAll: deployToAll,
      infrastructureDefinition: {
        identifier: defaultTo(data.infrastructureRef, '')
      }
    }
  }
}
