import { cloneDeep, get, isEmpty, isUndefined, set, unset } from 'lodash-es'
import * as Yup from 'yup'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { checkIfQueryParamsisNotEmpty } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'
import type { UseStringsReturn } from 'framework/strings'
import type {
  TerraformCloudCliPlanExecutionData,
  TerraformCloudCliStepConfiguration,
  TerraformPlanExecutionData,
  TerraformStepConfiguration
} from 'services/cd-ng'
import { PathInterface, TerraformStoreTypes } from '../../Terraform/TerraformInterfaces'

export interface AmazonS3StoreDataType {
  varFile?: {
    identifier: string
    type: string
    spec: {
      store: {
        type: string
        spec: {
          region: string
          bucketName: string
          paths?: PathInterface[]
          folderPath?: string
        }
      }
    }
  }
  spec?: {
    configuration?: TerraformStepConfiguration | TerraformPlanExecutionData
    cloudCliConfiguration?: TerraformCloudCliStepConfiguration | TerraformCloudCliPlanExecutionData
  }
}

export const getFieldPathName = (specFieldPath?: string, isConfig?: boolean, isBackendConfig?: boolean): string => {
  if (isConfig) return `${specFieldPath}.configFiles.store.spec`
  else if (isBackendConfig) return `${specFieldPath}.backendConfig.spec.store.spec`
  else return `varFile.spec.store.spec`
}

export const getConnectorRef = (
  prevStepData: any,
  specFieldPath?: string,
  isConfig?: boolean,
  isBackendConfig?: boolean
): string => {
  let connectorValue
  if (isConfig) {
    connectorValue = get(prevStepData?.formValues, `${specFieldPath}.configFiles.store.spec.connectorRef`)
  } else if (isBackendConfig) {
    connectorValue = get(prevStepData?.formValues, `${specFieldPath}.backendConfig.spec.store.spec.connectorRef`)
  } else connectorValue = prevStepData?.varFile?.spec?.store?.spec?.connectorRef

  if (!isUndefined(connectorValue?.value)) {
    return connectorValue.value
  }
  return connectorValue
}

const formatPaths = (paths: string | PathInterface) => {
  return typeof paths === 'string' ? paths : paths?.map((path: string) => ({ path, uuid: uuid(path, nameSpace()) }))
}

export const formatInitialValues = (
  prevStepData: any,
  specFieldPath?: string,
  fieldPath?: string,
  isConfig?: boolean,
  isBackendConfig?: boolean,
  isTerraformPlan?: boolean
) => {
  const backendSpecData = {
    backendConfig: {
      spec: {
        store: {
          type: 'S3',
          spec: {
            bucketName: get(prevStepData?.formValues, `${specFieldPath}.backendConfig.spec.store.spec.bucketName`, ''),
            region: get(prevStepData?.formValues, `${specFieldPath}.backendConfig.spec.store.spec.region`, ''),
            paths: formatPaths(
              get(prevStepData?.formValues, `${specFieldPath}.backendConfig.spec.store.spec.paths`, [''])
            )
          }
        }
      }
    }
  }

  if (isBackendConfig) {
    if (isTerraformPlan) {
      return {
        spec: {
          [`${fieldPath}`]: {
            ...backendSpecData
          }
        }
      }
    }
    return {
      spec: {
        [`${fieldPath}`]: {
          spec: {
            ...backendSpecData
          }
        }
      }
    }
  }

  const configSpecData = {
    configFiles: {
      store: {
        type: 'S3',
        spec: {
          bucketName: get(prevStepData?.formValues, `${specFieldPath}.configFiles.store.spec.bucketName`, ''),
          region: get(prevStepData?.formValues, `${specFieldPath}.configFiles.store.spec.region`, ''),
          folderPath: get(prevStepData?.formValues, `${specFieldPath}.configFiles.store.spec.folderPath`, '')
        }
      }
    }
  }
  if (isConfig) {
    if (isTerraformPlan) {
      return {
        spec: {
          [`${fieldPath}`]: {
            ...configSpecData
          }
        }
      }
    }
    return {
      spec: {
        [`${fieldPath}`]: {
          spec: {
            ...configSpecData
          }
        }
      }
    }
  }

  return {
    varFile: {
      identifier: prevStepData?.varFile?.identifier,
      type: TerraformStoreTypes.Remote,
      spec: {
        store: {
          type: 'S3',
          spec: {
            bucketName: prevStepData?.varFile?.spec?.store?.spec?.bucketName || '',
            region: prevStepData?.varFile?.spec?.store?.spec?.region || '',
            paths: formatPaths(prevStepData?.varFile?.spec?.store?.spec?.paths || [''])
          }
        }
      }
    }
  }
}

export const formatOnSubmitData = (values: any, prevStepData: any, connectorValue: string) => {
  const payload = {
    connectorRef: connectorValue,
    ...values
  }

  return {
    varFile: {
      type: payload.varFile.type,
      identifier: payload.varFile.identifier,
      spec: {
        store: {
          type: payload.connectorRef?.connector?.type || prevStepData?.selectedType,
          spec: {
            connectorRef: payload.connectorRef,
            ...payload.varFile.spec?.store?.spec
          }
        }
      }
    }
  }
}

