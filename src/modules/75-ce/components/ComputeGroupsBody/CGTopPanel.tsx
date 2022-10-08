/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, ExpandingSearchInput, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './ComputeGroupsBody.module.scss'

const CGTopPanel: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { getString } = useStrings()
  return (
    <Container padding={{ top: 'large', bottom: 'large', left: 'xlarge', right: 'xlarge' }} className={css.filterPanel}>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Button
          variation={ButtonVariation.PRIMARY}
          icon="plus"
          onClick={() => history.push(routes.toComputeGroupsSetup({ accountId }))}
        >
          {getString('ce.computeGroups.addNewClusterCtaText')}
        </Button>
        <Container>
          <ExpandingSearchInput alwaysExpanded />
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default CGTopPanel
