/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import type { EnvironmentResponseDTO, ServiceResponseDTO } from 'services/cd-ng'

interface GetQueryParamsProps {
  params: { accountId: string; projectIdentifier?: string; orgIdentifier?: string }
  includeAccountAndOrgLevel?: boolean
}

interface GetScopedServiceEnvironmentOptionProps {
  scopedIdentifiers?: boolean
  content: EnvironmentResponseDTO[] | ServiceResponseDTO[]
}

export const getQueryParams = ({
  includeAccountAndOrgLevel,
  params
}: GetQueryParamsProps): GetQueryParamsProps['params'] =>
  includeAccountAndOrgLevel ? { accountId: params.accountId } : { ...params }

export const getScopedServiceEnvironmentOption = ({
  content,
  scopedIdentifiers
}: GetScopedServiceEnvironmentOptionProps): SelectOption[] => {
  const options = []
  for (const data of content) {
    const { identifier, name } = data || {}
    if (identifier && name) {
      let value = identifier
      if (scopedIdentifiers) {
        value = getScopedValueFromDTO(data)
      }
      options.push({
        label: name,
        value
      })
    }
  }
  return options
}
