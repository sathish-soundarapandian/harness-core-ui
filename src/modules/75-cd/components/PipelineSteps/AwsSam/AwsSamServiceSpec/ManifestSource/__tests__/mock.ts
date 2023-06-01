import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'

export const template = {
  manifests: [
    {
      manifest: {
        identifier: 'test_manifest',
        type: ManifestDataType.AwsSamDirectory,
        spec: {
          store: {
            type: 'Github',
            spec: {
              connectorRef: '<+input>',
              paths: '<+input>',
              repoName: '<+input>',
              branch: '<+input>'
            }
          },
          configOverridePath: '<+input>'
        }
      }
    }
  ],
  artifacts: {
    primary: {
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: '<+input>',
        artifactDirectory: '<+input>',
        artifactPath: '<+input>',
        repository: '<+input>'
      }
    }
  }
}

export const manifests = [
  {
    manifest: {
      identifier: 'test_manifest',
      type: ManifestDataType.AwsSamDirectory,
      spec: {
        store: {
          type: 'Github',
          spec: {
            connectorRef: '<+input>',
            gitFetchType: 'Branch',
            paths: '<+input>',
            repoName: '<+input>',
            branch: '<+input>'
          }
        },
        configOverridePath: '<+input>'
      }
    }
  }
]

export const initialValues = {
  manifests: [
    {
      manifest: {
        identifier: 'test_manifest',
        type: ManifestDataType.AwsSamDirectory,
        spec: {
          store: {
            type: 'Github',
            spec: {
              connectorRef: '',
              paths: '',
              repoName: '',
              branch: ''
            }
          },
          configOverridePath: ''
        }
      }
    }
  ],
  artifacts: {
    primary: {
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: '',
        artifactDirectory: '',
        artifactPath: '',
        repository: ''
      }
    }
  }
}

export const manifest = {
  identifier: 'test_manifest',
  type: ManifestDataType.AwsSamDirectory,
  spec: {
    store: {
      type: 'Github',
      spec: {
        connectorRef: '<+input>',
        gitFetchType: 'Branch',
        paths: '<+input>',
        repoName: '<+input>',
        branch: '<+input>'
      }
    },
    configOverridePath: '<+input>'
  }
}
