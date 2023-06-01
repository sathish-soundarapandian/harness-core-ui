import React from 'react'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'

export default function RowActionButtons(): React.ReactElement {
  const { onDiscard } = useServiceOverridesContext()

  return (
    <Layout.Horizontal spacing={'medium'}>
      <Button icon="tick" variation={ButtonVariation.ICON} type="submit" />
      <Button icon="cross" variation={ButtonVariation.ICON} onClick={() => onDiscard()} />
    </Layout.Horizontal>
  )
}
