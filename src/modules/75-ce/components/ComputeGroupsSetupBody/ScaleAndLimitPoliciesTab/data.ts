/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const sizes = [
  'nano',
  'micro',
  'small',
  'medium',
  'large',
  'xlarge',
  '2xlarge',
  '4xlarge',
  '8xlarge',
  '12xlarge',
  '16xlarge',
  '24xlarge',
  '32xlarge',
  '48xlarge',
  'metal'
]

export const generalPurposeInstances = {
  // mac: ['nano', 'micro'],
  t4g: ['nano', 'micro', 'small', 'medium', 'large', 'xlarge', '2xlarge'],
  t3: ['nano', 'micro', 'small', 'medium', 'large', 'xlarge', '2xlarge'],
  t3a: ['nano', 'micro', 'small', 'medium', 'large', 'xlarge', '2xlarge'],
  t2: ['nano', 'micro', 'small', 'medium', 'large', 'xlarge', '2xlarge'],
  m6g: ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', 'metal'],
  m6gd: ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', 'metal'],
  m6i: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', 'metal'],
  m6id: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', 'metal'],
  m6a: [
    'large',
    'xlarge',
    '2xlarge',
    '4xlarge',
    '8xlarge',
    '12xlarge',
    '16xlarge',
    '24xlarge',
    '32xlarge',
    '48xlarge',
    'metal'
  ],
  m5: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', 'metal'],
  m5d: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', 'metal'],
  m5a: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  m5ad: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  m5dn: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', 'metal'],
  m5n: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', 'metal'],
  m5zn: ['large', 'xlarge', '2xlarge', '3xlarge', '6xlarge', '12xlarge', 'metal'],
  m4: ['large', 'xlarge', '2xlarge', '4xlarge', '10xlarge', '16xlarge'],
  a1: ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', 'metal']
}

export const computeOptimisedInstances = {
  c7g: ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  c6g: ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', 'metal'],
  c6gd: ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', 'metal'],
  c6gn: ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  c6i: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', 'metal'],
  c6id: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', 'metal'],
  c6a: [
    'large',
    'xlarge',
    '2xlarge',
    '4xlarge',
    '8xlarge',
    '12xlarge',
    '16xlarge',
    '24xlarge',
    '32xlarge',
    '48xlarge',
    'metal'
  ],
  Hpc6a: ['48xlarge'],
  c5: ['large', 'xlarge', '2xlarge', '4xlarge', '9xlarge', '12xlarge', '18xlarge', '24xlarge', 'metal'],
  c5d: ['large', 'xlarge', '2xlarge', '4xlarge', '9xlarge', '12xlarge', '18xlarge', '24xlarge', 'metal'],
  c5a: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  c5ad: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  c5n: ['large', 'xlarge', '2xlarge', '4xlarge', '9xlarge', '18xlarge', 'metal'],
  c4: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge']
}

export const memoryOptimisedInstances = {
  r6a: [
    'large',
    'xlarge',
    '2xlarge',
    '4xlarge',
    '8xlarge',
    '12xlarge',
    '16xlarge',
    '24xlarge',
    '32xlarge',
    '48xlarge',
    'metal'
  ],
  r6g: ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', 'metal'],
  r6i: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', 'metal']
}
