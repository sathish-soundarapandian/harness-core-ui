/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, FormInput, Layout, TagInputProps, Text, tagsType } from '@harness/uicore'
import type { ITagInputProps } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import type { InputWithIdentifierProps } from '@harness/uicore/dist/components/InputWithIdentifier/InputWithIdentifier'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import i18n from './AddDescriptionAndTags.i18n'
import css from './AddDescriptionAndTags.module.scss'

export interface DescriptionAndTagsInputProps<T> {
  formComponent: JSX.Element
  tagInputProps?: TagInputProps<T>
  className?: string
  defaultOpenFields?: string[]
}

export interface FormikForAddDescriptionandKVTags {
  name: string
  identifier: string
  description?: string
  tags?: tagsType
}

export interface DescriptionAndKVTagsInputProps {
  formComponent: JSX.Element
  formikProps?: FormikProps<FormikForAddDescriptionandKVTags>
  className?: string
  forceOpenTags?: boolean
  tagsProps?: Partial<ITagInputProps>
}

export interface AddDescriptionAndTagsWithIdentifier {
  identifierProps: Omit<InputWithIdentifierProps, 'formik'>
  className?: string
  defaultOpenFields?: string[]
}

export interface AddDescription {
  identifierProps: Omit<InputWithIdentifierProps, 'formik'>
  className?: string
  formikProps?: FormikProps<FormikForAddDescriptionandKVTags>
}

export interface AddDescriptionAndKVTagsWithIdentifier {
  identifierProps: Omit<InputWithIdentifierProps, 'formik'>
  className?: string
  formikProps?: FormikProps<FormikForAddDescriptionandKVTags>
  forceOpenTags?: boolean
  tagsProps?: Partial<ITagInputProps>
}

interface FieldLabelWithHideOptionProps {
  onHide: () => void
  fieldLabel: string
}

interface FieldLabelWithRemoveOptionProps {
  onRemove: () => void
  fieldLabel: string
}

interface AddFieldOptionProps {
  onClick: () => void
  label: string
  isOpen: boolean
}

function FieldLabelWithHideOption(props: FieldLabelWithHideOptionProps): JSX.Element {
  const { onHide, fieldLabel } = props
  return (
    <Container className={css.headerRow}>
      <Text inline>{fieldLabel}</Text>
      <Text inline className={css.fieldToggleLabel} onClick={onHide} color={Color.PRIMARY_7}>
        {i18n.hideInput}
      </Text>
    </Container>
  )
}

function FieldLabelWithRemoveOption(props: FieldLabelWithRemoveOptionProps): JSX.Element {
  const { onRemove, fieldLabel } = props
  const { getString } = useStrings()
  return (
    <Container className={css.headerRow}>
      <Text inline>{fieldLabel}</Text>
      <Text inline className={css.fieldToggleLabel} onClick={onRemove} color={Color.PRIMARY_7}>
        {getString('removeLabel')}
      </Text>
    </Container>
  )
}

function AddFieldOption(props: AddFieldOptionProps): JSX.Element | null {
  const { onClick, label, isOpen } = props
  if (!isOpen) return null
  return (
    <Text className={css.fieldToggleLabel} onClick={onClick} color={Color.PRIMARY_7}>
      {label}
    </Text>
  )
}

// Deprecated
export function AddDescriptionAndTags<T>(props: DescriptionAndTagsInputProps<T>): JSX.Element {
  const { formComponent, className, defaultOpenFields = [] } = props
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(defaultOpenFields.includes('description'))
  const [isTagsOpen, setIsTagsOpen] = useState(defaultOpenFields.includes('tags'))
  return (
    <Container className={cx(css.main, className)}>
      <Container className={css.connectorFormNameWrapper}>
        <Container className={css.connectorFormNameElm}>{formComponent}</Container>
        {(!isDescriptionOpen || !isTagsOpen) && (
          <Layout.Vertical spacing="xsmall" style={{ justifyContent: 'center', marginLeft: 'var(--spacing-large)' }}>
            <AddFieldOption
              label={i18n.addDescriptionLabel}
              onClick={() => setIsDescriptionOpen(true)}
              isOpen={!isDescriptionOpen}
            />
            <AddFieldOption label={i18n.addTagsLabel} onClick={() => setIsTagsOpen(true)} isOpen={!isTagsOpen} />
          </Layout.Vertical>
        )}
      </Container>
      {isDescriptionOpen && (
        <FormInput.TextArea
          className={css.expandedDescription}
          name="description"
          label={
            <FieldLabelWithHideOption onHide={() => setIsDescriptionOpen(false)} fieldLabel={i18n.descriptionLabel} />
          }
        />
      )}
      {isTagsOpen && (
        <FormInput.TagInput
          name="tags"
          label={<FieldLabelWithHideOption onHide={() => setIsTagsOpen(false)} fieldLabel={i18n.tagsLabel} />}
          labelFor={name => (typeof name === 'string' ? name : '')}
          itemFromNewTag={newTag => newTag}
          items={[]}
          className="expandedTags"
          tagInputProps={{
            noInputBorder: true,
            openOnKeyDown: false,
            showAddTagButton: true,
            showClearAllButton: true,
            allowNewTag: true
          }}
        />
      )}
    </Container>
  )
}

