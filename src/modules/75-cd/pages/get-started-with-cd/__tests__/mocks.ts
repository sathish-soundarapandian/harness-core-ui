/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const delegateSizeResponse = {
  metaData: {},
  resource: [
    {
      size: 'LAPTOP',
      label: 'Laptop',
      replicas: 1,
      ram: 2048,
      cpu: 0.5
    },
    {
      size: 'SMALL',
      label: 'Small',
      replicas: 2,
      ram: 4096,
      cpu: 1
    },
    {
      size: 'MEDIUM',
      label: 'Medium',
      replicas: 4,
      ram: 8192,
      cpu: 2
    },
    {
      size: 'LARGE',
      label: 'Large',
      replicas: 8,
      ram: 16384,
      cpu: 4
    }
  ],
  responseMessages: []
}

export const delegateSizesFailResponse = {
  metaData: {},
  resource: [],
  responseMessages: [{ message: 'Failure' }]
}

export const delegateTokensResponse = {
  metaData: {},
  resource: [
    {
      uuid: null,
      accountId: 'px7xd_BFRCi-pfWPYXVjvw',
      name: 'default_token_default/Onboarding_Flow',
      createdBy: null,
      createdByNgUser: null,
      createdAt: 1660625029952,
      status: 'ACTIVE',
      value: null,
      ownerIdentifier: 'default/Onboarding_Flow'
    }
  ],
  responseMessages: []
}

export const delegateTokensFailedResponse = {
  metaData: {},
  resource: [],
  responseMessages: [
    {
      message: 'Something Went Wrong'
    }
  ]
}

export const validateKubernetesYamlResponse = {
  metaData: {},
  resource: {
    orgIdentifier: 'default',
    projectIdentifier: 'Onboarding_Flow',
    name: 'sample-vikrant-dsaa',
    description: '',
    size: 'LAPTOP',
    hostName: null,
    delegateConfigurationId: null,
    identifier: 'samplevikrantdsaa',
    k8sConfigDetails: {
      k8sPermissionType: 'CLUSTER_ADMIN',
      namespace: ''
    },
    tags: null,
    delegateType: 'KUBERNETES',
    tokenName: 'default_token_default/Onboarding_Flow'
  },
  responseMessages: []
}

