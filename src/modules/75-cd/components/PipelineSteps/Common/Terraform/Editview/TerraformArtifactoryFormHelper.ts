/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import * as Yup from 'yup'
import { cloneDeep, unset, size, isUndefined, set, get } from 'lodash-es'
import { IdentifierSchema } from '@common/utils/Validation'
import { TerraformStoreTypes, PathInterface } from '../TerraformInterfaces'

const formatPaths = (paths: any) => {
  return getMultiTypeFromValue(paths) === MultiTypeInputType.RUNTIME
    ? paths
    : paths.map((item: string) => ({ path: item }))
}

export const formatInitialValues = (
  isConfig: boolean,
  isBackendConfig: boolean,
  prevStepData: any,
  isTerraformPlan: boolean
) => {
  if (isBackendConfig && isTerraformPlan) {
    return {
      spec: {
        configuration: {
          backendConfig: {
            spec: {
              store: {
                spec: {
                  repositoryName:
                    prevStepData?.formValues?.spec?.configuration?.backendConfig?.spec?.store?.spec?.repositoryName ||
                    '',
                  artifactPaths: formatPaths(
                    prevStepData?.formValues?.spec?.configuration?.backendConfig?.spec?.store?.spec?.artifactPaths || [
                      ''
                    ]
                  )
                }
              }
            }
          }
        }
      }
    }
  }

  if (isBackendConfig) {
    return {
      spec: {
        configuration: {
          backendConfig: {
            spec: {
              store: {
                spec: {
                  repositoryName:
                    prevStepData?.formValues?.spec?.configuration?.spec?.backendConfig?.spec?.store?.spec
                      ?.repositoryName || '',
                  artifactPaths: formatPaths(
                    prevStepData?.formValues?.spec?.configuration?.spec?.backendConfig?.spec?.store?.spec
                      ?.artifactPaths || ['']
                  )
                }
              }
            }
          }
        }
      }
    }
  }
  if (isConfig && isTerraformPlan) {
    return {
      spec: {
        configuration: {
          configFiles: {
            store: {
              spec: {
                repositoryName:
                  prevStepData?.formValues?.spec?.configuration?.configFiles?.store?.spec?.repositoryName || '',
                artifactPaths: formatPaths(
                  prevStepData?.formValues?.spec?.configuration?.configFiles?.store?.spec?.artifactPaths || ['']
                )
              }
            }
          }
        }
      }
    }
  }

  if (isConfig) {
    return {
      spec: {
        configuration: {
          configFiles: {
            store: {
              spec: {
                repositoryName:
                  prevStepData?.formValues?.spec?.configuration?.spec?.configFiles?.store?.spec?.repositoryName || '',
                artifactPaths: formatPaths(
                  prevStepData?.formValues?.spec?.configuration?.spec?.configFiles?.store?.spec?.artifactPaths || ['']
                )
              }
            }
          }
        }
      }
    }
  }

  return {
    varFile: {
      identifier: prevStepData?.varFile?.identifier || '',
      type: TerraformStoreTypes.Remote,
      spec: {
        store: {
          spec: {
            repositoryName: prevStepData?.varFile?.spec?.store?.spec?.repositoryName || '',
            artifactPaths: formatPaths(prevStepData?.varFile?.spec?.store?.spec?.artifactPaths || [''])
          }
        }
      }
    }
  }
}

export const getConnectorRef = (
  isConfig: boolean,
  isBackendConfig: boolean,
  isTerraformPlan: boolean,
  prevStepData: any
) => {
  let connectorValue
  if (isConfig && isTerraformPlan) {
    connectorValue = prevStepData?.formValues.spec?.configuration?.configFiles?.store?.spec?.connectorRef
  } else if (isConfig) {
    connectorValue = prevStepData?.formValues?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
  } else if (isBackendConfig && isTerraformPlan) {
    connectorValue = prevStepData?.formValues.spec?.configuration?.backendConfig?.spec?.store?.spec?.connectorRef
  } else if (isBackendConfig) {
    connectorValue = prevStepData?.formValues?.spec?.configuration?.spec?.backendConfig?.spec?.store?.spec?.connectorRef
  } else connectorValue = prevStepData?.varFile?.spec?.store?.spec?.connectorRef

  if (size(prevStepData) > 5) {
    return prevStepData?.identifier
  }

  if (!isUndefined(connectorValue?.value)) {
    return connectorValue.value
  }

  return connectorValue
}

