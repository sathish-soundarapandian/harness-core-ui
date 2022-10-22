/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { Button, ButtonVariation } from '@harness/uicore'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'

export const AddSLOs = (): JSX.Element => {
  const formikProps = useFormikContext()
  const { showDrawer, hideDrawer } = useDrawer({
    createHeader: _props => <></>,
    createDrawerContent: _props => (
      <>
        <Button
          onClick={() => {
            formikProps.setFieldValue('serviceLevelObjectivesDetails', [
              {
                serviceLevelObjectiveRef: 'hHJYxnUFTCypZdmYr0Q0tQ',
                weightagePercentage: 50.0
              },
              {
                serviceLevelObjectiveRef: '7b-_GIZxRu6VjFqAqqdVDQ',
                weightagePercentage: 50.0
              }
            ])
            hideDrawer()
          }}
          text={'Add SLOs'}
          iconProps={{ name: 'plus' }}
          variation={ButtonVariation.PRIMARY}
        />
      </>
    )
  })

  return (
    <Button variation={ButtonVariation.PRIMARY} text={'Add SLOs'} iconProps={{ name: 'plus' }} onClick={showDrawer} />
  )
}
