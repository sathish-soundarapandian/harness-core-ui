/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react/function-component-definition */
import React from 'react'
import type { CellProps, Renderer } from 'react-table'
import {
  Text,
  FontVariation,
  Layout,
  Icon,
  Color,
  Popover,
  ButtonSize,
  ButtonVariation,
  Button,
  IconName
} from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { String, useStrings } from 'framework/strings'
import type { PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { StoreType } from '@common/constants/GitSyncTypes'
import routes from '@common/RouteDefinitions'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './PipelineStageMinimalMode.module.scss'

interface CodeSourceWrapper {
  textName: string
  iconName: IconName
  size: number
}

export const PipelineNameIdTagCell: Renderer<CellProps<PMSPipelineSummaryResponse>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="xsmall">
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H6 }} lineClamp={1} color={Color.BLACK}>
          {data?.name}
        </Text>
        <Text font={{ variation: FontVariation.BODY }} lineClamp={1} color={Color.GREY_600}>
          <String stringID="idLabel" vars={{ id: data?.identifier }} />
        </Text>
      </Layout.Vertical>
      {Object.keys(get(data, 'tags', {})).length > 0 && (
        <>
          <Icon name="main-tags" size={15} />
          <Text color={Color.GREY_600}>{Object.keys(get(data, 'tags', {})).length}</Text>
        </>
      )}
    </Layout.Horizontal>
  )
}

export const CodeSourceCell: Renderer<CellProps<PMSPipelineSummaryResponse>> = ({ row }) => {
  const { gitDetails } = row.original
  const { getString } = useStrings()
  const data = row.original
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const isRemote = data.storeType === StoreType.REMOTE || isGitSyncEnabled
  const inlineWrapper: CodeSourceWrapper = {
    textName: getString('inline'),
    iconName: 'repository',
    size: 10
  }
  const remoteWrapper: CodeSourceWrapper = {
    textName: getString('repository'),
    iconName: 'remote-setup',
    size: 12
  }

  return (
    <div className={css.codeSourceColumnContainer}>
      <Popover
        disabled={!isRemote}
        position={Position.TOP}
        interactionKind={PopoverInteractionKind.HOVER}
        className={Classes.DARK}
        content={
          <Layout.Vertical spacing="small" padding="large" className={css.contentWrapper}>
            <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
              <Icon name="github" size={14} color={Color.GREY_200} />
              <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                {get(gitDetails, 'repoName', get(gitDetails, 'repoIdentifier'))}
              </Text>
            </Layout.Horizontal>
            {gitDetails?.filePath && (
              <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
                <Icon name="remotefile" size={14} color={Color.GREY_200} />
                <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                  {gitDetails.filePath}
                </Text>
              </Layout.Horizontal>
            )}
          </Layout.Vertical>
        }
      >
        <div className={css.codeSourceColumn}>
          <Icon
            name={isRemote ? remoteWrapper.iconName : inlineWrapper.iconName}
            size={isRemote ? remoteWrapper.size : inlineWrapper.size}
            color={Color.GREY_600}
          />
          <Text margin={{ left: 'xsmall' }} font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_600}>
            {isRemote ? remoteWrapper.textName : inlineWrapper.textName}
          </Text>
        </div>
      </Popover>
    </div>
  )
}

export const ViewPipelineButtonCell: Renderer<CellProps<PMSPipelineSummaryResponse>> = ({ row, column }) => {
  const { getString } = useStrings()
  const { accountId, module } = useParams<PipelineType<ProjectPathProps>>()
  const data = row.original
  const orgIdentifier = (column as any)?.orgIdentifier
  const projectIdentifier = (column as any)?.projectIdentifier

  const openPipelineInNewTab = (): void => {
    const pipelineStudioPath = routes.toPipelineStudio({
      projectIdentifier,
      orgIdentifier,
      accountId: defaultTo(accountId, ''),
      pipelineIdentifier: get(data, 'identifier', ''),
      module,
      repoIdentifier: get(data, 'gitDetails.repoIdentifier'),
      connectorRef: get(data, 'connectorRef'),
      repoName: get(data, 'gitDetails.repoName'),
      branch: get(data, 'gitDetails.branch'),
      storeType: get(data, 'storeType') as StoreType
    })
    window.open(`${window.location.origin}${window.location.pathname}#${pipelineStudioPath}`, '_blank')
  }

  return (
    <Button
      variation={ButtonVariation.SECONDARY}
      size={ButtonSize.SMALL}
      text={getString('common.viewText')}
      icon="main-view"
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        openPipelineInNewTab()
      }}
    />
  )
}
