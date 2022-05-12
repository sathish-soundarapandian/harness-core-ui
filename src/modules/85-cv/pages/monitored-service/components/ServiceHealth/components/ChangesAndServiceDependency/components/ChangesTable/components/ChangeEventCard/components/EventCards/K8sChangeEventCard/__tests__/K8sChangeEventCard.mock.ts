/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ChangeEventDTO } from 'services/cv'

export const mockK8sChangeResponse: ChangeEventDTO = {
  id: '7WLCRLoXTTeGyD37ZeXDjA',
  accountId: 'kmpySmUISimoRrJL6NL73w',
  orgIdentifier: 'default',
  projectIdentifier: 'k8sBugBash',
  serviceIdentifier: 'shaswat1',
  monitoredServiceIdentifier: 'monitored_service_identifier',
  serviceName: 'shaswat-1',
  envIdentifier: 'prod',
  environmentName: 'prod',
  name: 'Kubernetes ConfigMap event.',
  changeSourceIdentifier: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  eventTime: 1634248325628,
  metadata: {
    oldYaml:
      'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  annotations:\n    control-plane.alpha.kubernetes.io/leader: \'{"holderIdentity":"nginx-ingress-controller-fd6c8f756-6p46w","leaseDurationSeconds":30,"acquireTime":"2021-10-09T16:38:45Z","renewTime":"2021-10-14T21:51:58Z","leaderTransitions":272}\'\n  name: ingress-controller-leader-nginx\n  namespace: ingress-nginx\n  uid: 85376973-31b7-11e9-a7d6-4201ac100409\n',
    newYaml:
      'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  annotations:\n    control-plane.alpha.kubernetes.io/leader: \'{"holderIdentity":"nginx-ingress-controller-fd6c8f756-6p46w","leaseDurationSeconds":30,"acquireTime":"2021-10-09T16:38:45Z","renewTime":"2021-10-14T21:52:05Z","leaderTransitions":272}\'\n  name: ingress-controller-leader-nginx\n  namespace: ingress-nginx\n  uid: 85376973-31b7-11e9-a7d6-4201ac100409\n',
    timestamp: 1634248325.628,
    workload: 'ingress-controller-leader-nginx',
    namespace: 'ingress-nginx',
    kind: null,
    resourceType: 'ConfigMap',
    action: 'Update',
    reason: null,
    message: null,
    resourceVersion: null
  },
  category: 'Infrastructure',
  type: 'K8sCluster'
}
