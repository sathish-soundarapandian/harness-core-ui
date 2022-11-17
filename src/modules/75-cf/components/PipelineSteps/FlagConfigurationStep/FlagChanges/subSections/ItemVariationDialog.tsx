/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, ReactNode, useMemo, useRef } from 'react'
import {
  Button,
  ButtonVariation,
  Container,
  Dialog,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  MultiSelectOption,
  SelectOption
} from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import type { Variation } from 'services/cf'

interface ItemVariationDialogFormValues {
  variation: Variation['identifier']
  items: SelectOption[]
}

interface Item {
  identifier: string
  name: string
  [key: string]: any
}

export interface ItemVariationDialogProps {
  title: ReactNode
  itemPlaceholder: string
  itemLabel: string
  isOpen: boolean
  closeDialog: () => void
  selectedItems: Item[]
  selectedVariation?: Variation
  items: Item[]
  variations: Variation[]
  onChange: (selectedItems: Item[], selectedVariation: Variation) => void
}

const ItemVariationDialog: FC<ItemVariationDialogProps> = ({
  title,
  itemPlaceholder,
  itemLabel,
  isOpen,
  closeDialog,
  selectedItems,
  selectedVariation,
  items,
  variations,
  onChange
}) => {
  const { getString } = useStrings()
  const formRef = useRef<FormikProps<ItemVariationDialogFormValues>>()

  const initialItems = useMemo<ItemVariationDialogFormValues['items']>(
    () => selectedItems.map(({ name, identifier }) => ({ label: name, value: identifier })),
    [selectedItems]
  )

  const itemOptions = useMemo<MultiSelectOption[]>(
    () => items.map<MultiSelectOption>(({ name, identifier }) => ({ label: name, value: identifier })),
    [items]
  )

  const variationOptions = useMemo<SelectOption[]>(
    () => variations.map<SelectOption>(({ name, identifier }) => ({ label: name || identifier, value: identifier })),
    [variations]
  )

  const handleSubmit = (values: ItemVariationDialogFormValues): void => {
    onChange(
      items.filter(({ identifier }) => !!values.items.find(({ value }) => value === identifier)),
      variations.find(({ identifier }) => values.variation === identifier) as Variation
    )
    closeDialog()
  }

  const handleSubmitButtonClicked = (): void => {
    formRef.current?.submitForm()
  }

  return (
    <Dialog
      enforceFocus={false}
      isOpen={isOpen}
      title={title}
      onClose={closeDialog}
      style={{ paddingBottom: 'var(--spacing-13)' }} // 😭 can't do this via a class
      footer={
        <Layout.Horizontal spacing="small">
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('done')}
            onClick={handleSubmitButtonClicked}
            disabled={!!formRef.current?.isValid}
          />
          <Button variation={ButtonVariation.SECONDARY} text={getString('cancel')} onClick={closeDialog} />
        </Layout.Horizontal>
      }
    >
      <Formik<ItemVariationDialogFormValues>
        formName="ItemVariation"
        initialValues={{ items: initialItems, variation: selectedVariation?.identifier || '' }}
        enableReinitialize={true}
        onSubmit={handleSubmit}
        validationSchema={Yup.object().shape({
          items: Yup.array()
            .of(
              Yup.object().shape({
                value: Yup.string().oneOf(itemOptions.map(({ value }) => value as string)),
                label: Yup.string()
              })
            )
            .required(),
          variation: Yup.string()
            .oneOf(variations.map(({ identifier }) => identifier))
            .required()
        })}
      >
        {formikProps => {
          formRef.current = formikProps

          return (
            <FormikForm>
              <Container height={250}>
                <FormInput.MultiSelect
                  placeholder={itemPlaceholder}
                  name="items"
                  items={itemOptions}
                  multiSelectProps={{ allowCreatingNewItems: false }}
                  label={itemLabel}
                />
                <FormInput.Select
                  placeholder={getString('cf.pipeline.flagConfiguration.selectVariation')}
                  usePortal={true}
                  name="variation"
                  items={variationOptions}
                  label={getString('cf.pipeline.flagConfiguration.variationServed')}
                />
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
    </Dialog>
  )
}

export default ItemVariationDialog
