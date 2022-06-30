/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { ITreeNode } from '@blueprintjs/core'
import { Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import get from 'lodash-es/get'
import type { UseStringsReturn } from 'framework/strings'

import type { PipelineInfoConfig, StageElementConfig } from 'services/pipeline-ng'
import { StageType } from '@pipeline/utils/stageHelpers'
import { PipelineContextType } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

export interface NodeClasses {
  primary?: string
  secondary?: string
  empty?: string
}

const addServiceRelatedNodes = (
  stageNode: ITreeNode,
  stage: StageElementConfig,
  getString: UseStringsReturn['getString'],
  classes: NodeClasses = {},
  {
    hideNonRuntimeFields = false,
    template = {}
  }: { hideNonRuntimeFields?: boolean; template?: Record<string, never> } = {}
): ITreeNode => {
  // only cd stage
  if (stage.type === StageType.DEPLOY) {
    const enabledChildList = Object.keys(get(template, 'spec.serviceConfig.serviceDefinition.spec', {}))
    const childNodes = []
    if (hideNonRuntimeFields) {
      enabledChildList.includes('artifacts') &&
        childNodes.push({
          id: `Stage.${stage.identifier}.Service.Artifacts`,
          hasCaret: false,
          label: <Text>{'Artifacts'}</Text>,
          className: classes.secondary
        })
      enabledChildList.includes('manifests') &&
        childNodes.push({
          id: `Stage.${stage.identifier}.Service.Manifests`,
          hasCaret: false,
          label: <Text>{'Manifests'}</Text>,
          className: classes.secondary
        })
      enabledChildList.includes('variables') &&
        childNodes.push({
          id: `Stage.${stage.identifier}.Service.Variables`,
          hasCaret: false,
          label: <Text>{'Variables'}</Text>,
          className: classes.secondary
        })
    } else {
      childNodes.push(
        ...[
          {
            id: `Stage.${stage.identifier}.Service.Artifacts`,
            hasCaret: false,
            label: <Text>{'Artifacts'}</Text>,
            className: classes.secondary
          },
          {
            id: `Stage.${stage.identifier}.Service.Manifests`,
            hasCaret: false,
            label: <Text>{'Manifests'}</Text>,
            className: classes.secondary
          },
          {
            id: `Stage.${stage.identifier}.Service.Variables`,
            hasCaret: false,
            label: <Text>{'Variables'}</Text>,
            className: classes.secondary
          }
        ]
      )
    }
    if (hideNonRuntimeFields) {
      if (Object.keys(get(template, 'spec', {})).includes('serviceConfig')) {
        stageNode.childNodes?.push({
          id: `Stage.${stage.identifier}.Service`,
          hasCaret: false,
          label: <Text>{getString('service')}</Text>,
          className: classes.secondary,
          isExpanded: true,
          childNodes
        })
      }
    } else {
      stageNode.childNodes?.push({
        id: `Stage.${stage.identifier}.Service`,
        hasCaret: false,
        label: <Text>{getString('service')}</Text>,
        className: classes.secondary,
        isExpanded: true,
        childNodes
      })
    }
  }

  return stageNode
}

const addInfraRelatedNodes = (
  stageNode: ITreeNode,
  stage: StageElementConfig,
  getString: UseStringsReturn['getString'],
  classes: NodeClasses = {},
  {
    hideNonRuntimeFields = false,
    template = {}
  }: { hideNonRuntimeFields?: boolean; template?: Record<string, never> } = {}
): ITreeNode => {
  // common to ci and cd stage
  if (stage.type === StageType.DEPLOY) {
    if (hideNonRuntimeFields) {
      const enabledChildList = Object.keys(get(template, 'spec', {}))
      if (enabledChildList.includes('infrastructure')) {
        stageNode.childNodes?.push({
          id: `Stage.${stage.identifier}.Infrastructure`,
          hasCaret: false,
          label: <Text>{getString('infrastructureText')}</Text>,
          className: classes.secondary
        })
      }
      if (enabledChildList.includes('execution')) {
        stageNode.childNodes?.push({
          id: `Stage.${stage.identifier}.Execution`,
          hasCaret: false,
          label: <Text>{getString('executionText')}</Text>,
          className: classes.secondary
        })
      }
    } else {
      stageNode.childNodes?.push(
        {
          id: `Stage.${stage.identifier}.Infrastructure`,
          hasCaret: false,
          label: <Text>{getString('infrastructureText')}</Text>,
          className: classes.secondary
        },
        {
          id: `Stage.${stage.identifier}.Execution`,
          hasCaret: false,
          label: <Text>{getString('executionText')}</Text>,
          className: classes.secondary
        }
      )
    }
  }

  return stageNode
}

const getStageTree = (
  stage: StageElementConfig,
  getString: UseStringsReturn['getString'],
  classes: NodeClasses = {},
  {
    hideNonRuntimeFields = false,
    template = {}
  }: { hideNonRuntimeFields?: boolean; template?: Record<string, never> } = {}
): ITreeNode => {
  let stageNode: ITreeNode = {
    id: `Stage.${stage.identifier}`,
    hasCaret: true,
    label: (
      <Text color={Color.GREY_800} style={{ fontWeight: 600 }} width="147" lineClamp={1}>
        {stage.name}
      </Text>
    ),
    className: classes.primary,
    childNodes: []
  }

  // common to ci and cd stage
  if (hideNonRuntimeFields) {
    const hasVariables = get(template, 'variables', null)
    if (hasVariables) {
      stageNode.childNodes?.push({
        id: `Stage.${stage.identifier}.Variables`,
        hasCaret: false,
        label: <Text>{getString('customVariables.title')}</Text>,
        className: classes.secondary
      })
    }
  } else {
    stageNode.childNodes?.push({
      id: `Stage.${stage.identifier}.Variables`,
      hasCaret: false,
      label: <Text>{getString('customVariables.title')}</Text>,
      className: classes.secondary
    })
  }

  stageNode = addServiceRelatedNodes(stageNode, stage, getString, classes, { hideNonRuntimeFields, template })

  stageNode = addInfraRelatedNodes(stageNode, stage, getString, classes, { hideNonRuntimeFields, template })

  return stageNode
}

export const getPipelineTree = (
  pipeline: PipelineInfoConfig,
  getString: UseStringsReturn['getString'],
  classes: NodeClasses = {},
  options: { hideNonRuntimeFields?: boolean; template?: { stages: [{ stage: Record<string, never> }] } } = {}
): ITreeNode[] => {
  const returnNodes: ITreeNode[] = [
    {
      id: 'Pipeline',
      hasCaret: false,
      label: (
        <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
          {getString('customVariables.pipelineVariablesTitle')}
        </Text>
      ),
      className: classes.primary
    }
  ]
  if (options.hideNonRuntimeFields) {
    get(options.template, 'variables', null) &&
      returnNodes.push({
        id: 'Pipeline.Variables',
        hasCaret: false,
        label: (
          <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
            {getString('customVariables.title')}
          </Text>
        ),
        className: classes.empty
      })
  } else {
    returnNodes.push({
      id: 'Pipeline.Variables',
      hasCaret: false,
      label: (
        <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
          {getString('customVariables.title')}
        </Text>
      ),
      className: classes.empty
    })
  }
  /* istanbul ignore else */ if (
    pipeline.stages &&
    pipeline.stages?.length > 0 &&
    (!options.template || options.template?.stages)
  ) {
    const stages: ITreeNode = {
      id: 'Stages',
      hasCaret: true,
      isExpanded: true,
      label: (
        <Text color={Color.GREY_500} font={{ size: 'normal' }} style={{ fontWeight: 500 }}>
          {getString('stages')}
        </Text>
      ),
      childNodes: []
    }
    pipeline.stages.forEach((data, index) => {
      if (data.parallel && data.parallel.length > 0) {
        data.parallel.forEach(nodeP => {
          if (nodeP.stage) {
            stages.childNodes?.push(getStageTree(nodeP.stage, getString, classes))
          }
        })
      } /* istanbul ignore else */ else if (
        data.stage &&
        (!options.template || options.template?.stages?.[index]?.stage)
      ) {
        stages.childNodes?.push(
          getStageTree(data.stage, getString, classes, {
            ...options,
            template: options.template?.stages?.[index]?.stage
          })
        )
      }
    })
    returnNodes.push(stages)
  }
  return returnNodes
}

export const isContextTypeNotStageTemplate = (contextType?: string) => contextType !== PipelineContextType.StageTemplate
