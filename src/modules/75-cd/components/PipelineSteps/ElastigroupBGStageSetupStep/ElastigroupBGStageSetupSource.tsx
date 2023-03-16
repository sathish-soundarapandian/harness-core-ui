/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FieldArray, FormikProps } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { AllowedTypes, Button, ButtonVariation, FormInput, Layout, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { regionValues } from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAuthConstants'
import type { ElastigroupBGStageSetupData } from './ElastigroupBGStageSetupStepTypes'
import ElastigroupBGStageSetupLoadBalancer from './ElastigroupBGStageSetupLoadbalancers'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ElastigroupBGStageSetupStep.module.scss'

export default function ElastigroupBGStageSetupSource(props: {
  formik: FormikProps<ElastigroupBGStageSetupData>
  isNewStep: boolean
  readonly?: boolean
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { formik, readonly } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return (
    <>
      <div className={css.customTitle}>{getString('cd.ElastigroupBGStageSetup.connectedCloudProvider')}</div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          label={getString('common.entityPlaceholderText')}
          type={Connectors.AWS}
          name="spec.connectedCloudProvider.spec.connectorRef"
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          style={{ marginBottom: 10 }}
          multiTypeProps={{ expressions, allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION] }}
          disabled={readonly}
          width={384}
          setRefValue
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.lg, css.marginBottom7)}>
        <Layout.Vertical>
          <FormInput.MultiTypeInput
            name="spec.connectedCloudProvider.spec.region"
            selectItems={regionValues}
            useValue
            multiTypeInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              selectProps: {
                items: regionValues,
                popoverClassName: css.dropdownRegion,
                allowCreatingNewItems: true
              },
              width: 384
            }}
            label={getString('regionLabel')}
            placeholder={getString('pipeline.regionPlaceholder')}
            disabled={readonly}
          />
        </Layout.Vertical>
      </div>

      <FieldArray
        name="spec.loadBalancers"
        render={({ push, remove }) => {
          return (
            <>
              <Layout.Horizontal className={css.awsLoadBalancerStyle}>
                <div className={css.customTitle}>{getString('cd.ElastigroupBGStageSetup.awsLoadBalancerConfig')}</div>
                <Button
                  variation={ButtonVariation.LINK}
                  data-testid="add-aws-loadbalance"
                  onClick={() =>
                    push({
                      type: 'AWSLoadBalancerConfig',
                      spec: {
                        loadBalancer: '',
                        prodListenerPort: '',
                        prodListenerRuleArn: '',
                        stageListenerPort: '',
                        stageListenerRuleArn: ''
                      }
                    })
                  }
                >
                  {getString('plusAdd')}
                </Button>
              </Layout.Horizontal>
              {formik.values.spec.loadBalancers.map((_id, i: number) => {
                return (
                  <ElastigroupBGStageSetupLoadBalancer
                    key={i}
                    formik={formik}
                    readonly={readonly}
                    remove={remove}
                    index={i}
                  />
                )
              })}
            </>
          )
        }}
      />
    </>
  )
}
