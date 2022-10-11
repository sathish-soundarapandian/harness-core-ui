/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Card, Icon, Text, Color, AllowedTypes, ButtonSize } from '@harness/uicore'
import { Collapse } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import { defaultTo, get, set } from 'lodash-es'
import produce from 'immer'

import { getStepTypeByDeploymentType, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { deploymentIconMap } from '@cd/utils/deploymentUtils'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ServiceSpec } from 'services/cd-ng'
import { StageFormContextProvider } from '@pipeline/context/StageFormContext'

import type { FormState, ServiceData } from '../DeployServiceEntityUtils'
import css from './ServiceEntitiesList.module.scss'

export interface ServiceEntityCardProps extends ServiceData {
  defaultExpanded?: boolean
  readonly?: boolean
  stageIdentifier?: string
  deploymentType?: string
  allowableTypes: AllowedTypes
  onEditClick(svc: ServiceData): void
  onDeleteClick(svc: ServiceData): void
}

export function ServiceEntityCard(props: ServiceEntityCardProps): React.ReactElement {
  const {
    defaultExpanded,
    service,
    serviceInputs,
    readonly,
    onEditClick,
    onDeleteClick,
    allowableTypes,
    stageIdentifier,
    deploymentType
  } = props
  const [showInputs, setShowInputs] = React.useState(!!defaultExpanded)
  const { getString } = useStrings()
  const { MULTI_SERVICE_INFRA } = useFeatureFlags()
  const formik = useFormikContext<FormState>()
  const serviceIdentifier = service.identifier
  const [template, setTemplate] = React.useState<any>(serviceInputs?.serviceDefinition?.spec)
  const arifactsSpecPath = `serviceInputs.${serviceIdentifier}.serviceDefinition.spec`

  const type = service.serviceDefinition?.type as ServiceDeploymentType

  function toggle(): void {
    setShowInputs(s => !s)
  }

  function getStageFormTemplate<T>(path: string): T {
    return get(template, path.replace(`${arifactsSpecPath}.`, ''))
  }

  function updateStageFormTemplate<T>(data: T, path: string): void {
    setTemplate((value: any) =>
      produce(value, (draft: any) => {
        set(draft, path.replace(`${arifactsSpecPath}.`, ''), data)
      })
    )
  }

  return (
    <Card className={css.card}>
      <div className={css.row}>
        <div className={css.serviceNameIconWrapper}>
          <span className={css.serviceIcon}>{type ? <Icon name={deploymentIconMap[type]} size={24} /> : null}</span>
          <span className={css.serviceNameWrapper}>
            <Text color={Color.PRIMARY_7} font="normal">
              {service.name}
            </Text>
            <Text color={Color.GREY_500} font="small">
              {getString('idLabel', { id: service.identifier })}
            </Text>
          </span>
        </div>
        <div>
          <Button
            variation={ButtonVariation.ICON}
            icon="edit"
            data-testid={`edit-service-${service.identifier}`}
            disabled={readonly}
            onClick={() => onEditClick({ service, serviceInputs })}
          />
          <Button
            variation={ButtonVariation.ICON}
            icon="trash"
            data-testid={`delete-service-${service.identifier}`}
            disabled={readonly}
            onClick={() => onDeleteClick({ service, serviceInputs })}
          />
        </div>
      </div>
      {serviceInputs && MULTI_SERVICE_INFRA && get(formik?.values, `serviceInputs.${serviceIdentifier}`) ? (
        <>
          <div className={css.toggleWrapper}>
            <Button
              icon={showInputs ? 'chevron-up' : 'chevron-down'}
              data-testid="toggle-service-inputs"
              text={getString(
                showInputs
                  ? 'cd.pipelineSteps.serviceTab.hideServiceInputs'
                  : 'cd.pipelineSteps.serviceTab.viewServiceInputs'
              )}
              variation={ButtonVariation.LINK}
              size={ButtonSize.SMALL}
              onClick={toggle}
            />
          </div>
          <Collapse keepChildrenMounted={false} isOpen={showInputs}>
            <div className={css.serviceInputs}>
              <Text color={Color.GREY_800} font={{ size: 'normal', weight: 'bold' }} margin={{ bottom: 'medium' }}>
                {getString('common.serviceInputs')}
              </Text>
              <StageFormContextProvider
                getStageFormTemplate={getStageFormTemplate}
                updateStageFormTemplate={updateStageFormTemplate}
              >
                <StepWidget<ServiceSpec>
                  factory={factory}
                  initialValues={get(formik.values, arifactsSpecPath) || {}}
                  allowableTypes={allowableTypes}
                  template={defaultTo(template, {})}
                  type={getStepTypeByDeploymentType(defaultTo(deploymentType, ''))}
                  stepViewType={StepViewType.TemplateUsage}
                  path={arifactsSpecPath}
                  readonly={readonly}
                  customStepProps={{
                    stageIdentifier,
                    serviceIdentifier
                  }}
                />
              </StageFormContextProvider>
            </div>
          </Collapse>
        </>
      ) : null}
    </Card>
  )
}
