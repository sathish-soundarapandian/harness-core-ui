import React from 'react'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'

export default function RowActionButtons({ rowIndex }: { rowIndex: number }): React.ReactElement {
  const { onEdit, onDelete } = useServiceOverridesContext()

  return (
    <Layout.Horizontal spacing={'small'} width={75}>
      {/* <Button
        icon="duplicate"
        variation={ButtonVariation.ICON}
        font={{ variation: FontVariation.BODY1 }}
        onClick={() => onDuplicate(rowIndex)}
      /> */}
      <Button
        icon="Edit"
        variation={ButtonVariation.ICON}
        font={{ variation: FontVariation.BODY1 }}
        onClick={() => onEdit(rowIndex)}
      />
      <Button
        icon="main-trash"
        variation={ButtonVariation.ICON}
        font={{ variation: FontVariation.BODY1 }}
        onClick={() => onDelete(rowIndex)}
      />
    </Layout.Horizontal>
  )
}
