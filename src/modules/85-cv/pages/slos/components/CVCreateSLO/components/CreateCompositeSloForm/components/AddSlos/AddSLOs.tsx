import React from 'react'
import { useFormikContext } from 'formik'
import { Button, ButtonVariation } from '@harness/uicore'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'

export const AddSLOs = (): JSX.Element => {
  const formikProps = useFormikContext()
  const { showDrawer } = useDrawer({
    createHeader: _props => <></>,
    createDrawerContent: _props => (
      <>
        <Button
          onClick={() =>
            formikProps.setFieldValue('sloList', [
              { identifier: 'slo1', name: 'Slo 1' },
              { identifier: 'slo2', name: 'Slo 2' }
            ])
          }
        />
      </>
    )
  })

  return (
    <Button variation={ButtonVariation.PRIMARY} text={'Add SLOs'} iconProps={{ name: 'plus' }} onClick={showDrawer} />
  )
}
