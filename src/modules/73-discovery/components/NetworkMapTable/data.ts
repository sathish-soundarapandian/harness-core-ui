/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { NetworkMapListDTO } from './NetworkMapTable'

// To be removed after API integration
export const dummydata: Array<NetworkMapListDTO> = [
  {
    name: 'Kubernetes Cluster 1',
    id: 1234567,
    clusterName: 'Cluster 1',
    connectorName: 'My Connector 1',
    totalService: 10,
    enabled: true,
    lastUpdatedAt: 1684268786549,
    lastUpdatedBy: 'Amit Das',
    connected: true,
    services: {
      services: [
        {
          name: 'Login Service',
          namespace: 'litmus',
          resources: {
            pods: 10,
            workloads: 22,
            connections: 3
          },
          ipAddress: 'http://34.170.79.85',
          portNumber: 9091
        },
        {
          name: 'Cart services',
          namespace: 'litmus',
          resources: {
            pods: 10,
            workloads: 22,
            connections: 3
          },
          ipAddress: 'http://34.170.79.85',
          portNumber: 9091
        },
        {
          name: 'Payment services',
          namespace: 'litmus',
          resources: {
            pods: 10,
            workloads: 22
          },
          ipAddress: 'http://34.170.79.85',
          portNumber: 9091
        },
        {
          name: 'Frontend',
          namespace: 'litmus',
          resources: {
            pods: 10,
            workloads: 22
          },
          ipAddress: 'http://34.170.79.85',
          portNumber: 9091
        }
      ]
    }
  },
  {
    name: 'Kubernetes Cluster 2',
    id: 1234578,
    clusterName: 'Cluster 1',
    connectorName: 'My Connector 1',
    totalService: 24,
    enabled: false,
    lastUpdatedAt: 1684268786549,
    lastUpdatedBy: 'Amit Das',
    connected: false,
    services: {
      services: [
        {
          name: 'Login Service',
          namespace: 'litmus',
          resources: {
            pods: 10,
            workloads: 22
          },
          ipAddress: 'http://34.170.79.85',
          portNumber: 9091
        },
        {
          name: 'Cart services',
          namespace: 'litmus',
          resources: {
            pods: 10,
            workloads: 22,
            connections: 3
          },
          ipAddress: 'http://34.170.79.85',
          portNumber: 9091
        },
        {
          name: 'Payment services',
          namespace: 'litmus',
          resources: {
            pods: 10,
            workloads: 22
          },
          ipAddress: 'http://34.170.79.85',
          portNumber: 9091
        },
        {
          name: 'Frontend',
          namespace: 'litmus',
          resources: {
            pods: 10,
            workloads: 22,
            connections: 3
          },
          ipAddress: 'http://34.170.79.85',
          portNumber: 9091
        }
      ]
    }
  }
]
