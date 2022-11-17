/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TagInputProps } from '@harness/uicore'
import type { ITagInputProps, IInputGroupProps } from '@blueprintjs/core'
import type { InputWithIdentifierProps } from '@harness/uicore/dist/components/InputWithIdentifier/InputWithIdentifier'
import type { FormikProps } from 'formik'

export interface DescriptionProps {
  placeholder?: string
  isOptional?: boolean
  disabled?: boolean
}
export interface DescriptionComponentProps {
  descriptionProps?: DescriptionProps
  hasValue?: boolean
  disabled?: boolean
  dataTooltipId?: string
}

export interface TagsProps {
  className?: string
}

export interface TagsComponentProps {
  tagsProps?: Partial<ITagInputProps>
  hasValue?: boolean
  isOptional?: boolean
  dataTooltipId?: string
}

export interface TagsDeprecatedComponentProps {
  hasValue?: boolean
}

export interface NameIdDescriptionTagsDeprecatedProps<T> {
  identifierProps?: Omit<InputWithIdentifierProps, 'formik'>
  descriptionProps?: DescriptionProps
  tagInputProps?: TagInputProps<T>
  formikProps: FormikProps<any>
  className?: string
}

export interface NameIdDescriptionProps {
  identifierProps?: Omit<InputWithIdentifierProps, 'formik'>
  inputGroupProps?: IInputGroupProps
  descriptionProps?: DescriptionProps
  className?: string
  formikProps: Omit<FormikProps<any>, 'tags'>
}
