/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

const SectionToggle = (): ReactElement => {
  const params = useParams<ProjectPathProps & { accountId: string }>()
  const { getString } = useStrings()

  return (
    <TabNavigation
      links={[
        {
          label: getString('cf.shared.targets'),
          to: routes.toCFTargets(params)
        },
        {
          label: getString('cf.shared.segments'),
          to: routes.toCFSegments(params)
        }
      ]}
    />
  )
}

export default SectionToggle
