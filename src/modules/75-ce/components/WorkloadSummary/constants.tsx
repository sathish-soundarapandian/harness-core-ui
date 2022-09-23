/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { String } from 'framework/strings'
import { CCM_PAGE_TYPE } from '@ce/types'

const cpuAllocatableFormatter: (val: string) => string = val => `${val} vCPU`
const memoryAllocatableFormatter: (val: string) => string = val => `${val} GB`

const formatToDateTime: (val: string) => string = val => (val ? moment.utc(val).format(`MMM DD, YYYY hh:mm a`) : '-')

const OVERVIEW_FIELD: Record<
  string,
  {
    key: string
    name: React.ReactNode
    formatter?: (val: string) => string
  }
> = {
  WORKLOAD_NAME: {
    key: 'workloadName',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.workload" />
  },
  NAMESPACE: {
    key: 'namespace',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.namespace" />
  },
  WORKLOAD_TYPE: {
    key: 'workloadType',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.workloadType" />
  },
  CLUSTER_NAME: {
    key: 'clusterName',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.clusterName" />
  },
  NODE_NAME: {
    key: 'name',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.node" />
  },
  CREATE_TIME: {
    key: 'createTime',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.createTime" />,
    formatter: formatToDateTime
  },
  DELETE_TIME: {
    key: 'deleteTime',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.deleteTime" />,
    formatter: formatToDateTime
  },
  MACHINE_TYPE: {
    key: 'machineType',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.machineType" />
  },
  NODE_POOL_NAME: {
    key: 'nodePoolName',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.nodepoolName" />
  },
  CPU_ALLOCATABLE: {
    key: 'cpuAllocatable',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.cpuAllocatable" />,
    formatter: cpuAllocatableFormatter
  },
  MEMORY_ALLOCATABLE: {
    key: 'memoryAllocatable',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.memoryAllocatable" />,
    formatter: memoryAllocatableFormatter
  },
  INSTANCE_CATEGORY: {
    key: 'instanceCategory',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.instanceCategory" />
  },
  CPU_UNIT_PRICE: {
    key: 'cpuUnitPrice',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.cpuUnitPrice" />
  },
  MEMORY_UNIT_PRICE: {
    key: 'memoryUnitPrice',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.memoryUnitPrice" />
  },
  POD_CAPACITY: {
    key: 'podCapacity',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.podCapacity" />
  },
  SERVICE_NAME: {
    key: 'cloudServiceName',
    name: <String stringID="common.serviceName" />
  },
  LAUNCH_TYPE: {
    key: 'launchType',
    name: <String stringID="ce.serviceDetails.launchType" />
  }
}

const WORKLOAD_OVERVIEW_FIELD = [
  [OVERVIEW_FIELD.WORKLOAD_NAME, OVERVIEW_FIELD.NAMESPACE, OVERVIEW_FIELD.WORKLOAD_TYPE, OVERVIEW_FIELD.CLUSTER_NAME]
]

const SERVICE_OVERVIEW_FIELD = [[OVERVIEW_FIELD.SERVICE_NAME, OVERVIEW_FIELD.LAUNCH_TYPE, OVERVIEW_FIELD.CLUSTER_NAME]]

const NODE_OVERVIEW_FIELDS = [
  [
    OVERVIEW_FIELD.NODE_NAME,
    OVERVIEW_FIELD.NODE_POOL_NAME,
    OVERVIEW_FIELD.CLUSTER_NAME,
    OVERVIEW_FIELD.CREATE_TIME,
    OVERVIEW_FIELD.DELETE_TIME
  ],
  [
    OVERVIEW_FIELD.MACHINE_TYPE,
    OVERVIEW_FIELD.CPU_ALLOCATABLE,
    OVERVIEW_FIELD.MEMORY_ALLOCATABLE,
    OVERVIEW_FIELD.INSTANCE_CATEGORY,
    OVERVIEW_FIELD.POD_CAPACITY
  ]
]

export const OVERVIEW_FIELD_MAPPER = {
  [CCM_PAGE_TYPE.Workload]: WORKLOAD_OVERVIEW_FIELD,
  [CCM_PAGE_TYPE.Node]: NODE_OVERVIEW_FIELDS,
  [CCM_PAGE_TYPE.Service]: SERVICE_OVERVIEW_FIELD
}
