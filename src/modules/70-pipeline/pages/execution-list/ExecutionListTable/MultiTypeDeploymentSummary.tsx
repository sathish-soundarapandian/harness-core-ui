import React from 'react'
import cx from 'classnames'
import { Button, ButtonSize, ButtonVariation, Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { get } from 'lodash-es'
import { Tooltip } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import { isMultiSvcOrMultiEnv as getIsMultiSvcOrMultiEnv } from '@pipeline/utils/executionUtils'
import type { StageType } from '@pipeline/utils/stageHelpers'

import { stageIconMap } from './ExecutionStage'

import css from './ExecutionListTable.module.scss'

export interface MultiTypeDeploymentSummaryProps {
  stage: PipelineGraphState
  onToggleClick(): void
  isStagesExpanded: boolean
}

export interface GetTextAndTooltipProps {
  stepParameters: unknown
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
  subType?: string
  children?: PipelineGraphState[]
}

function getServicesTextAndTooltip(props: GetTextAndTooltipProps): [string, React.ReactElement | undefined] {
  const { stepParameters, getString, children } = props
  const services = get(stepParameters, 'services.values.__encodedValue.valueDoc.value')

  let servicesText = ''
  let servicesTooltipText: React.ReactElement | undefined = undefined
  if (Array.isArray(services)) {
    servicesText =
      services.length > 1
        ? getString('pipeline.numOfServices', { numOfServices: services.length })
        : get(services[0], 'serviceRef.__encodedValue.valueDoc.value')

    servicesTooltipText =
      services.length > 1 ? (
        <React.Fragment>
          {services.map((e, i) => (
            <Text font={{ size: 'small' }} color={Color.WHITE} margin={{ bottom: 'small' }} key={i}>
              {get(e, 'serviceRef.__encodedValue.valueDoc.value')}
            </Text>
          ))}
        </React.Fragment>
      ) : undefined
  } else if (Array.isArray(children) && children.length > 0) {
    servicesText =
      get(children[0], 'data.moduleInfo.cd.serviceInfo.displayName') ||
      get(children[0], 'data.moduleInfo.cd.serviceInfo.identifier')
  }

  return [servicesText, servicesTooltipText]
}

function getEnvironmentsTextAndTooltip(props: GetTextAndTooltipProps): [string, React.ReactElement | undefined] {
  const { stepParameters, getString, children } = props
  let environmentsText = ''
  let environmentsTooltipText: React.ReactElement | undefined = undefined

  const environments = get(stepParameters, 'environments.values.__encodedValue.valueDoc.value')
  const environmentGroup = get(stepParameters, 'environmentGroup')

  if (environmentGroup) {
    environmentsText = getString('common.environmentGroup.nameWithLabel', {
      name: get(environmentGroup, 'envGroupRef.__encodedValue.valueDoc.value')
    })

    const environmentGroupEnvironments = get(environmentGroup, 'environments.__encodedValue.valueDoc.value')

    if (Array.isArray(environmentGroupEnvironments)) {
      environmentsTooltipText = (
        <React.Fragment>
          {environmentGroupEnvironments.map((e, i) => (
            <Text font={{ size: 'small' }} color={Color.WHITE} margin={{ bottom: 'small' }} key={i}>
              {get(e, 'environmentRef.__encodedValue.valueDoc.value')}
            </Text>
          ))}
        </React.Fragment>
      )
    }
  } else if (Array.isArray(environments)) {
    environmentsText =
      environments.length > 1
        ? getString('pipeline.numOfEnvs', { numOfEnvironments: environments.length })
        : get(environments[0], 'environmentRef.__encodedValue.valueDoc.value')

    environmentsTooltipText =
      environments.length > 1 ? (
        <React.Fragment>
          {environments.map((e, i) => (
            <Text font={{ size: 'small' }} color={Color.WHITE} margin={{ bottom: 'small' }} key={i}>
              {get(e, 'environmentRef.__encodedValue.valueDoc.value')}
            </Text>
          ))}
        </React.Fragment>
      ) : undefined
  } else if (Array.isArray(children) && children.length > 0) {
    environmentsText =
      get(children[0], 'data.moduleInfo.cd.infraExecutionSummary.name') ||
      get(children[0], 'data.moduleInfo.cd.infraExecutionSummary.identifier')
  }

  return [environmentsText, environmentsTooltipText]
}

export function MultiTypeDeploymentSummary(props: MultiTypeDeploymentSummaryProps): React.ReactElement {
  const { stage, onToggleClick, isStagesExpanded } = props
  const { getString } = useStrings()
  const stageIconProps = stageIconMap[stage.type as StageType]
  const subType = get(stage, 'data.moduleInfo.stepParameters.subType')
  const isMultiSvcOrMultiEnv = getIsMultiSvcOrMultiEnv(subType)
  const stepParameters = get(stage, 'data.moduleInfo.stepParameters')

  const [servicesText, servicesTooltipText] = getServicesTextAndTooltip({
    stepParameters,
    getString,
    subType,
    children: stage.data.children
  })
  const [environmentsText, environmentsTooltipText] = getEnvironmentsTextAndTooltip({
    stepParameters,
    getString,
    subType,
    children: stage.data.children
  })

  return (
    <div className={cx(css.stage, css.matrixStage, css.matrixSummary)}>
      <Button
        variation={ButtonVariation.ICON}
        size={ButtonSize.SMALL}
        className={css.accordionBtn}
        icon={isStagesExpanded ? 'accordion-expanded' : 'accordion-collapsed'}
        iconProps={{ size: 12 }}
        onClick={onToggleClick}
      />
      <Text font={{ size: 'small' }} color={Color.GREY_900}>
        {stage.name}
      </Text>
      <Text font={{ size: 'small' }}>|</Text>
      {stageIconProps ? <Icon size={16} {...stageIconProps} /> : null}
      {isMultiSvcOrMultiEnv ? (
        <Layout.Horizontal>
          <Tooltip disabled={!servicesTooltipText} content={servicesTooltipText}>
            <Text
              font={{ size: 'small' }}
              color={Color.PRIMARY_5}
              className={css.servicesText}
              style={{ textDecoration: servicesTooltipText ? 'underline dotted' : undefined }}
            >
              {servicesText}
            </Text>
          </Tooltip>
          <Tooltip disabled={!environmentsTooltipText} content={environmentsTooltipText}>
            <Text
              font={{ size: 'small' }}
              color={Color.PRIMARY_5}
              className={css.environmentsText}
              style={{ textDecoration: environmentsTooltipText ? 'underline dotted' : undefined }}
            >
              {environmentsText}
            </Text>
          </Tooltip>
        </Layout.Horizontal>
      ) : null}
      <Text font={{ size: 'small' }}>|</Text>
      <Text font={{ size: 'small' }} color={Color.GREY_900}>
        {getString('pipeline.numOfStages', { n: get(stage, 'data.children.length', 1) })}
      </Text>
    </div>
  )
}
