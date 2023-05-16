/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Text } from '@harness/uicore'
import type { ReactElement } from 'react';
import React from 'react'
import type { Row } from 'react-table'

import type { Artifact } from './ArtifactsTable'

export function ArtifactExpandedView({ row }: { row: Row<Artifact> }): ReactElement {
  const data = row.original

  return <Text>{data.imageName} ArtifactExpandedView TODO</Text>
}
