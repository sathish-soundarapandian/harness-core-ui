/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link, useParams } from 'react-router-dom'
import cx from 'classnames'
import { Button, ButtonSize, ButtonVariation, Icon, Layout, Text, Popover } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { get, uniqBy } from 'lodash-es'
import { Classes, PopoverInteractionKind, Tooltip } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { Application, Environment } from 'services/cd-ng'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import { isMultiSvcOrMultiEnv as getIsMultiSvcOrMultiEnv, StepNodeType } from '@pipeline/utils/executionUtils'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { ExecutionPathProps, ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { stageIconMap } from './ExecutionStage'
import { linkNode } from './gitopsRenderer'
import css from './ExecutionListTable.module.scss'

export interface MultiTypeDeploymentSummaryProps {
  stage: PipelineGraphState
  onToggleClick(): void
  isStagesExpanded: boolean
  pipelineIdentifier: string
  executionIdentifier: string
  source: ExecutionPathProps['source']
  connectorRef?: string
  repoName?: string
  branch?: string
  storeType?: StoreMetadata['storeType']
  link?: boolean
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
  } /* istanbul ignore next */ else if (Array.isArray(children) && children.length > 0) {
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

  let environments = get(stepParameters, 'environments.values.__encodedValue.valueDoc.value')
  const environmentGroup = get(stepParameters, 'environmentGroup')

  if (!environments) {
    // GitOps
    const allChildEnvs: Environment[] =
      children?.reduce((accum: Environment[], child: PipelineGraphState) => {
        const childEnvs = get(child, 'data.moduleInfo.cd.gitopsExecutionSummary.environments')
        return [...accum, ...(childEnvs || [])]
      }, []) || []
    environments = uniqBy(allChildEnvs, env => `${env.identifier}`)
  }

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
  } else if (Array.isArray(environments) && environments.length) {
    environmentsText =
      environments.length > 1
        ? getString('pipeline.numOfEnvs', { numOfEnvironments: environments.length })
        : /* istanbul ignore next */ get(environments[0], 'environmentRef.__encodedValue.valueDoc.value') ||
          get(environments[0], 'name') ||
          get(environments[0], 'identifier')

    environmentsTooltipText =
      environments.length > 1 ? (
        <React.Fragment>
          {environments.map((e, i) => (
            <Text font={{ size: 'small' }} color={Color.WHITE} margin={{ bottom: 'small' }} key={i}>
              {get(e, 'environmentRef.__encodedValue.valueDoc.value') || get(e, 'name') || get(e, 'identifier')}
            </Text>
          ))}
        </React.Fragment>
      ) : undefined
  } /* istanbul ignore next */ else if (Array.isArray(children) && children.length > 0) {
    environmentsText =
      get(children[0], 'data.moduleInfo.cd.infraExecutionSummary.name') ||
      get(children[0], 'data.moduleInfo.cd.infraExecutionSummary.identifier')
  }

  return [environmentsText, environmentsTooltipText]
}

function getGitOpsApplicationTextAndTooltip(
  props: GetTextAndTooltipProps & ProjectPathProps & ModulePathParams
): [string, React.ReactElement | undefined] {
  const { getString, children, orgIdentifier, module, accountId, projectIdentifier } = props
  let appsText = ''
  let appsTooltipText: React.ReactElement | undefined = undefined

  if (Array.isArray(children) && children.length > 0) {
    const allChildApps: Application[] = children.reduce((accum: Application[], child: PipelineGraphState) => {
      const childApps = get(child, 'data.moduleInfo.cd.gitOpsAppSummary.applications')
      return [...accum, ...(childApps || [])]
    }, [])
    const apps = uniqBy(allChildApps, app => `${app.identifier}_${app.name}_${app.agentIdentifier}`)
    appsText = apps.length > 1 ? getString('pipeline.numOfApps', { numOfApps: apps.length }) : apps[0]?.name || ''
    appsTooltipText =
      apps.length > 1 ? (
        <Layout.Vertical spacing="small" padding="medium" style={{ maxWidth: 500 }}>
          {apps.map((e: Application, i: number) =>
            linkNode(e, {
              index: i,
              color: Color.PRIMARY_5,
              lineClamp: 1,
              orgIdentifier,
              module,
              accountId,
              projectIdentifier
            })
          )}
        </Layout.Vertical>
      ) : undefined
  }
  return [appsText, appsTooltipText]
}

export function MultiTypeDeploymentSummary(props: MultiTypeDeploymentSummaryProps): React.ReactElement {
  const {
    stage,
    onToggleClick,
    isStagesExpanded,
    link,
    pipelineIdentifier,
    executionIdentifier,
    source,
    connectorRef,
    repoName,
    branch,
    storeType
  } = props
  const { getString } = useStrings()
  const selectedNodeId = stage?.data?.nodeType === StepNodeType.RUNTIME_INPUT ? stage.identifier : stage.id
  const stageIconProps = stageIconMap[stage.type as StageType]
  const subType = get(stage, 'data.moduleInfo.stepParameters.subType')
  const isMultiSvcOrMultiEnv = getIsMultiSvcOrMultiEnv(subType)
  const stepParameters = get(stage, 'data.moduleInfo.stepParameters')
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()

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
  const [gitopsAppsText, gitopsAppsTooltipText] = getGitOpsApplicationTextAndTooltip({
    stepParameters,
    getString,
    subType,
    children: stage.data.children,
    orgIdentifier,
    projectIdentifier,
    accountId,
    module
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
      {link ? (
        <Link
          className={css.stageLink}
          to={routes.toExecutionPipelineView({
            accountId,
            orgIdentifier,
            projectIdentifier,
            pipelineIdentifier,
            executionIdentifier,
            module,
            source,
            connectorRef,
            branch,
            repoName,
            storeType,
            stage: stage.stageNodeId ?? selectedNodeId,
            ...(stage.stageNodeId && { stageExecId: stage.id })
          })}
        >
          {stage.name}
        </Link>
      ) : (
        <Text font={{ size: 'small' }} color={Color.GREY_900} lineClamp={1}>
          {stage.name}
        </Text>
      )}
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
          {gitopsAppsText ? (
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              className={Classes.DARK}
              disabled={!gitopsAppsTooltipText}
              content={gitopsAppsTooltipText}
            >
              <Text
                font={{ size: 'small' }}
                color={Color.PRIMARY_5}
                className={css.environmentsText}
                style={{ textDecoration: gitopsAppsTooltipText ? 'underline dotted' : undefined }}
              >
                {gitopsAppsText}
              </Text>
            </Popover>
          ) : null}
        </Layout.Horizontal>
      ) : null}
      <Text font={{ size: 'small' }}>|</Text>
      <Text font={{ size: 'small' }} color={Color.GREY_900}>
        {getString('pipeline.numOfStages', { n: get(stage, 'data.children.length', 1) })}
      </Text>
    </div>
  )
}
