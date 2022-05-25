/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import type {
  ExecutionPathProps,
  Module,
  ModulePathParams,
  PipelinePathProps,
  PipelineType,
  ProjectPathProps
} from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ModuleName } from 'framework/types/ModuleName'
import type { ProjectModule } from 'services/cd-ng'

export const RedirectToAccessControlHome: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()

  return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier, module })} />
}

export const RedirectToDelegatesHome: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()

  return <Redirect to={routes.toDelegateList({ accountId, projectIdentifier, orgIdentifier, module })} />
}

export const RedirectToExecutionPipeline: React.FC = () => {
  const params = useParams<PipelineType<ExecutionPathProps>>()

  return <Redirect to={routes.toExecutionPipelineView(params)} />
}

export const RedirectToPipelineDetailHome: React.FC = () => {
  const params = useParams<PipelineType<PipelinePathProps>>()

  return <Redirect to={routes.toPipelineStudio(params)} />
}

export const RedirectToGitSyncHome: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  return <Redirect to={routes.toGitSyncReposAdmin({ projectIdentifier, accountId, orgIdentifier, module })} />
}

export const RedirectToSubscriptionsFactory = (moduleName: ModuleName) => (): React.ReactElement => {
  const { accountId } = useParams<{ accountId: string }>() // eslint-disable-line react-hooks/rules-of-hooks

  return (
    <Redirect
      to={routes.toSubscriptions({
        accountId,
        moduleCard: moduleName.toLowerCase() as Module
      })}
    />
  )
}

export const RedirectToModuleTrialHomeFactory = (moduleName: ModuleName) => (): React.ReactElement => {
  const { accountId } = useParams<{ accountId: string }>() // eslint-disable-line react-hooks/rules-of-hooks
  const { source } = useQueryParams<{ source?: string }>() // eslint-disable-line react-hooks/rules-of-hooks

  return (
    <Redirect
      to={routes.toModuleTrialHome({
        accountId,
        module: moduleName.toLowerCase() as Module,
        source
      })}
    />
  )
}

export const RedirectToProjectFactory =
  (moduleName: ModuleName, homeRoute: (params: { accountId: string }) => string) => (): React.ReactElement => {
    const { accountId } = useParams<ProjectPathProps>() // eslint-disable-line react-hooks/rules-of-hooks
    const { selectedProject } = useAppStore() // eslint-disable-line react-hooks/rules-of-hooks

    if (selectedProject?.modules?.includes(moduleName as ProjectModule)) {
      return (
        <Redirect
          to={routes.toProjectOverview({
            accountId,
            module: moduleName.toLowerCase() as Module,
            orgIdentifier: selectedProject.orgIdentifier || '',
            projectIdentifier: selectedProject.identifier
          })}
        />
      )
    } else {
      return <Redirect to={homeRoute({ accountId })} />
    }
  }
