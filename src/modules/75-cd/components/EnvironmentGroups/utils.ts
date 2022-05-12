/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import type {
  EnvironmentGroupFilterProperties,
  EnvironmentGroupResponseDTO,
  GetEnvironmentGroupListQueryParams
} from 'services/cd-ng'

export function cleanData(values: EnvironmentGroupResponseDTO): EnvironmentGroupResponseDTO {
  const {
    name: prevName,
    identifier: prevIdentifier,
    description: prevDescription,
    tags,
    orgIdentifier,
    projectIdentifier,
    envIdentifiers
  } = values

  const name = prevName?.toString().trim()
  const identifier = prevIdentifier?.toString().trim()
  const description = prevDescription?.toString().trim()
  return {
    name,
    identifier,
    description,
    tags: defaultTo(tags, {}),
    orgIdentifier,
    projectIdentifier,
    envIdentifiers
  } as any
}

export enum SortFields {
  LastUpdatedAt = 'lastModifiedAt',
  AZ09 = 'AZ09',
  ZA90 = 'ZA90',
  Name = 'name'
}

export enum Sort {
  DESC = 'DESC',
  ASC = 'ASC'
}

export enum EnvironmentGroupDetailsTab {
  CONFIGURATION = 'CONFIGURATION',
  ENVIRONMENTS = 'ENVIRONMENTS'
}

export interface EnvironmentGroupListQueryParams
  extends Partial<
    Omit<GetEnvironmentGroupListQueryParams, 'sort' | 'getDefaultFromOtherRepo' | 'envGroupIdentifiers'>
  > {
  filters?: EnvironmentGroupFilterProperties
}
