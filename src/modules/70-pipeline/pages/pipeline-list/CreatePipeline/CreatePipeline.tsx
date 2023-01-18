/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import routes from '@common/RouteDefinitions'
import CreatePipelineButton from '@pipeline/components/CreatePipelineButton/CreatePipelineButton'
import useMigrateResource from '@pipeline/components/MigrateResource/useMigrateResource'
import { useStrings } from 'framework/strings'
import type { PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { getRouteProps } from '../PipelineListUtils'
import type { PipelineListPagePathParams } from '../types'

interface CreatePipelineProps {
  onSuccess: () => void
}

export function CreatePipeline({ onSuccess }: CreatePipelineProps): ReactElement {
  const { getString } = useStrings()
  const pathParams = useParams<PipelineListPagePathParams>()
  const history = useHistory()

  const goToPipelineStudio = (pipeline?: PMSPipelineSummaryResponse): void =>
    history.push(routes.toPipelineStudio(getRouteProps(pathParams, pipeline)))

  const { showMigrateResourceModal: showImportResourceModal } = useMigrateResource({
    resourceType: ResourceType.PIPELINES,
    modalTitle: getString('common.importEntityFromGit', { resourceType: getString('common.pipeline') }),
    onSuccess
  })

  return (
    <CreatePipelineButton
      label={getString('common.createPipeline')}
      onCreatePipelineClick={() => goToPipelineStudio({ identifier: '-1' })}
      onImportPipelineClick={showImportResourceModal}
    />
  )
}
