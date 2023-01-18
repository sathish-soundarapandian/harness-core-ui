/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@harness/icons'

import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'

import type { InlineEntityFiltersProps } from './InlineEntityFiltersUtils'
import InlineEntityFiltersWidget from './InlineEntityFiltersWidget/InlineEntityFiltersWidget'
import InlineEntityFiltersInputStep from './InlineEntityFiltersInputStep/InlineEntityFiltersInputStep'

export class InlineEntityFiltersStep extends Step<InlineEntityFiltersProps> {
  constructor() {
    super()
  }

  protected type = StepType.InlineEntityFilters
  protected stepName = 'Inline Entity Filters'
  protected stepIcon: IconName = 'entity'
  protected defaultValues: InlineEntityFiltersProps = {} as any

  renderStep(props: StepProps<InlineEntityFiltersProps>): JSX.Element {
    const { initialValues, readonly, allowableTypes, stepViewType, inputSetData } = props

    if (isTemplatizedView(stepViewType)) {
      return (
        <InlineEntityFiltersInputStep
          readonly={!!readonly}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData}
        />
      )
    }

    return <InlineEntityFiltersWidget {...initialValues} readonly={!!readonly} allowableTypes={allowableTypes} />
  }

  validateInputSet(): any {
    // any
  }
}
