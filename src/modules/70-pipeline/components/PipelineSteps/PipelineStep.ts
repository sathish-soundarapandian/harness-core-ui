/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, defaultsDeep } from 'lodash-es'

import { Step, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isCustomGeneratedString } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
export type { StepProps } from '@pipeline/components/AbstractSteps/Step'

export abstract class PipelineStep<T extends { name?: string; identifier?: string }> extends Step<T> {
  getDefaultValues(initialValues: T, viewType: StepViewType): T {
    if (initialValues.identifier && isCustomGeneratedString(initialValues.identifier)) {
      const values = cloneDeep(initialValues)
      delete values.name
      delete values.identifier
      return defaultsDeep(values, this.defaultValues)
    }
    if (viewType === StepViewType.InputSet || viewType === StepViewType.DeploymentForm) {
      return {
        ...initialValues
      }
    }
    return defaultsDeep(cloneDeep(initialValues), this.defaultValues)
  }
  processFormData(values: T): T {
    return values
  }

  isTemplatizedView(
    stepViewType?: StepViewType
  ): stepViewType is StepViewType.DeploymentForm | StepViewType.InputSet | StepViewType.TemplateUsage {
    return isTemplatizedView(stepViewType)
  }
}
