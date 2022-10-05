/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  AllowedTypes,
  Container,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Text
} from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { Color } from '@wings-software/design-system'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { CustomVariableInputSet } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { DeploymentConfig } from '@pipeline/components/PipelineStudio/PipelineVariables/types'
import type { AllNGVariables } from '@pipeline/utils/types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './DeploymentConfigRuntimeInputs.module.scss'

interface Props {
  allowableTypes: AllowedTypes
  template?: DeploymentConfig
  path?: string
  readonly?: boolean
  className?: string
}

export function DeploymentConfigRuntimeInputs(props: Props) {
  const { template, allowableTypes, path, readonly } = props
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}`

  return (
    <>
      {template?.infrastructure?.variables && (
        <Container margin={{ bottom: 'small' }}>
          <Text font={{ size: 'normal' }} color={Color.GREY_600}>
            {getString('common.variables')}
          </Text>
          <div className={css.sectionContent}>
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <CustomVariableInputSet
                allowableTypes={allowableTypes}
                initialValues={{ variables: template.infrastructure.variables as unknown as AllNGVariables[] }}
                template={{ variables: template.infrastructure.variables as unknown as AllNGVariables[] }}
                path={`${prefix}.infrastructure`}
                inputSetData={{ readonly, path: '' }}
                className={css.customVariablesContainer}
              />
            </Layout.Horizontal>
          </div>
        </Container>
      )}
      {getMultiTypeFromValue(template?.infrastructure?.instancesListPath) === MultiTypeInputType.RUNTIME ? (
        <Container className={css.hostObjectArrayPathInputContainer} margin={{ bottom: 'medium' }}>
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.MultiTextInput
              label={getString('pipeline.customDeployment.instanceObjectArrayPath')}
              name={`${prefix}.infrastructure.instancesListPath`}
              multiTextInputProps={{
                disabled: readonly,
                allowableTypes
              }}
              disabled={readonly}
            />
          </div>
        </Container>
      ) : null}
      {template?.infrastructure?.instanceAttributes && (
        <Container margin={{ bottom: 'medium' }}>
          <Text font={{ size: 'normal' }} color={Color.GREY_600} padding={{ bottom: 'large' }}>
            {getString('pipeline.customDeployment.instanceAttributes')}
          </Text>
          <div className={css.sectionContent}>
            <Layout.Vertical spacing="medium" width={'60%'}>
              {template.infrastructure.instanceAttributes.map((instanceAttribute, index: number) => {
                return (
                  <Layout.Horizontal
                    spacing={'medium'}
                    flex={{ distribution: 'space-between' }}
                    style={{ alignItems: 'baseline' }}
                    key={index}
                  >
                    <Text lineClamp={1} font={{ size: 'normal' }} color={Color.GREY_500}>
                      {instanceAttribute.name}
                    </Text>
                    <FormInput.MultiTextInput
                      name={`${prefix}.infrastructure.instanceAttributes[${index}].jsonPath`}
                      disabled={readonly}
                      label={''}
                      multiTextInputProps={{
                        allowableTypes: allowableTypes,
                        disabled: readonly
                      }}
                    />
                  </Layout.Horizontal>
                )
              })}
            </Layout.Vertical>
          </div>
        </Container>
      )}
    </>
  )
}
