/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum CCE_VIEWS {
  CLUSTER = 'CLUSTER',
  AWS = 'AWS',
  GCP = 'GCP',
  AZURE = 'AZURE'
}

export const FIELD_TO_ICON_MAPPING: Record<string, string> = {
  [CCE_VIEWS.CLUSTER]: 'blue-black-cluster',
  [CCE_VIEWS.AWS]: 'service-aws',
  [CCE_VIEWS.GCP]: 'gcp',
  [CCE_VIEWS.AZURE]: 'service-azure'
}

export enum Operator {
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  ONE_OF = 'ONE_OF',
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  NULL = 'NULL',
  NOT_NULL = 'NOT_NULL'
}

export enum CommonFieldIds {
  Region = 'region',
  Product = 'product',
  CloudProvider = 'cloudProvider',
  Label = 'label',
  None = 'none'
}
