/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import * as Yup from 'yup'
import { get, isString } from 'lodash-es'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload,
  buildArtifactoryPayload,
  buildAWSPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { Scope } from '@common/interfaces/SecretsInterface'

export const AllowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket', 'Artifactory']
export type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | 'Artifactory' | 'Harness' | 'S3'

export const TerragruntAllowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket']

export const tfVarIcons: any = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket',
  Artifactory: 'service-artifactory',
  Harness: 'harness',
  S3: 'service-service-s3'
}

export const ConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: AllowedTypes[2] as ConnectorInfoDTO['type'],
  Bitbucket: Connectors.BITBUCKET,
  Artifactory: Connectors.ARTIFACTORY,
  S3: Connectors.AWS
}

export const ConnectorLabelMap: Record<ConnectorTypes, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'common.repo_provider.bitbucketLabel',
  Artifactory: 'connectors.artifactory.artifactoryLabel',
  Harness: 'harness',
  S3: 'pipeline.artifactsSelection.amazonS3Title'
}

export const getPath = (
  isTerraformPlan: boolean,
  isTerragruntPlan: boolean,
  isBackendConfig?: boolean,
  fieldPath?: string
): string => {
  if (isBackendConfig) {
    return isTerraformPlan || isTerragruntPlan
      ? `spec.${fieldPath}.backendConfig.spec`
      : `spec.${fieldPath}.spec.backendConfig.spec`
  } else {
    return isTerraformPlan || isTerragruntPlan ? `spec.${fieldPath}.configFiles` : `spec.${fieldPath}.spec.configFiles`
  }
}
export const getConfigFilePath = (configFile: any): string | undefined => {
  switch (configFile?.store?.type) {
    case Connectors.ARTIFACTORY:
      return isString(get(configFile, 'store.spec.artifactPaths'))
        ? get(configFile, 'store.spec.artifactPaths')
        : configFile?.store.spec.artifactPaths[0]
    case 'Harness':
      if (get(configFile, 'store.spec.files')) {
        return isString(get(configFile, 'store.spec.files'))
          ? get(configFile, 'store.spec.files')
          : get(configFile, 'store.spec.files[0]')
      }
      if (get(configFile, 'store.spec.secretFiles')) {
        return isString(get(configFile, 'store.spec.secretFiles'))
          ? get(configFile, 'store.spec.secretFiles')
          : get(configFile, 'store.spec.secretFiles[0]')
      }
      return undefined
    case 'S3':
      if (get(configFile, 'store.spec.paths')) {
        return isString(get(configFile, 'store.spec.paths'))
          ? get(configFile, 'store.spec.paths')
          : configFile?.store.spec.paths[0]
      }
      return get(configFile, 'store.spec.folderPath')
    default:
      return get(configFile, 'store.spec.folderPath')
  }
}

export const formInputNames = (path: string) => ({
  connectorRef: `${path}.store.spec.connectorRef`,
  repoName: `${path}.store.spec.repoName`,
  gitFetchType: `${path}.store.spec.gitFetchType`,
  branch: `${path}.store.spec.branch`,
  commitId: `${path}.store.spec.commitId`,
  folderPath: `${path}.store.spec.folderPath`,
  useConnectorCredentials: `${path}.moduleSource.useConnectorCredentials`
})

/* istanbul ignore next */
export const formikOnChangeNames = (path: string) => ({
  repoName: `${path}.store.spec.repoName`,
  branch: `${path}.store.spec.branch`,
  commitId: `${path}.store.spec.commitId`,
  folderPath: `${path}.store.spec.folderPath`,
  useConnectorCredentials: `${path}.moduleSource.useConnectorCredentials`
})

/* istanbul ignore next */
export const getBuildPayload = (type: ConnectorInfoDTO['type']) => {
  if (type === Connectors.GIT) {
    return buildGitPayload
  }
  if (type === Connectors.GITHUB) {
    return buildGithubPayload
  }
  if (type === Connectors.BITBUCKET) {
    return buildBitbucketPayload
  }
  if (type === Connectors.GITLAB) {
    return buildGitlabPayload
  }
  if (type === Connectors.ARTIFACTORY) {
    return buildArtifactoryPayload
  }
  if (type === Connectors.AWS) {
    return buildAWSPayload
  }
  return () => ({})
}

export const stepTwoValidationSchema = (
  isTerraformPlan: boolean,
  isTerragruntPlan: boolean,
  isBackendConfig: boolean,
  getString: any,
  fieldPath?: string
) => {
  if (isBackendConfig) {
    const configSetup = {
      backendConfig: Yup.object().shape({
        spec: Yup.object().shape({
          store: Yup.object().shape({
            spec: Yup.object().shape({
              gitFetchType: Yup.string().required(getString('cd.gitFetchTypeRequired')),
              branch: Yup.string().when('gitFetchType', {
                is: 'Branch',
                then: Yup.string().trim().required(getString('validation.branchName'))
              }),
              commitId: Yup.string().when('gitFetchType', {
                is: 'Commit',
                then: Yup.string().trim().required(getString('validation.commitId'))
              }),
              folderPath: Yup.string().required(getString('pipeline.manifestType.pathRequired'))
            })
          })
        })
      })
    }

    return isTerraformPlan || isTerragruntPlan
      ? Yup.object().shape({
          spec: Yup.object().shape({
            [`${fieldPath}`]: Yup.object().shape({
              ...configSetup
            })
          })
        })
      : Yup.object().shape({
          spec: Yup.object().shape({
            [`${fieldPath}`]: Yup.object().shape({
              spec: Yup.object().shape({
                ...configSetup
              })
            })
          })
        })
  } else {
    const configSetup = {
      configFiles: Yup.object().shape({
        store: Yup.object().shape({
          spec: Yup.object().shape({
            gitFetchType: Yup.string().required(getString('cd.gitFetchTypeRequired')),
            branch: Yup.string().when('gitFetchType', {
              is: 'Branch',
              then: Yup.string().trim().required(getString('validation.branchName'))
            }),
            commitId: Yup.string().when('gitFetchType', {
              is: 'Commit',
              then: Yup.string().trim().required(getString('validation.commitId'))
            }),
            folderPath: Yup.string().required(getString('pipeline.manifestType.pathRequired'))
          })
        })
      })
    }

    return isTerraformPlan || isTerragruntPlan
      ? Yup.object().shape({
          spec: Yup.object().shape({
            [`${fieldPath}`]: Yup.object().shape({
              ...configSetup
            })
          })
        })
      : Yup.object().shape({
          spec: Yup.object().shape({
            [`${fieldPath}`]: Yup.object().shape({
              spec: Yup.object().shape({
                ...configSetup
              })
            })
          })
        })
  }
}

export interface Connector {
  label: string
  value: string
  scope: Scope
  live: boolean
  connector: {
    type: string
    identifier: string
    name: string
    spec: { val: string; url: string; connectionType?: string; type?: string }
  }
}
