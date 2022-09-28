/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { useLocation } from 'react-router-dom'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Container, Layout } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MultiTypeListInputSet } from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { shouldRenderRunTimeInputViewWithAllowedValues, shouldRenderRunTimeInputView } from '@pipeline/utils/CIUtils'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import type { BackgroundStepProps } from './BackgroundStep'
import { CIStep } from '../CIStep/CIStep'
import { ConnectorRefWithImage } from '../CIStep/ConnectorRefWithImage'
import {
  renderMultiTypeInputWithAllowedValues,
  getOptionalSubLabel,
  CIStepOptionalConfig,
  PathnameParams
} from '../CIStep/CIStepOptionalConfig'
import {
  SupportedInputTypesForListTypeField,
  SupportedInputTypesForListTypeFieldInInputSetView,
  SupportedInputTypesForListItems
} from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const BackgroundStepInputSetBasic: React.FC<BackgroundStepProps> = props => {
  const { template, path, readonly, stepViewType, allowableTypes, formik } = props
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`

  const { expressions } = useVariablesExpression()
  const pathnameParams = useLocation()?.pathname?.split('/') || []
  // Fields dependent on VM infra will always appear in Template Studio
  const isTemplateStudio = pathnameParams.includes(PathnameParams.TEMPLATE_STUDIO)
  // applying template should allow editing and all runtime inputs

  const stepCss = stepViewType === StepViewType.DeploymentForm ? css.sm : css.lg

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && { description: {} })
        }}
        path={path || ''}
      />
      <ConnectorRefWithImage
        readonly={readonly}
        showConnectorRef={getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME}
        showImage={getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME}
        stepViewType={stepViewType}
        path={path || ''}
        template={template}
        isInputSetView={true}
      />
      {getMultiTypeFromValue(template?.spec?.entrypoint as string) === MultiTypeInputType.RUNTIME && (
        <div className={cx(css.fieldsGroup, css.withoutSpacing, css.topPadding3, css.bottomPadding3, stepCss)}>
          <MultiTypeListInputSet
            name={`${prefix}spec.entrypoint`}
            multiTextInputProps={{
              expressions,
              allowableTypes: SupportedInputTypesForListItems
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    className={css.inpLabel}
                    color={Color.GREY_800}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('entryPointLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel(getString, 'entryPointLabel')}
                </Layout.Horizontal>
              ),
              allowedTypes: isTemplateStudio
                ? SupportedInputTypesForListTypeField
                : SupportedInputTypesForListTypeFieldInInputSetView
            }}
            disabled={readonly}
            formik={formik}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.command) === MultiTypeInputType.RUNTIME && (
        <div className={cx(css.fieldsGroup, css.withoutSpacing, css.topPadding3, css.bottomPadding3, stepCss)}>
          {shouldRenderRunTimeInputViewWithAllowedValues('spec.command', template) ? (
            <Container className={cx(css.formGroup, stepCss)}>
              {renderMultiTypeInputWithAllowedValues({
                name: `${prefix}spec.command`,
                labelKey: 'commandLabel',
                tooltipId: 'runCommand',
                fieldPath: 'spec.command',
                getString,
                readonly,
                expressions,
                template
              })}
            </Container>
          ) : (
            <MultiTypeFieldSelector
              name={`${prefix}spec.command`}
              label={
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    color={Color.GREY_800}
                    font={{ size: 'normal', weight: 'bold' }}
                    className={css.inpLabel}
                    style={{ display: 'flex', alignItems: 'center' }}
                    tooltipProps={{ dataTooltipId: 'runCommand' }}
                  >
                    {getString('commandLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel(getString, 'command')}
                </Layout.Horizontal>
              }
              defaultValueToReset=""
              skipRenderValueInExpressionLabel
              allowedTypes={allowableTypes}
              expressionRender={() => {
                return (
                  <ShellScriptMonacoField
                    title={getString('commandLabel')}
                    name={`${prefix}spec.command`}
                    scriptType="Bash"
                    expressions={expressions}
                    disabled={readonly}
                  />
                )
              }}
              style={{ flexGrow: 1, marginBottom: 0 }}
              disableTypeSelection={readonly}
            >
              <ShellScriptMonacoField
                title={getString('commandLabel')}
                name={`${prefix}spec.command`}
                scriptType="Bash"
                disabled={readonly}
                expressions={expressions}
              />
            </MultiTypeFieldSelector>
          )}
        </div>
      )}
      <CIStepOptionalConfig
        stepViewType={stepViewType}
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.privileged) === MultiTypeInputType.RUNTIME && {
            'spec.privileged': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.reports?.spec?.paths as string) === MultiTypeInputType.RUNTIME && {
            'spec.reportPaths': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.envVariables as string) === MultiTypeInputType.RUNTIME && {
            'spec.envVariables': { tooltipId: 'dependencyEnvironmentVariables' }
          }),
          ...(shouldRenderRunTimeInputView(template?.spec?.portBindings as string) && {
            'spec.portBindings': {}
          })
        }}
        path={path || ''}
        formik={formik}
        isInputSetView={true}
        template={template}
      />
      <StepCommonFieldsInputSet
        path={path}
        readonly={readonly}
        template={template}
        withoutTimeout
        stepViewType={stepViewType}
      />
      {/* <RunAndRunTestStepInputCommonFields {...props} /> */}
    </FormikForm>
  )
}

const BackgroundStepInputSet = connect(BackgroundStepInputSetBasic)
export { BackgroundStepInputSet }
