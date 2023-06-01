/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, MultiTypeInputType, Tabs, Tab } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { debounce, isEmpty, isEqual, set } from 'lodash-es'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { StepFormikRef } from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'

import type { StepGroupElementConfig } from 'services/cd-ng'
import type { Values } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { AdvancedStepsWithRef } from '@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps'

import { getStepDataFromValues } from '@pipeline/utils/stepUtils'
import { TemplateContext } from '../../TemplateContext/TemplateContext'
import css from './StepGroupTemplateForm.module.scss'

enum StepCommandTabs {
  StepConfiguration = 'StepConfiguration',
  Advanced = 'Advanced'
}

const StepGroupTemplateForm = (_props: unknown, formikRef: TemplateFormRef): JSX.Element => {
  const {
    state: { template },
    updateTemplate,
    isReadonly
  } = React.useContext(TemplateContext)
  const { getString } = useStrings()

  const stepFormikRef = React.useRef<StepFormikRef | null>(null)
  const advancedConfRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useImperativeHandle(formikRef, () => ({
    resetForm() {
      return stepFormikRef.current?.resetForm()
    },
    submitForm() {
      return stepFormikRef.current?.submitForm() || Promise.resolve()
    },
    getErrors() {
      return stepFormikRef.current?.getErrors() || {}
    }
  }))

  const onSubmitStep = async (item: Partial<Values>): Promise<void> => {
    const processNode: any = getStepDataFromValues(item, template.spec as StepGroupElementConfig, true)

    if (!isEqual(template.spec, processNode) || !isEqual(item.delegateSelectors, template?.spec?.delegateSelectors)) {
      delete processNode.spec
      set(template, 'spec', {
        ...processNode,
        steps: processNode.steps,
        stageType: processNode.stageType
      })

      await updateTemplate(template)
    }
  }

  const debounceSubmit = debounce((step: Partial<Values>): void => {
    onSubmitStep(step)
  }, 500)

  return (
    <Container background={Color.FORM_BG} className={css.stepGroupForm}>
      {template && !isEmpty(template.spec) && !!template.type && (
        <Tabs id="step-commands" selectedTabId={StepCommandTabs.Advanced}>
          <Tab
            id={StepCommandTabs.Advanced}
            title={getString('advancedTitle')}
            panel={
              <AdvancedStepsWithRef
                helpPanelVisible
                step={template.spec as any}
                isReadonly={isReadonly}
                stepsFactory={factory}
                allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
                onChange={debounceSubmit}
                isStepGroup={true}
                ref={advancedConfRef}
                stepType={StepType.StepGroup}
              />
            }
          />
        </Tabs>
      )}
    </Container>
  )
}

export const StepGroupTemplateFormWithRef = React.forwardRef(StepGroupTemplateForm)