export const shouldFetchFieldOptions = (connectorRefValue: string, queryParamList: Array<string | number>): boolean => {
  return (
    (!isEmpty(connectorRefValue) && getMultiTypeFromValue(connectorRefValue)) === MultiTypeInputType.FIXED &&
    checkIfQueryParamsisNotEmpty(queryParamList) &&
    queryParamList.every(query => getMultiTypeFromValue(query) === MultiTypeInputType.FIXED)
  )
}

export const amazonS3ValidationSchema = (
  getString: UseStringsReturn['getString'],
  fieldPath?: string,
  isConfig?: boolean,
  isBackendConfig?: boolean,
  isTerraformPlan?: boolean
): Yup.ObjectSchema => {
  const amazonS3DetailsSchema = {
    region: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.region')),
    bucketName: Yup.string().trim().required(getString('pipeline.manifestType.bucketNameRequired'))
  }

  const pathValidationSchema = {
    paths: Yup.lazy((value): Yup.Schema<unknown> => {
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

  const folderPathSchema = {
    folderPath: Yup.string().trim().required(getString('pipeline.manifestType.folderPathRequired'))
  }

  if (isConfig) {
    const configSetup = {
      configFiles: Yup.object().shape({
        store: Yup.object().shape({
          spec: Yup.object().shape({
            ...amazonS3DetailsSchema,
            ...folderPathSchema
          })
        })
      })
    }
    if (isTerraformPlan) {
      return Yup.object().shape({
        spec: Yup.object().shape({
          [`${fieldPath}`]: Yup.object().shape({
            ...configSetup
          })
        })
      })
    }
    return Yup.object().shape({
      spec: Yup.object().shape({
        [`${fieldPath}`]: Yup.object().shape({
          spec: Yup.object().shape({
            ...configSetup
          })
        })
      })
    })
  }

  if (isBackendConfig) {
    const backendConfigSetup = {
      backendConfig: Yup.object().shape({
        spec: Yup.object().shape({
          store: Yup.object().shape({
            spec: Yup.object().shape({
              ...amazonS3DetailsSchema,
              ...pathValidationSchema
            })
          })
        })
      })
    }
    if (isTerraformPlan) {
      return Yup.object().shape({
        spec: Yup.object().shape({
          [`${fieldPath}`]: Yup.object().shape({
            ...backendConfigSetup
          })
        })
      })
    }
    return Yup.object().shape({
      spec: Yup.object().shape({
        [`${fieldPath}`]: Yup.object().shape({
          spec: Yup.object().shape({
            ...backendConfigSetup
          })
        })
      })
    })
  }

  return Yup.object().shape({
    varFile: Yup.object().shape({
      identifier: IdentifierSchemaWithOutName(getString, {
        requiredErrorMsg: getString('validation.identifierRequired')
      }),
      spec: Yup.object().shape({
        store: Yup.object().shape({
          spec: Yup.object().shape({
            ...amazonS3DetailsSchema,
            ...pathValidationSchema
          })
        })
      })
    })
  })
}

export const formatAmazonS3Data = (prevStepData: any, data: any, configStoreObject: any, formik: any, path: string) => {
  if (prevStepData.identifier && prevStepData.identifier !== data?.identifier) {
    set(configStoreObject, 'store.spec.connectorRef', prevStepData?.identifier)
  }

  const configFiles = get(data, `${path}.store.spec`)

  //unsetting store values on switch from different connector to s3 connector
  if (configStoreObject?.store?.spec?.files) {
    unset(configStoreObject.store.spec, 'files')
  }

  if (configStoreObject?.store?.spec?.secretFiles) {
    unset(configStoreObject.store.spec, 'secretFiles')
  }

  if (configStoreObject?.store?.spec?.gitFetchType) {
    unset(configStoreObject?.store?.spec, 'repoName')
    unset(configStoreObject?.store?.spec, 'artifactPaths')
    unset(configStoreObject?.store?.spec, 'repositoryName')
    unset(configStoreObject?.store?.spec, 'commitId')
    unset(configStoreObject?.store?.spec, 'gitFetchType')
    unset(configStoreObject?.store?.spec, 'branch')
  }

  //set s3 store values
  configStoreObject.store.spec.bucketName = configFiles.bucketName
  configStoreObject.store.spec.region = configFiles.region

  if (configFiles.paths) {
    unset(configStoreObject?.store?.spec, 'folderPath')
    if (getMultiTypeFromValue(configFiles.paths) === MultiTypeInputType.FIXED) {
      configStoreObject.store.spec.paths = configFiles.paths.map((item: PathInterface) => item.path)
    } else {
      configStoreObject.store.spec.paths = configFiles.paths
    }
  }

  if (configFiles.folderPath) {
    unset(configStoreObject?.store?.spec, 'paths')

    configStoreObject.store.spec.folderPath = configFiles.folderPath
  }
  const valObj = cloneDeep(formik.values)
  configStoreObject.store.type = prevStepData?.selectedType

  return valObj
}
