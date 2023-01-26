/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { isEmpty } from 'lodash-es'

import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type { ServiceSpec } from 'services/cd-ng'

import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { getStepTypeByDeploymentType } from '@pipeline/utils/stageHelpers'

import type { EnvironmentEntityCardProps } from './EnvironmentEntityCard'
import type { DeployEnvironmentEntityFormState } from '../../types'

export function EnvironmentInputs({
  environmentRef,
  environmentInputs,
  allowableTypes,
  deploymentType,
  stageIdentifier,
  readonly
}: Pick<
  EnvironmentEntityCardProps,
  'environmentInputs' | 'allowableTypes' | 'deploymentType' | 'stageIdentifier' | 'readonly'
> & {
  environmentRef: string
}): React.ReactElement {
  const { getString } = useStrings()
  const { values } = useFormikContext<DeployEnvironmentEntityFormState>()

  return (
    <>
      {environmentInputs && (
        <>
          {!isEmpty(environmentInputs.variables) && (
            <Container border={{ top: true }} margin={{ top: 'medium' }} padding={{ top: 'large' }}>
              <Text color={Color.GREY_800} font={{ size: 'normal', weight: 'bold' }} margin={{ bottom: 'medium' }}>
                {getString('common.environmentInputs')}
              </Text>
              <StepWidget<ServiceSpec>
                factory={factory}
                initialValues={values.environmentInputs?.[environmentRef] || {}}
                allowableTypes={allowableTypes}
                template={environmentInputs}
                type={getStepTypeByDeploymentType(deploymentType)}
                stepViewType={StepViewType.TemplateUsage}
                path={`environmentInputs.['${environmentRef}']`}
                readonly={readonly}
                customStepProps={{
                  stageIdentifier
                }}
              />
            </Container>
          )}

          {!isEmpty(environmentInputs.overrides) && (
            <Container border={{ top: true }} margin={{ top: 'medium' }} padding={{ top: 'large' }}>
              <Text color={Color.GREY_800} font={{ size: 'normal', weight: 'bold' }} margin={{ bottom: 'medium' }}>
                {getString('common.environmentOverrides')}
              </Text>
              <StepWidget<ServiceSpec>
                factory={factory}
                initialValues={values.environmentInputs?.[environmentRef]?.overrides || {}}
                allowableTypes={allowableTypes}
                template={environmentInputs.overrides}
                type={getStepTypeByDeploymentType(deploymentType)}
                stepViewType={StepViewType.TemplateUsage}
                path={`environmentInputs.['${environmentRef}'].overrides`}
                readonly={readonly}
                customStepProps={{
                  stageIdentifier
                }}
              />
            </Container>
          )}
        </>
      )}
    </>
  )
}
