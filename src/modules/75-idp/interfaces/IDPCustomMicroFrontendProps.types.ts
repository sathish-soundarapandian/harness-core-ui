/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { ConnectorReferenceFieldProps } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { ConnectedMultiTypeDelegateSelectorProps } from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { ConnectedMultiTypeSecretInputProps } from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { useGetUserGroupAggregateList } from 'services/cd-ng'

export interface IDPCustomMicroFrontendProps {
  idpServices: {
    useGetUserGroupAggregateList: typeof useGetUserGroupAggregateList
  }
  customComponents: {
    ConnectorReferenceField: React.ComponentType<ConnectorReferenceFieldProps>
    MultiTypeSecretInput: React.ComponentType<ConnectedMultiTypeSecretInputProps>
    MultiTypeDelegateSelector: React.ComponentType<ConnectedMultiTypeDelegateSelectorProps>
  }
  customHooks: {
    useQueryParams: typeof useQueryParams
    useUpdateQueryParams: typeof useUpdateQueryParams
  }
}