export const onGenYamlResponse = `apiVersion: v1
kind: Namespace
metadata:
  name: harness-delegate-ng

---

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: harness-delegate-ng-cluster-admin
subjects:
  - kind: ServiceAccount
    name: default
    namespace: harness-delegate-ng
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io

---

apiVersion: v1
kind: Secret
metadata:
  name: sample-vikrant-dsaa-proxy
  namespace: harness-delegate-ng
type: Opaque
data:
  # Enter base64 encoded username and password, if needed
  PROXY_USER: ""
  PROXY_PASSWORD: ""

---

apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    harness.io/name: sample-vikrant-dsaa
  name: sample-vikrant-dsaa
  namespace: harness-delegate-ng
spec:
  replicas: 1
  podManagementPolicy: Parallel
  selector:
    matchLabels:
      harness.io/name: sample-vikrant-dsaa
  serviceName: ""
  template:
    metadata:
      labels:
        harness.io/name: sample-vikrant-dsaa
    spec:
      containers:
      - image: harness/delegate:latest
        imagePullPolicy: Always
        name: harness-delegate-instance
        ports:
          - containerPort: 8080
        resources:
          limits:
            cpu: "0.5"
            memory: "2048Mi"
          requests:
            cpu: "0.5"
            memory: "2048Mi"
        readinessProbe:
          exec:
            command:
              - test
              - -s
              - delegate.log
          initialDelaySeconds: 20
          periodSeconds: 10
        livenessProbe:
          exec:
            command:
              - bash
              - -c
              - '[[ -e /opt/harness-delegate/msg/data/watcher-data && $(($(date +%s000) - $(grep heartbeat /opt/harness-delegate/msg/data/watcher-data | cut -d ":" -f 2 | cut -d "," -f 1))) -lt 300000 ]]'
          initialDelaySeconds: 240
          periodSeconds: 10
          failureThreshold: 2
        env:
        - name: JAVA_OPTS
          value: "-Xms64M"
        - name: ACCOUNT_ID
          value: px7xd_BFRCi-pfWPYXVjvw
        - name: MANAGER_HOST_AND_PORT
          value: https://qa.harness.io
        - name: DEPLOY_MODE
          value: KUBERNETES
        - name: DELEGATE_NAME
          value: sample-vikrant-dsaa
        - name: DELEGATE_TYPE
          value: "KUBERNETES"
        - name: DELEGATE_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: INIT_SCRIPT
          value: ""
        - name: DELEGATE_DESCRIPTION
          value: ""
        - name: DELEGATE_TAGS
          value: ""
        - name: NEXT_GEN
          value: "true"
        - name: DELEGATE_TOKEN
          value: 0599b94c5d770ffc341eab0a8372ec51
        - name: WATCHER_STORAGE_URL
          value: https://qa.harness.io/public/qa/premium/watchers
        - name: WATCHER_CHECK_LOCATION
          value: current.version
        - name: DELEGATE_STORAGE_URL
          value: https://qa.harness.io
        - name: DELEGATE_CHECK_LOCATION
          value: delegateqa.txt
        - name: HELM_DESIRED_VERSION
          value: ""
        - name: CDN_URL
          value: "https://qa.harness.io"
        - name: REMOTE_WATCHER_URL_CDN
          value: "https://qa.harness.io/public/shared/watchers/builds"
        - name: JRE_VERSION
          value: 11.0.14
        - name: HELM3_PATH
          value: ""
        - name: HELM_PATH
          value: ""
        - name: KUSTOMIZE_PATH
          value: ""
        - name: KUBECTL_PATH
          value: ""
        - name: POLL_FOR_TASKS
          value: "false"
        - name: ENABLE_CE
          value: "false"
        - name: PROXY_HOST
          value: ""
        - name: PROXY_PORT
          value: ""
        - name: PROXY_SCHEME
          value: ""
        - name: NO_PROXY
          value: ""
        - name: PROXY_MANAGER
          value: "true"
        - name: PROXY_USER
          valueFrom:
            secretKeyRef:
              name: sample-vikrant-dsaa-proxy
              key: PROXY_USER
        - name: PROXY_PASSWORD
          valueFrom:
            secretKeyRef:
              name: sample-vikrant-dsaa-proxy
              key: PROXY_PASSWORD
        - name: GRPC_SERVICE_ENABLED
          value: "true"
        - name: GRPC_SERVICE_CONNECTOR_PORT
          value: "8080"
      restartPolicy: Always

---

apiVersion: v1
kind: Service
metadata:
  name: delegate-service
  namespace: harness-delegate-ng
spec:
  type: ClusterIP
  selector:
    harness.io/name: sample-vikrant-dsaa
  ports:
    - port: 8080
`

export const heartbeatWaitingResponse = {
  metaData: {},
  resource: {
    numberOfRegisteredDelegates: 0,
    numberOfConnectedDelegates: 0
  },
  responseMessages: []
}

export const heartbeatSuccessResponse = {
  metaData: {},
  resource: {
    numberOfRegisteredDelegates: 1,
    numberOfConnectedDelegates: 1
  },
  responseMessages: []
}

export const dockerYamlResponse = `version: "3.7"
services:
  harness-ng-delegate:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 2048M
    image: harness/delegate:latest
    environment:
      - ACCOUNT_ID=px7xd_BFRCi-pfWPYXVjvw
      - DELEGATE_TOKEN=0599b94c5d770ffc341eab0a8372ec51
      - MANAGER_HOST_AND_PORT=https://qa.harness.io
      - WATCHER_STORAGE_URL=https://qa.harness.io/public/qa/premium/watchers
      - WATCHER_CHECK_LOCATION=current.version
      - DELEGATE_STORAGE_URL=https://qa.harness.io
      - DELEGATE_CHECK_LOCATION=delegateqa.txt
      - CDN_URL=https://qa.harness.io
      - REMOTE_WATCHER_URL_CDN=https://qa.harness.io/public/shared/watchers/builds
      - DEPLOY_MODE=KUBERNETES
      - DELEGATE_NAME=sample-a2c7a54f-3cc8-44dc-a7fa-16721a1acc54-delegate
      - NEXT_GEN=true
      - DELEGATE_DESCRIPTION=
      - DELEGATE_TYPE=DOCKER
      - DELEGATE_TAGS=
      - PROXY_MANAGER=true
      - INIT_SCRIPT=echo "Docker delegate init script executed."
`