export function AddDescriptionAndKVTags(props: DescriptionAndKVTagsInputProps): JSX.Element {
  const { formComponent, className, formikProps, tagsProps = {}, forceOpenTags = false } = props
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(
    formikProps?.values.description && formikProps.values.description.length > 0
  )
  const [isTagsOpen, setIsTagsOpen] = useState(
    (formikProps?.values.tags && Object.keys(formikProps.values.tags).length > 0) || forceOpenTags
  )

  React.useEffect(() => {
    setIsDescriptionOpen(formikProps?.values.description && formikProps.values.description.length > 0)
    setIsTagsOpen((formikProps?.values.tags && Object.keys(formikProps.values.tags).length > 0) || forceOpenTags)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikProps?.values?.description, formikProps?.values?.tags, forceOpenTags])
  return (
    <Container className={cx(css.main, className)}>
      <Container className={css.connectorFormNameWrapper}>
        <Container className={css.connectorFormNameElm}>{formComponent}</Container>
        {(!isDescriptionOpen || !isTagsOpen) && (
          <Layout.Vertical spacing="xsmall" style={{ justifyContent: 'center', marginLeft: 'var(--spacing-large)' }}>
            <AddFieldOption
              label={i18n.addDescriptionLabel}
              onClick={() => setIsDescriptionOpen(true)}
              isOpen={!isDescriptionOpen}
            />
            <AddFieldOption label={i18n.addTagsLabel} onClick={() => setIsTagsOpen(true)} isOpen={!isTagsOpen} />
          </Layout.Vertical>
        )}
      </Container>

      <Container className={css.connectorFormElm}>
        {isDescriptionOpen && (
          <FormInput.TextArea
            className={css.expandedDescription}
            name="description"
            label={
              <FieldLabelWithRemoveOption
                onRemove={() => {
                  setIsDescriptionOpen(false)
                  formikProps?.setFieldValue('description', '')
                }}
                fieldLabel={i18n.descriptionLabel}
              />
            }
          />
        )}
        {isTagsOpen && (
          <FormInput.KVTagInput
            tagsProps={tagsProps}
            name="tags"
            label={
              <FieldLabelWithRemoveOption
                onRemove={() => {
                  setIsTagsOpen(false)
                  formikProps?.setFieldValue('tags', {})
                }}
                fieldLabel={i18n.tagsLabel}
              />
            }
            className="expandedTags"
          />
        )}
      </Container>
    </Container>
  )
}

export function AddDescription(props: DescriptionAndKVTagsInputProps): JSX.Element {
  const { formComponent, className, formikProps } = props
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(
    formikProps?.values.description && formikProps.values.description.length > 0
  )

  React.useEffect(() => {
    setIsDescriptionOpen(formikProps?.values.description && formikProps.values.description.length > 0)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikProps?.values?.description])
  return (
    <Container className={cx(css.main, className)}>
      <Container className={css.connectorFormNameWrapper}>
        <Container className={css.connectorFormNameElm}>{formComponent}</Container>
        {!isDescriptionOpen && (
          <Layout.Vertical spacing="xsmall" style={{ justifyContent: 'center', marginLeft: 'var(--spacing-large)' }}>
            <AddFieldOption
              label={i18n.addDescriptionLabel}
              onClick={() => setIsDescriptionOpen(true)}
              isOpen={!isDescriptionOpen}
            />
          </Layout.Vertical>
        )}
      </Container>

      <Container className={css.connectorFormElm}>
        {isDescriptionOpen && (
          <FormInput.TextArea
            className={css.expandedDescription}
            name="description"
            label={
              <FieldLabelWithRemoveOption
                onRemove={() => {
                  setIsDescriptionOpen(false)
                  formikProps?.setFieldValue('description', '')
                }}
                fieldLabel={i18n.descriptionLabel}
              />
            }
          />
        )}
      </Container>
    </Container>
  )
}

export function AddDescriptionAndTagsWithIdentifier(props: AddDescriptionAndTagsWithIdentifier): JSX.Element {
  const { identifierProps, ...additionalProps } = props
  return (
    <AddDescriptionAndTags
      {...additionalProps}
      formComponent={<FormInput.InputWithIdentifier {...identifierProps} />}
    />
  )
}

export function AddDescriptionAndKVTagsWithIdentifier(props: AddDescriptionAndKVTagsWithIdentifier): JSX.Element {
  const { identifierProps, ...additionalProps } = props
  return (
    <AddDescriptionAndKVTags
      {...additionalProps}
      formComponent={<FormInput.InputWithIdentifier {...identifierProps} />}
    />
  )
}

export function AddDescriptionWithIdentifier(props: AddDescription): JSX.Element {
  const { identifierProps, ...additionalProps } = props
  return <AddDescription {...additionalProps} formComponent={<FormInput.InputWithIdentifier {...identifierProps} />} />
}
