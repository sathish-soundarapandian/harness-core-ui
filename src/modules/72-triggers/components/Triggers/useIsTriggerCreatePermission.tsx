/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

export const useIsTriggerCreatePermission = (): boolean => {
  const { pipelineIdentifier } = useParams<PipelinePathProps>()
  const [isTriggerCreatePermission, setIsTriggerCreatePermission] = useState(false)
  const [isExecutePipeline, isEditPipeline] = usePermission(
    {
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EXECUTE_PIPELINE, PermissionIdentifier.EDIT_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [pipelineIdentifier]
  )

  useEffect(() => {
    setIsTriggerCreatePermission(isExecutePipeline && isEditPipeline)
  }, [isExecutePipeline, isEditPipeline])

  return isTriggerCreatePermission
}
