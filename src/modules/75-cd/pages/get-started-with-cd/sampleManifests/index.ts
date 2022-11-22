/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const deploymentYaml = `{{- if .Values.env.config}}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{.Values.name}}
data:
{{.Values.env.config | toYaml | indent 2}}
---
{{- end}}

{{- if .Values.env.secrets}}
apiVersion: v1
kind: Secret
metadata:
  name: {{.Values.name}}
stringData:
{{.Values.env.secrets | toYaml | indent 2}}
---
{{- end}}

{{- if .Values.dockercfg}}
apiVersion: v1
kind: Secret
metadata:
  name: {{.Values.name}}-dockercfg
  annotations:
    harness.io/skip-versioning: "true"
data:
  .dockercfg: {{.Values.dockercfg}}
type: kubernetes.io/dockercfg
---
{{- end}}

apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{.Values.name}}-deployment
spec:
  replicas: {{int .Values.replicas}}
  selector:
    matchLabels:
      app: {{.Values.name}}
  template:
    metadata:
      labels:
        app: {{.Values.name}}
    spec:
      {{- if .Values.dockercfg}}
      imagePullSecrets:
      - name: {{.Values.name}}-dockercfg
      {{- end}}
      containers:
      - name: {{.Values.name}}
        image: {{.Values.image}}
        {{- if or .Values.env.config .Values.env.secrets}}
        envFrom:
        {{- if .Values.env.config}}
        - configMapRef:
            name: {{.Values.name}}
        {{- end}}
        {{- if .Values.env.secrets}}
        - secretRef:
            name: {{.Values.name}}
        {{- end}}
        {{- end}}`

const namespaceYaml = `{{- if .Values.createNamespace}}
apiVersion: v1
kind: Namespace
metadata:
  name: {{.Values.namespace}}
{{- end}}`

const serviceYaml = `apiVersion: v1
kind: Service
metadata:
  name: {{.Values.name}}-svc
spec:
  type: {{.Values.serviceType}}
  ports:
  - port: {{.Values.servicePort}}
    targetPort: {{.Values.serviceTargetPort}}
    protocol: TCP
  selector:
    app: {{.Values.name}}`

const valuesYaml = `name: harness-example
replicas: 1

image: <+artifact.image>
dockercfg: <+artifact.imagePullSecret>

createNamespace: true
namespace: <+infra.namespace>

# Service Type allow you to specify what kind of service you want.
# Possible values for ServiceVariableType are:
# ClusterIP | NodePort | LoadBalancer | ExternalName
serviceType: LoadBalancer

# A Service can map an incoming port to any targetPort.
# targetPort is where application is listening on inside the container.
servicePort: 80
serviceTargetPort: 80

# Specify all environment variables to be added to the container.
# The following two maps, config and secrets, are put into a ConfigMap
# and a Secret, respectively.
# Both are added to the container environment in podSpec as envFrom source.
env:
  config:
    key1: value1
  secrets:
    key2: value2`

export const manifestFileContents = {
  'deployment.yaml': deploymentYaml,
  'namespace.yaml': namespaceYaml,
  'service.yaml': serviceYaml,
  'values.yaml': valuesYaml
}
