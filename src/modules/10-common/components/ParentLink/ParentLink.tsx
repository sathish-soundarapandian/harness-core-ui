/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link } from 'react-router-dom'

interface ParentLinkProps {
  to: string
  className: string
  activeClassName: string
  href: string
}

function ParentLink(props: React.PropsWithChildren<ParentLinkProps>): React.ReactElement {
  return <Link {...props}>{props.children}</Link>
}

export default ParentLink
