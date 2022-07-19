/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

export default function YamlBuilder(props: React.PropsWithChildren<unknown>): React.ReactElement {
  return <div>{props.children}</div>
}

export const YamlBuilderMemo = YamlBuilder
