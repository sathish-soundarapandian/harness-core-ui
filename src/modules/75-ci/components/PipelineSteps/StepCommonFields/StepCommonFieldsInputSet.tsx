/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, Container, Layout } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { connect } from 'formik'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { MultiTypeTextField, MultiTypeTextProps } from '@common/components/MultiTypeText/MultiTypeText'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import {
  GetShellOptions,
  GetImagePullPolicyOptions
} from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import type { InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { shouldRenderRunTimeInputViewWithAllowedValues } from '@pipeline/utils/CIUtils'
import {
  getOptionalSubLabel,
  renderMultiTypeInputWithAllowedValues
} from '@ci/components/PipelineSteps/CIStep/CIStepOptionalConfig'
import { AllMultiTypeInputTypesForInputSet } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface StepCommonFieldsInputSetProps<T> extends Omit<InputSetData<T>, 'path' | 'template'> {
  path?: string
  // @TODO: set up proper typing
  // eslint-disable-next-line
  template: any
  withoutTimeout?: boolean
  enableFields?: string[]
  stepViewType: StepViewType
  allowableTypes?: MultiTypeInputType[]
}

function StepCommonFieldsInputSet<T>(props: StepCommonFieldsInputSetProps<T>): JSX.Element | null {
  const { path, template, readonly, withoutTimeout, enableFields = [], stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isRunAsUserRuntime = getMultiTypeFromValue(template?.spec?.runAsUser) === MultiTypeInputType.RUNTIME
  const isLimitMemoryRuntime =
    getMultiTypeFromValue(template?.spec?.resources?.limits?.memory) === MultiTypeInputType.RUNTIME
  const isLimitCPURuntime = getMultiTypeFromValue(template?.spec?.resources?.limits?.cpu) === MultiTypeInputType.RUNTIME
  const isTimeoutRuntime = getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME

  const stepCss = stepViewType === StepViewType.DeploymentForm ? css.sm : css.lg

  const renderMultiTypeTextField = ({
    name,
    tooltipId,
    labelKey,
    inputProps,
    fieldPath
  }: {
    name: string
    tooltipId: string
    labelKey: keyof StringsMap
    inputProps: MultiTypeTextProps['multiTextInputProps']
    fieldPath: string
  }) => {
    if (shouldRenderRunTimeInputViewWithAllowedValues(fieldPath, template)) {
      return renderMultiTypeInputWithAllowedValues({
        name,
        tooltipId: tooltipId,
        labelKey: labelKey,
        fieldPath,
        getString,
        readonly,
        expressions,
        template,
        showOptionalSublabel: true
      })
    }
    return (
      <MultiTypeTextField
        name={name}
        label={
          <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              className={css.inpLabel}
              color={Color.GREY_800}
              font={{ size: 'small', weight: 'semi-bold' }}
            >
              {getString(labelKey)}
            </Text>
            &nbsp;
            {getOptionalSubLabel(getString, tooltipId)}
          </Layout.Horizontal>
        }
        multiTextInputProps={inputProps}
      />
    )
  }

  return (
    <>
      {/* Currently not implemented due to no support for enum value fields */}
      {/* When ready, pass enableFields when <x>StepInputSet has field as runtime input */}
      {enableFields.includes('spec.imagePullPolicy') && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeSelectField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.imagePullPolicy`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('pipelineSteps.pullLabel')}
                </Text>
                &nbsp;
                {getOptionalSubLabel(getString, 'imagePullPolicy')}
              </Layout.Horizontal>
            }
            multiTypeInputProps={{
              selectItems: GetImagePullPolicyOptions(),
              placeholder: getString('select'),
              multiTypeInputProps: {
                expressions,
                selectProps: { addClearBtn: true, items: GetImagePullPolicyOptions() },
                allowableTypes: AllMultiTypeInputTypesForInputSet
              },
              disabled: readonly
            }}
            disabled={readonly}
            configureOptionsProps={{ variableName: 'spec.imagePullPolicy' }}
          />
        </Container>
      )}
      {/* Currently not implemented due to no support for enum value fields */}
      {enableFields.includes('spec.shell') && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeSelectField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.shell`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('common.shell')}
                </Text>
                &nbsp;
                {getOptionalSubLabel(getString, 'shell')}
              </Layout.Horizontal>
            }
            multiTypeInputProps={{
              selectItems: GetImagePullPolicyOptions(),
              placeholder: getString('select'),
              multiTypeInputProps: {
                expressions,
                selectProps: { addClearBtn: true, items: GetShellOptions(getString) },
                allowableTypes: AllMultiTypeInputTypesForInputSet
              },
              disabled: readonly
            }}
            disabled={readonly}
            configureOptionsProps={{ variableName: 'spec.shell' }}
          />
        </Container>
      )}
      {isRunAsUserRuntime && (
        <Container className={cx(css.formGroup, stepCss, css.topSpacingLarge, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${isEmpty(path) ? '' : `${path}.`}spec.runAsUser`,
            labelKey: 'pipeline.stepCommonFields.runAsUser',
            tooltipId: 'runAsUser',
            inputProps: {
              multiTextInputProps: {
                expressions,
                allowableTypes: AllMultiTypeInputTypesForInputSet
              },
              disabled: readonly,
              placeholder: '1000'
            },
            fieldPath: 'spec.runAsUser'
          })}
        </Container>
      )}
      {(isLimitMemoryRuntime || isLimitCPURuntime) && (
        <Container className={css.bottomMargin5}>
          <Text
            className={css.inpLabel}
            color={Color.GREY_600}
            font={{ size: 'small', weight: 'semi-bold' }}
            tooltipProps={{ dataTooltipId: 'setContainerResources' }}
          >
            {getString('pipelineSteps.setContainerResources')}
          </Text>
          <Layout.Horizontal
            className={cx(
              css.formGroup,
              { [css.lgOverride]: isLimitMemoryRuntime && isLimitCPURuntime },
              { [stepCss]: isLimitMemoryRuntime || isLimitCPURuntime }
            )}
            style={{ alignItems: 'baseline' }}
            margin={{ top: 'xsmall', bottom: 'small' }}
            spacing="medium"
          >
            {isLimitMemoryRuntime && (
              <Container style={{ flex: 1 }}>
                {renderMultiTypeTextField({
                  name: `${isEmpty(path) ? '' : `${path}.`}spec.resources.limits.memory`,
                  tooltipId: 'limitMemory',
                  labelKey: 'pipelineSteps.limitMemoryLabel',
                  inputProps: {
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: AllMultiTypeInputTypesForInputSet
                    },
                    disabled: readonly
                  },
                  fieldPath: 'spec.resources.limits.memory'
                })}
              </Container>
            )}
            {isLimitCPURuntime && (
              <Container style={{ flex: 1 }}>
                {renderMultiTypeTextField({
                  name: `${isEmpty(path) ? '' : `${path}.`}spec.resources.limits.cpu`,
                  tooltipId: 'limitCPULabel',
                  labelKey: 'pipelineSteps.limitCPULabel',
                  inputProps: {
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: AllMultiTypeInputTypesForInputSet
                    },
                    disabled: readonly
                  },
                  fieldPath: 'spec.resources.limits.cpu'
                })}
              </Container>
            )}
          </Layout.Horizontal>
        </Container>
      )}
      {!withoutTimeout && isTimeoutRuntime && (
        <Container className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
          {shouldRenderRunTimeInputViewWithAllowedValues('timeout', template) ? (
            renderMultiTypeInputWithAllowedValues({
              name: `${isEmpty(path) ? '' : `${path}.`}timeout`,
              tooltipId: 'timeout',
              labelKey: 'pipelineSteps.timeoutLabel',
              fieldPath: 'timeout',
              getString,
              readonly,
              expressions,
              template,
              showOptionalSublabel: true
            })
          ) : (
            <FormMultiTypeDurationField
              className={css.removeBpLabelMargin}
              label={
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                    {getString('pipelineSteps.timeoutLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel(getString, 'timeout')}
                </Layout.Horizontal>
              }
              name={`${isEmpty(path) ? '' : `${path}.`}timeout`}
              placeholder={getString('pipelineSteps.timeoutPlaceholder')}
              multiTypeDurationProps={{
                expressions,
                allowableTypes: AllMultiTypeInputTypesForInputSet
              }}
              disabled={readonly}
            />
          )}
        </Container>
      )}
    </>
  )
}

export default connect(StepCommonFieldsInputSet)
