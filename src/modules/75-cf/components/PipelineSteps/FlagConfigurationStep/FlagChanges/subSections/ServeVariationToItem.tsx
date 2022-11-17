/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useMemo, useState } from 'react'
import { AvatarGroup, AvatarGroupProps, Button, ButtonVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { Variation } from 'services/cf'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import ItemVariationDialog, { ItemVariationDialogProps } from './ItemVariationDialog'
import css from './ServeVariationToItem.module.scss'

export interface ServeVariationToItemProps {
  dialogTitle: ItemVariationDialogProps['title']
  itemLabel: ItemVariationDialogProps['itemLabel']
  itemPlaceholder: ItemVariationDialogProps['itemPlaceholder']
  itemFieldName: string
  serveItemString: string
  serveItemsString: string
  setField: (fieldName: string, value: unknown) => void
  items: ItemVariationDialogProps['items']
  selectedItems: ItemVariationDialogProps['selectedItems']
  variations: Variation[]
  selectedVariationId?: string
  instructionType: string
  instructionIdentifier: string
}

const ServeVariationToItem: FC<ServeVariationToItemProps> = ({
  dialogTitle,
  itemLabel,
  itemPlaceholder,
  itemFieldName,
  serveItemString,
  serveItemsString,
  variations,
  selectedVariationId,
  items,
  selectedItems,
  setField,
  instructionType,
  instructionIdentifier
}) => {
  const { getString } = useStrings()

  useEffect(() => {
    setField('identifier', instructionIdentifier)
    setField('type', instructionType)
  }, [])

  const [selectedVariation, selectedVariationIndex] = useMemo<[Variation | undefined, number]>(() => {
    if (!selectedVariationId || !Array.isArray(variations)) {
      return [undefined, -1]
    }

    const position = variations.findIndex(({ identifier }) => identifier === selectedVariationId)

    return [position >= 0 ? variations[position] : undefined, position]
  }, [selectedVariationId, variations])

  const [itemVariationDialogOpen, setItemVariationDialogOpen] = useState<boolean>(false)

  const avatars = useMemo<AvatarGroupProps['avatars']>(
    () => selectedItems.map(({ name, identifier }) => ({ name, id: identifier })),
    [selectedItems]
  )

  const handleIncludeChange: ItemVariationDialogProps['onChange'] = (newItems, newVariation) => {
    setField(`spec.variation`, newVariation.identifier)
    setField(
      `spec.${itemFieldName}`,
      newItems.map(({ identifier }) => identifier)
    )
  }

  const handleCloseDialog: ItemVariationDialogProps['closeDialog'] = () => {
    setItemVariationDialogOpen(false)
  }

  return (
    <>
      {selectedVariation && !!selectedItems.length && (
        <Layout.Vertical spacing="medium" border={{ bottom: true }} padding={{ bottom: 'medium' }}>
          <p className={css.variationParagraph}>
            {getString('cf.pipeline.flagConfiguration.serve')}
            <VariationWithIcon
              textStyle={{ fontWeight: 'bold' }}
              variation={selectedVariation}
              index={selectedVariationIndex}
            />
            {selectedItems.length > 1 ? serveItemsString : serveItemString}:
          </p>
          <div className={css.avatars}>
            <AvatarGroup avatars={avatars} restrictLengthTo={15} />
            <Text>({selectedItems.length})</Text>
          </div>
        </Layout.Vertical>
      )}

      <span>
        <Button
          className={css.addButton}
          variation={ButtonVariation.LINK}
          text={dialogTitle}
          onClick={e => {
            e.preventDefault()
            setItemVariationDialogOpen(true)
          }}
        />
      </span>

      <ItemVariationDialog
        title={dialogTitle}
        itemPlaceholder={itemPlaceholder}
        itemLabel={itemLabel}
        isOpen={itemVariationDialogOpen}
        items={items}
        variations={variations}
        closeDialog={handleCloseDialog}
        selectedVariation={selectedVariation}
        selectedItems={selectedItems}
        onChange={handleIncludeChange}
      />
    </>
  )
}

export default ServeVariationToItem
