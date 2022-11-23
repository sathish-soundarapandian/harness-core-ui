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
  buildArtifactoryPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'

export const AllowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket', 'Artifactory']
export type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | 'Artifactory' | 'Harness'

export const tfVarIcons: any = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket',
  Artifactory: 'service-artifactory',
  Harness: 'harness'
}

export const ConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: AllowedTypes[2] as ConnectorInfoDTO['type'],
  Bitbucket: Connectors.BITBUCKET,
  Artifactory: Connectors.ARTIFACTORY
}

export const ConnectorLabelMap: Record<ConnectorTypes, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel',
  Artifactory: 'connectors.artifactory.artifactoryLabel',
  Harness: 'harness'
}

export const getPath = (isTerraformPlan: boolean, isBackendConfig?: boolean): string => {
  if (isBackendConfig) {
    return isTerraformPlan ? 'spec.configuration.backendConfig.spec' : 'spec.configuration.spec.backendConfig.spec'
  } else {
    return isTerraformPlan ? 'spec.configuration.configFiles' : 'spec.configuration.spec.configFiles'
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
  folderPath: `formik.values.${path}.store.spec.folderPath`,
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
  return () => ({})
}

export const stepTwoValidationSchema = (isTerraformPlan: boolean, isBackendConfig: boolean, getString: any) => {
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

    return isTerraformPlan
      ? Yup.object().shape({
          spec: Yup.object().shape({
            configuration: Yup.object().shape({
              ...configSetup
            })
          })
        })
      : Yup.object().shape({
          spec: Yup.object().shape({
            configuration: Yup.object().shape({
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

    return isTerraformPlan
      ? Yup.object().shape({
          spec: Yup.object().shape({
            configuration: Yup.object().shape({
              ...configSetup
            })
          })
        })
      : Yup.object().shape({
          spec: Yup.object().shape({
            configuration: Yup.object().shape({
              spec: Yup.object().shape({
                ...configSetup
              })
            })
          })
        })
  }
}
