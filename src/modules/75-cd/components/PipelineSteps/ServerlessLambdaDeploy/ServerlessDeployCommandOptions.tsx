/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import { Accordion, Container, MultiTypeInputType, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { StepElementConfig } from 'services/cd-ng'
import { MultiTypeExecutionCondition } from '@common/components/MultiTypeExecutionCondition/MultiTypeExecutionCondition'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'

import css from './ServerlessDeployCommandOptions.module.scss'

interface ServerlessDeployCommandOptionsProps {
  isReadonly?: boolean
  inputSetData?: {
    template?: StepElementConfig
    path?: string
    readonly?: boolean
  }
  stepViewType?: StepViewType
}

interface ServerlessCommandFlagOperationsProps {
  isReadonly?: boolean
  inputSetData: {
    template?: StepElementConfig
    path?: string
    readonly?: boolean
  }
  stepViewType?: StepViewType
}

function ServerlessCommandFlagOperations(props: ServerlessCommandFlagOperationsProps): React.ReactElement {
  const { isReadonly = false, inputSetData, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Text className={css.commandFlagOptions} tooltipProps={{ dataTooltipId: 'serverlessDeployCommandOptions' }}>
        {getString('cd.serverlessDeployCommandOptions')}
      </Text>
      <Container padding={{ top: 'small' }}>
        {isTemplatizedView(stepViewType) ? (
          <MultiTypeExecutionCondition
            path={`${isEmpty(inputSetData.path) ? '' : `${inputSetData.path}.`}spec.commandOptions`}
            allowableTypes={[MultiTypeInputType.FIXED]}
            isInputDisabled={isReadonly}
            expressions={expressions}
          />
        ) : (
          <MultiTypeExecutionCondition
            path={'spec.commandOptions'}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            isInputDisabled={isReadonly}
            expressions={expressions}
          />
        )}
      </Container>
    </>
  )
}

export function ServerlessDeployCommandOptions(props: ServerlessDeployCommandOptionsProps): React.ReactElement {
  const { isReadonly, stepViewType = StepViewType.Edit, inputSetData } = props
  const { getString } = useStrings()

  return (
    <Accordion allowMultiOpen activeId={''}>
      <Accordion.Panel
        id={'commandOptions'}
        summary={getString('pipelineSteps.optionalConfiguration')}
        details={
          <ServerlessCommandFlagOperations
            isReadonly={isReadonly}
            stepViewType={stepViewType}
            inputSetData={inputSetData as InputSetData<StepElementConfig>}
          />
        }
      />
    </Accordion>
  )
}
