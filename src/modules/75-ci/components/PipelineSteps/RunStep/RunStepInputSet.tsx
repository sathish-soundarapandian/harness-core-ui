/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Container } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { isEmpty, startCase } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { shouldRenderRunTimeInputViewWithAllowedValues } from '@pipeline/utils/CIUtils'
import type { RunStepProps } from './RunStep'
import { CIStep } from '../CIStep/CIStep'
import { ConnectorRefWithImage } from '../CIStep/ConnectorRefWithImage'
import { renderMultiTypeInputWithAllowedValues } from '../CIStep/CIStepOptionalConfig'
import { RunAndRunTestStepInputCommonFields } from '../CIStep/RunAndRunTestStepInputCommonFields'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunStepInputSetBasic: React.FC<RunStepProps> = props => {
  const { template, path, readonly, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`

  const { expressions } = useVariablesExpression()

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
                <Text
                  color={Color.GREY_800}
                  font={{ size: 'normal', weight: 'bold' }}
                  className={css.inpLabel}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'runCommand' }}
                >
                  {getString('commandLabel')}
                </Text>
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
      {getMultiTypeFromValue(template?.spec?.privileged) === MultiTypeInputType.RUNTIME && (
        <div className={cx(css.formGroup, css.sm, css.topMargin4, css.bottomMargin5)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.privileged`}
            label={getString('pipeline.buildInfra.privileged').concat(
              ` (${startCase(getString('common.optionalLabel'))})`
            )}
            disabled={readonly}
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            tooltipProps={{ dataTooltipId: 'privileged' }}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
      <RunAndRunTestStepInputCommonFields {...props} />
    </FormikForm>
  )
}

const RunStepInputSet = connect(RunStepInputSetBasic)
export { RunStepInputSet }
