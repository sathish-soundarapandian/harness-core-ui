/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@harness/uicore'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { EvaluationView } from '@governance/EvaluationView'

export default function ExecutionPolicyEvaluationsView(): React.ReactElement | null {
  const { accountId, module } = useParams<PipelineType<ExecutionPathProps>>()
  const context = useExecutionContext()
  const governanceMetadata = context?.pipelineExecutionDetail?.pipelineExecutionSummary?.governanceMetadata

  if (!governanceMetadata) {
    return null
  }

  return (
    <Container width="100%" height="100%">
      <EvaluationView metadata={governanceMetadata} accountId={accountId} module={module} />
    </Container>
  )
}
