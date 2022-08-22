/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DelegateSelector } from 'services/portal'

export const listContainsTag = (tags: DelegateSelector[], findTag: DelegateSelector): boolean => {
  return tags.some((tagItem: DelegateSelector) => tagItem.name === findTag.name)
}

export const addTagToList = (tags: DelegateSelector[], tag: DelegateSelector) => {
  return [...tags, tag]
}

export const removeTagFromList = (tags: DelegateSelector[], tag: DelegateSelector) => {
  return tags.filter(tagItem => tagItem !== tag)
}

export const addTagIfNeeded = (
  tags: DelegateSelector[],
  createdTags: DelegateSelector[],
  tag: DelegateSelector
): { updatedCreatedTags: DelegateSelector[] } => {
  const isNewlyCreatedTag = !listContainsTag(tags, tag)
  return {
    updatedCreatedTags: isNewlyCreatedTag ? addTagToList(createdTags, tag) : createdTags
  }
}

export const removeTagIfNeeded = (
  createdTags: DelegateSelector[],
  tag: DelegateSelector
): { updatedCreatedTags: DelegateSelector[] } => {
  const wasNewlyCreatedTag = listContainsTag(createdTags, tag)
  return {
    updatedCreatedTags: wasNewlyCreatedTag ? removeTagFromList(createdTags, tag) : createdTags
  }
}
