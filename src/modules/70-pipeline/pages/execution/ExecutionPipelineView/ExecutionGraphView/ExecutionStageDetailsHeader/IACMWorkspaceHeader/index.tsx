/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
/* istanbul ignore file */
import React, { FC, lazy } from 'react'
import { Container } from '@harness/uicore'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import type { ExecutionNode } from 'services/pipeline-ng'

// eslint-disable-next-line import/no-unresolved
const RemoteIACMApp = lazy(() => import('iacm/MicroFrontendApp'))

interface IACMWorkspaceHeaderProps {
  allNodeMap: { [key: string]: ExecutionNode }
}

// eslint-disable-next-line react/function-component-definition
const IACMWorkspaceHeader: FC<IACMWorkspaceHeaderProps> = props => (
  <Container width="100%" height="100%">
    <ChildAppMounter ChildApp={RemoteIACMApp} {...props} />
  </Container>
)

export default IACMWorkspaceHeader
