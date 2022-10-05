/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
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
  environment?: DeploymentStageConfig['environment'] & {
    infrastructureRef?: string
  }
  environments?: Omit<DeploymentStageConfig['environments'], 'values'> & {
    values: SelectOption[]
  }
  gitOpsEnabled?: DeploymentStageConfig['gitOpsEnabled']
}

export function processInitialValues(initialValues: DeployEnvironmentEntityConfig): DeployEnvironmentEntityFormState {
  if (initialValues.environments) {
    return {
      environments: {
        values: defaultTo(initialValues.environments?.values, []).map(value => ({
          label: value.environmentRef,
          value: value.environmentRef
        }))
      }
    }
  } else {
    return {
      environment: {
        environmentRef: defaultTo(initialValues.environment?.environmentRef, ''),
        deployToAll: initialValues.environment?.deployToAll,
        infrastructureRef: defaultTo(initialValues.environment?.infrastructureDefinition?.identifier, '')
      }
    }
  }
}

export function processFormValues(
  data: DeployEnvironmentEntityFormState,
  initialValues: DeployEnvironmentEntityConfig
): DeployEnvironmentEntityConfig {
  if (!isEmpty(data.environments?.values)) {
    return {
      environments: {
        values: data.environments?.values.map(value => ({
          environmentRef: value.value as string
        }))
      }
    }
  } else if (data.environment) {
    if (data.environment?.environmentRef === '' || initialValues.environment?.environmentRef === '') {
      return {
        environment: {
          environmentRef: defaultTo(data.environment?.environmentRef, ''),
          deployToAll: false
        }
      }
    }

    return {
      // ...data,
      environment: {
        environmentRef: defaultTo(data.environment?.environmentRef, ''),
        deployToAll: false,
        infrastructureDefinition: {
          identifier: defaultTo(data.environment?.infrastructureRef, '')
        }
      }
    }
  } else {
    // TODO: Add default conversions
    return {}
  }
}
