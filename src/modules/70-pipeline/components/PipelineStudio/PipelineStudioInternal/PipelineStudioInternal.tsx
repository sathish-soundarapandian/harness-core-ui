/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import type {
  PipelinePathProps,
  ProjectPathProps,
  PathFn,
  PipelineType,
  PipelineStudioQueryParams
} from '@common/interfaces/RouteInterfaces'

import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PipelineCanvas } from '../PipelineCanvas/PipelineCanvas'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { PipelineSchemaContextProvider } from '../PipelineSchema/PipelineSchemaContext'
import css from './PipelineStudioInternal.module.scss'

export interface PipelineStudioProps {
  className?: string
  title?: string
  onClose?: () => void
  routePipelineStudio: PathFn<PipelineType<PipelinePathProps> & PipelineStudioQueryParams>
  routePipelineDetail: PathFn<PipelineType<PipelinePathProps>>
  routePipelineList: PathFn<PipelineType<ProjectPathProps>>
  routePipelineProject: PathFn<PipelineType<ProjectPathProps>>
  // diagram?: DiagramFactory
  getOtherModal?: (
    onSubmit: (values: PipelineInfoConfig) => void,
    onClose: () => void
  ) => React.ReactElement<OtherModalProps>
}

interface PipelineStudioState {
  error?: Error
}

interface OtherModalProps {
  onSubmit?: (values: PipelineInfoConfig) => void
  initialValues?: PipelineInfoConfig
  onClose?: () => void
}

export class PipelineStudioInternal extends React.Component<PipelineStudioProps, PipelineStudioState> {
  state: PipelineStudioState = { error: undefined }
  context!: React.ContextType<typeof PipelineContext>
  static contextType = PipelineContext

  componentDidCatch(error: Error): boolean {
    this.setState({ error })
    if (window?.bugsnagClient?.notify) {
      window?.bugsnagClient?.notify(error)
    }
    return false
  }

  render(): JSX.Element {
    const { error } = this.state
    const {
      className = '',
      routePipelineStudio,
      routePipelineDetail,
      routePipelineList,
      routePipelineProject,
      getOtherModal
    } = this.props
    return (
      <PipelineSchemaContextProvider>
        <GitSyncStoreProvider>
          <div className={cx(css.container, className)}>
            <PipelineCanvas
              toPipelineStudio={routePipelineStudio}
              toPipelineDetail={routePipelineDetail}
              toPipelineList={routePipelineList}
              toPipelineProject={routePipelineProject}
              getOtherModal={getOtherModal}
              error={error}
            />
          </div>
        </GitSyncStoreProvider>
      </PipelineSchemaContextProvider>
    )
  }
}
