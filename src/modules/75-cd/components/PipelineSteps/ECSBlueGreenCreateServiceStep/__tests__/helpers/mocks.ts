/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const elasticLoadBalancersResponse = {
  data: ['Load_Balancer_1', 'Load_Balancer_2', 'Load_Balancer_3'],
  status: 'SUCCESS'
}

export const listenersResponse = {
  data: {
    'HTTP 80': 'abc-def-ghi',
    'HTTP 81': 'abc-ghi-def'
  },
  status: 'SUCCESS'
}

export const listenerRulesList = ['Listener_Rule_1', 'Listener_Rule_2', 'Listener_Rule_3']
