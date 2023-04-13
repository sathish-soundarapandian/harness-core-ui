import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { GitRepoName } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ConfigFilesMap } from '../../ConfigFilesHelper'

const getRepoNameBasedonScope = (initialValues: any, prevStepData: any): string => {
  const connectorScope = getScopeFromValue(initialValues?.spec.store?.spec.connectorRef)

  switch (connectorScope) {
    case Scope.ACCOUNT:
      return initialValues?.spec.store?.spec.connectorRef ===
        `account.${prevStepData?.connectorRef?.connector?.identifier}`
        ? initialValues?.spec.store?.spec.repoName
        : ''
    case Scope.PROJECT:
      return prevStepData?.connectorRef?.connector?.identifier === initialValues?.spec.store?.spec.connectorRef
        ? initialValues?.spec?.store?.spec.repoName
        : ''
    case Scope.ORG:
      return `${prevStepData?.connectorRef?.scope}.${prevStepData?.connectorRef?.connector?.identifier}` ===
        initialValues?.spec.store?.spec.connectorRef
        ? initialValues?.spec.store?.spec.repoName
        : ''
    default:
      return initialValues?.spec.store?.spec.repoName
  }
}

export const getRepositoryName = (prevStepData: any, initialValues: any): string => {
  const gitConnectionType: string = prevStepData?.store === ConfigFilesMap.Git ? 'connectionType' : 'type'
  const connectionType =
    prevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    prevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  if (getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED) {
    return prevStepData.repoName
  } else {
    if (connectionType === GitRepoName.Repo) {
      return prevStepData.connectorRef?.connector?.spec?.url
    }
    return getRepoNameBasedonScope(initialValues, prevStepData)
  }
}

export const filePathWidth = 600
