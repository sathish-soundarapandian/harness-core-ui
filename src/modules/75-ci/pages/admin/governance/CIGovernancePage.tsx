/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, Container } from '@wings-software/uicore'
import React from 'react'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'

const CIGovernancePage: React.FC = () => {
  const tbd: () => void = () => {
    alert('TBD')
  }
  const { getString } = useStrings()
  return (
    <>
      <Page.Header
        title={getString('common.module.governance')}
        toolbar={
          <Container>
            <Button text={getString('ci.newItem')} onClick={tbd} />
          </Container>
        }
      />
      <Page.Body>
        <Page.NoDataCard
          icon="nav-dashboard"
          message={getString('ci.noData')}
          buttonText={getString('ci.newItem')}
          onClick={tbd}
        />
      </Page.Body>
    </>
  )
}

export default CIGovernancePage
