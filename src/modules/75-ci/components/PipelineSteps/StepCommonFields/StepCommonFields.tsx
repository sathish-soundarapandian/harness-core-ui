/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Text, Container, Layout, MultiTypeInputType, AllowedTypes } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { connect, FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import { getCIShellOptions } from '@ci/utils/CIShellOptionsUtils'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { PullOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { AllMultiTypeInputTypesForStep } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type PullOptions = { label: string; value: PullOption }[]

export const usePullOptions: () => PullOptions = () => {
  const { getString } = useStrings()
  return [
    { label: getString('pipelineSteps.pullIfNotExistsLabel'), value: 'ifNotExists' },
    { label: getString('pipelineSteps.pullNeverLabel'), value: 'never' },
    { label: getString('pipelineSteps.pullAlwaysLabel'), value: 'always' }
  ]
}

export interface StepCommonFieldsProps {
  withoutTimeout?: boolean
  disabled?: boolean
  enableFields?: string[]
  buildInfrastructureType: CIBuildInfrastructureType
  allowableTypes?: AllowedTypes
  disableRunAsUser?: boolean
  formik?: FormikContextType<any>
  stepViewType?: StepViewType
}

const StepCommonFields = ({
  withoutTimeout,
  disabled,
  enableFields = [],
  buildInfrastructureType,
  disableRunAsUser,
  stepViewType
}: StepCommonFieldsProps): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const shouldRenderContainerResourcesSection = ![
    CIBuildInfrastructureType.VM,
    CIBuildInfrastructureType.Cloud,
    CIBuildInfrastructureType.Docker
  ].includes(buildInfrastructureType)

  const shouldRenderRunAsUser: boolean =
    stepViewType === StepViewType.Template ||
    ([CIBuildInfrastructureType.KubernetesDirect, CIBuildInfrastructureType.Cloud].includes(buildInfrastructureType) &&
      !disableRunAsUser)

  return (
    <>
      {enableFields.includes('spec.imagePullPolicy') && (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeSelectField
            name="spec.imagePullPolicy"
            label={
              <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('pipelineSteps.pullLabel')}
                </Text>
                &nbsp;
                <Text
                  tooltipProps={{ dataTooltipId: 'imagePullPolicy' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            multiTypeInputProps={{
              selectItems: getImagePullPolicyOptions(getString),
              placeholder: getString('select'),
              multiTypeInputProps: {
                expressions,
                selectProps: { addClearBtn: true, items: getImagePullPolicyOptions(getString) },
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
              },
              disabled
            }}
            disabled={disabled}
            configureOptionsProps={{ variableName: 'spec.imagePullPolicy' }}
          />
        </Container>
      )}
      {shouldRenderRunAsUser ? (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeTextField
            label={
              <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('pipeline.stepCommonFields.runAsUser')}
                </Text>
                &nbsp;
                <Text
                  tooltipProps={{ dataTooltipId: 'runAsUser' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            name="spec.runAsUser"
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes: AllMultiTypeInputTypesForStep },
              disabled,
              placeholder: '1000'
            }}
          />
        </Container>
      ) : null}
      {enableFields.includes('spec.shell') && (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeSelectField
            name="spec.shell"
            label={
              <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('common.shell')}
                </Text>
                &nbsp;
                <Text
                  tooltipProps={{ dataTooltipId: 'shell' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            multiTypeInputProps={{
              selectItems: getCIShellOptions(getString),
              placeholder: getString('select'),
              multiTypeInputProps: {
                expressions,
                selectProps: { addClearBtn: true, items: getCIShellOptions(getString) },
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
              },
              disabled
            }}
            disabled={disabled}
            configureOptionsProps={{ variableName: 'spec.shell' }}
          />
        </Container>
      )}
      {shouldRenderContainerResourcesSection ? (
        <Layout.Vertical className={cx(css.bottomMargin5, css.topMargin5)} spacing="medium">
          <Text
            className={css.inpLabel}
            color={Color.GREY_600}
            font={{ size: 'small', weight: 'semi-bold' }}
            tooltipProps={{ dataTooltipId: 'setContainerResources' }}
          >
            {getString('pipelineSteps.setContainerResources')}
          </Text>
          <Layout.Horizontal spacing="small">
            <MultiTypeTextField
              name="spec.limitMemory"
              label={
                <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                  <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                    {getString('pipelineSteps.limitMemoryLabel')}
                  </Text>
                  &nbsp;
                  <Text
                    tooltipProps={{ dataTooltipId: 'limitMemory' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
                </Layout.Horizontal>
              }
              multiTextInputProps={{
                multiTextInputProps: {
                  expressions,
                  allowableTypes: AllMultiTypeInputTypesForStep
                },
                disabled
              }}
              configureOptionsProps={{ variableName: 'spec.limit.memory', hideExecutionTimeField: true }}
              style={{ flexGrow: 1, flexBasis: '50%' }}
            />
            <MultiTypeTextField
              name="spec.limitCPU"
              label={
                <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                  <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                    {getString('pipelineSteps.limitCPULabel')}
                  </Text>
                  &nbsp;
                  <Text
                    tooltipProps={{ dataTooltipId: 'limitCPULabel' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
                </Layout.Horizontal>
              }
              multiTextInputProps={{
                multiTextInputProps: { expressions, allowableTypes: AllMultiTypeInputTypesForStep },
                disabled
              }}
              configureOptionsProps={{ variableName: 'spec.limit.cpu', hideExecutionTimeField: true }}
              style={{ flexGrow: 1, flexBasis: '50%' }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      ) : null}
      {!withoutTimeout ? (
        <Container className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
          <FormMultiTypeDurationField
            className={css.removeBpLabelMargin}
            name="timeout"
            multiTypeDurationProps={{ expressions, allowableTypes: AllMultiTypeInputTypesForStep }}
            label={
              <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('pipelineSteps.timeoutLabel')}
                </Text>
                &nbsp;
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            disabled={disabled}
          />
        </Container>
      ) : null}
    </>
  )
}

export default connect(StepCommonFields)
