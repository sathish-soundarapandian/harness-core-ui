/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const ManualK8s = {
  description: 'This description is for K8s',
  identifier: 'k8sId',
  name: 'K8sName',
  type: 'K8sCluster',
  tags: {},
  spec: {
    credential: {
      type: 'ManualConfig',
      spec: {
        masterUrl: 'master url',
        auth: {
          type: 'UsernamePassword',
          spec: {
            passwordRef: 'account.secretname',
            username: 'user name'
          }
        }
      }
    }
  }
}

export const K8WithInheritFromDelegate = {
  name: 'k8 With Tags',
  identifier: 'k8WithTags',
  description: 'asasas',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: { connectot: 'dx' },
  type: 'K8sCluster',
  spec: { credential: { type: 'InheritFromDelegate', spec: { delegateSelectors: ['primary'] } } }
}

export const GitHttp = {
  description: 'This description is for Git',
  identifier: 'GitHttpId',
  name: 'GitHttpName',
  type: 'Git',
  tags: { tag1: '' },
  spec: {
    connectionType: 'REPO',
    type: 'Http',
    url: 'url',
    spec: {
      passwordRef: 'account.secretname',
      username: 'user name'
    }
  }
}

export const Docker = {
  description: 'This description is for Docker',
  identifier: 'DockerId',
  name: 'DockerName',
  type: 'DockerRegistry',
  tags: { tag1: '' },
  spec: {
    dockerRegistryUrl: 'docker Registry url',
    auth: {
      type: 'UsernamePassword',
      spec: {
        passwordRef: 'account.secretname',
        username: 'user name'
      }
    }
  }
}
export const ActiveDocker = {
  description: 'This description is for Docker',
  identifier: 'DockerId',
  name: 'DockerName',
  type: '"DockerRegistry"',
  tags: { tag1: '' },
  spec: {
    dockerRegistryUrl: 'docker Registry url',
    auth: {
      type: 'UsernamePassword',
      spec: {
        passwordRef: 'account.secretname',
        username: 'user name'
      }
    }
  }
}

export const Vault = {
  description: 'This description is for Vault',
  identifier: 'VaultId',
  name: 'VaultName',
  type: 'Vault',
  tags: { tag1: '' },
  spec: {
    default: false
  }
}

export const GCP = {
  name: 'GCP for demo',
  identifier: 'GCP_for_demo',
  description: 'Details',
  tags: { GCP: '', demo: '' },
  type: 'Gcp',
  spec: { credential: { type: 'ManualConfig', spec: { secretKeyRef: 'account.GCP' } } }
}
export const AWS = {
  name: 'AWS demo',
  identifier: 'AWS_demo',
  description: 'connector description',
  tags: { demo: '', test: '' },
  type: 'Aws',
  spec: {
    credential: {
      crossAccountAccess: { crossAccountRoleArn: 'dummyRoleARN', externalId: '12345' },
      type: 'InheritFromDelegate',
      spec: { delegateSelector: 'primary' }
    }
  }
}
export const Nexus = {
  name: 'Nexus one',
  identifier: 'Nexus_one',
  description: 'testing nexus connector',
  tags: {},
  type: 'Nexus',
  spec: {
    nexusServerUrl: 'https://nexus2.harness.io',
    version: '3.x',
    auth: { type: 'UsernamePassword', spec: { username: 'dev', passwordRef: 'account.NexusPassword' } }
  }
}
export const Artifactory = {
  name: 'Artifacory One',
  identifier: 'Artifacory_One',
  description: '',
  tags: {},
  type: 'Artifactory',
  spec: {
    artifactoryServerUrl: 'https://test-repo.blackducksoftware.com/artifactory/',
    auth: {
      type: 'UsernamePassword',
      spec: { username: 'harness-dev', passwordRef: 'account.connectorSecret' }
    }
  }
}
