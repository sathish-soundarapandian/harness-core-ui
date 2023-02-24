/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Icon, AllowedTypes } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { defaultTo, get } from 'lodash-es'
import { Link, useParams } from 'react-router-dom'
import { Classes, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import type { StageElementWrapperConfig } from 'services/pipeline-ng'
import type { PipelineStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { useStrings } from 'framework/strings'
import type { AccountPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import type { StageSelectionData } from '@pipeline/utils/runPipelineUtils'
import type { StepViewType } from '../AbstractSteps/Step'
import css from './PipelineInputSetForm.module.scss'

export interface ChainedPipelineInputSetFormProps {
  stageObj: StageElementWrapperConfig
  inputPath: string
  outputPath: string
  stagePath: string
  viewType: StepViewType
  allowableTypes: AllowedTypes
  allValues?: StageElementWrapperConfig
  readonly?: boolean
  executionIdentifier?: string
  maybeContainerClass?: string
  viewTypeMetadata?: Record<string, boolean>
  selectedStageData?: StageSelectionData
  disableRuntimeInputConfigureOptions?: boolean
}

export interface ChildPipelineMetadataType {
  pipelineIdentifier: string
  projectIdentifier: string
  orgIdentifier: string
  parentPipelineName?: string
}

export function getChildPipelineMetadata(allValues?: StageElementWrapperConfig): ChildPipelineMetadataType {
  const pipelineIdentifier = get(allValues?.stage as PipelineStageElementConfig, 'spec.pipeline', '')
  const projectIdentifier = get(allValues?.stage as PipelineStageElementConfig, 'spec.project', '')
  const orgIdentifier = get(allValues?.stage as PipelineStageElementConfig, 'spec.org', '')
  const parentPipelineName = get(allValues?.stage as PipelineStageElementConfig, 'name', '')
  return { pipelineIdentifier, projectIdentifier, orgIdentifier, parentPipelineName }
}

export function ChainedPipelineInfoPopover(
  props: React.PropsWithChildren<{ childPipelineMetadata: ChildPipelineMetadataType }>
): JSX.Element {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, parentPipelineName } = defaultTo(
    props.childPipelineMetadata,
    {} as ChildPipelineMetadataType
  )
  const { getString } = useStrings()
  const { accountId, module } = useParams<AccountPathProps & ModulePathParams>()

  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      popoverClassName={Classes.DARK}
      modifiers={{ preventOverflow: { escapeWithReference: true } }}
      position={Position.BOTTOM_LEFT}
      content={
        <div className={cx(css.popoverContent, css.childPipelineLink)}>
          {parentPipelineName && (
            <Text
              font={{ variation: FontVariation.LEAD, weight: 'light' }}
              color={Color.GREY_200}
              margin={{ right: 'xsmall' }}
            >
              {`${parentPipelineName} |`}
            </Text>
          )}
          <Link
            to={routes.toPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              accountId,
              module
            })}
            target="_blank"
            className={css.childPipelineLink}
          >
            <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_5} lineClamp={1}>
              {`${getString('common.pipeline')}: ${pipelineIdentifier}`}
            </Text>
            <Icon name="launch" color={Color.PRIMARY_4} size={14} margin={{ left: 'small' }} />
          </Link>
        </div>
      }
    >
      {props.children}
    </Popover>
  )
}