export const terraformArtifactorySchema = (isConfig: boolean, isBackendConfig: boolean, getString: any) => {
  const artifacts = {
    repositoryName: Yup.string().required(getString('cd.artifactFormErrors.repositoryName')),
    artifactPaths: Yup.lazy((value): Yup.Schema<unknown> => {
      if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
        return Yup.array().of(
          Yup.object().shape({
            path: Yup.string().min(1).required(getString('cd.pathCannotBeEmpty'))
          })
        )
      }
      return Yup.string().required(getString('cd.pathCannotBeEmpty'))
    })
  }

  if (isConfig) {
    const configSetup = {
      configFiles: Yup.object().shape({
        store: Yup.object().shape({
          spec: Yup.object().shape({
            ...artifacts
          })
        })
      })
    }

    return Yup.object().shape({
      spec: Yup.object().shape({
        configuration: Yup.object().shape({
          ...configSetup
        })
      })
    })
  }

  if (isBackendConfig) {
    const configSetup = {
      backendConfig: Yup.object().shape({
        spec: Yup.object().shape({
          store: Yup.object().shape({
            spec: Yup.object().shape({
              ...artifacts
            })
          })
        })
      })
    }

    return Yup.object().shape({
      spec: Yup.object().shape({
        configuration: Yup.object().shape({
          ...configSetup
        })
      })
    })
  }

  return Yup.object().shape({
    varFile: Yup.object().shape({
      identifier: IdentifierSchema(),
      spec: Yup.object().shape({
        store: Yup.object().shape({
          spec: Yup.object().shape({
            ...artifacts
          })
        })
      })
    })
  })
}

export const tfArtifactoryFormInputNames = (isConfig: boolean, isBackendConfig: boolean) => {
  if (isConfig) {
    return {
      repositoryName: 'spec.configuration.configFiles.store.spec.repositoryName',
      artifactPaths: 'spec.configuration.configFiles.store.spec.artifactPaths'
    }
  }

  if (isBackendConfig) {
    return {
      repositoryName: 'spec.configuration.backendConfig.spec.store.spec.repositoryName',
      artifactPaths: 'spec.configuration.backendConfig.spec.store.spec.artifactPaths'
    }
  }

  return {
    repositoryName: 'varFile.spec.store.spec.repositoryName',
    artifactPaths: 'varFile.spec.store.spec.artifactPaths'
  }
}
/* istanbul ignore next */
export const formatOnSubmitData = (values: any, prevStepData: any, connectorValue: any) => {
  const payload = {
    ...values,
    connectorRef: connectorValue
  }
  let artifacts = []
  if (getMultiTypeFromValue(payload.varFile.spec?.store?.spec.artifactPaths) === MultiTypeInputType.FIXED) {
    artifacts = payload.varFile.spec?.store?.spec.artifactPaths.map((item: PathInterface) => item.path)
  } else {
    artifacts = payload.varFile.spec?.store?.spec.artifactPaths
  }

  return {
    varFile: {
      type: payload.varFile.type,
      identifier: payload.varFile.identifier,
      spec: {
        store: {
          type: payload.connectorRef?.connector?.type || prevStepData?.selectedType,
          spec: {
            ...payload.varFile.spec?.store?.spec,
            artifactPaths: artifacts,
            connectorRef: payload.connectorRef
          }
        }
      }
    }
  }
}
/* istanbul ignore next */
export const formatArtifactoryData = (prevStepData: any, data: any, configObject: any, formik: any, path: string) => {
  if (prevStepData.identifier && prevStepData.identifier !== data?.identifier) {
    set(configObject, 'store.spec.connectorRef', prevStepData?.identifier)
  }

  if (configObject?.store?.spec?.gitFetchType) {
    unset(configObject?.store?.spec, 'commitId')
    unset(configObject?.store?.spec, 'gitFetchType')
    unset(configObject?.store?.spec, 'branch')
    unset(configObject?.store?.spec, 'folderPath')
    unset(configObject?.store?.spec, 'repoName')
  }

  if (configObject?.store?.spec?.files) {
    unset(configObject?.store?.spec, 'files')
  }

  if (configObject?.store?.spec?.secretFiles) {
    unset(configObject?.store?.spec, 'secretFiles')
  }

  const configFiles = get(data, `${path}.store.spec`)
  if (getMultiTypeFromValue(configFiles.artifactPaths) === MultiTypeInputType.FIXED) {
    configObject.store.spec.artifactPaths = configFiles.artifactPaths.map((item: PathInterface) => item.path)
  } else {
    configObject.store.spec.artifactPaths = configFiles.artifactPaths
  }
  configObject.store.spec.repositoryName = configFiles.repositoryName

  const valObj = cloneDeep(formik.values)
  configObject.store.type = prevStepData?.selectedType

  return valObj
}

export const getStore = (isTerraformPlan: boolean, isConfig: boolean, prevStepData: any) => {
  if (isTerraformPlan && isConfig) {
    return prevStepData.formValues?.spec?.configuration?.configFiles?.store
  }

  if (isConfig) {
    return prevStepData.formValues?.spec?.configuration?.spec?.configFiles?.store
  }

  return prevStepData?.varFile?.spec?.store
}
