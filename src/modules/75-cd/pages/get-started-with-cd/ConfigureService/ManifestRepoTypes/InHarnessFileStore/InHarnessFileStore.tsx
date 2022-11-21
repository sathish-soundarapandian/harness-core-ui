/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Layout, PageSpinner, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { get, isEmpty, set } from 'lodash-es'
import produce from 'immer'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { ManifestConfigWrapper, ResponseFileDTO, useCreate, useGetFolderNodes } from 'services/cd-ng'
import { StringUtils } from '@common/exports'
import FileIcon from '@filestore/images/file-.svg'
import { FileStoreNodeTypes, FileUsage } from '@filestore/interfaces/FileStore'
import { ExtensionType, FILE_STORE_ROOT } from '@filestore/utils/constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { FileStoreNodeDTO } from '@filestore/components/FileStoreContext/FileStoreContext'
import { DrawerMode, SAMPLE_MANIFEST_FOLDER, ServiceDataType } from '../../../CDOnboardingUtils'
import { manifestFileContents } from '../../../sampleManifests'
import { RightDrawer } from '../RightDrawer/RightDrawer'
import { useCDOnboardingContext } from '../../../CDOnboardingStore'
import type { ConfigureServiceInterface } from '../../ConfigureService'
import FilePreview from './FilePreview'
import css from '../../../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export interface DrawerDataType {
  fileContent: FileStoreNodeDTO | undefined
  mode: DrawerMode
}

const InHarnessFileStore = ({
  onSuccess,
  formikProps
}: {
  onSuccess: () => void
  formikProps: FormikProps<ConfigureServiceInterface>
}): JSX.Element => {
  const { getString } = useStrings()
  const {
    state: { service: serviceData },
    saveServiceData,
    drawerData,
    setDrawerData
  } = useCDOnboardingContext()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const folderIdentifier = React.useMemo(() => StringUtils.getIdentifierFromName(SAMPLE_MANIFEST_FOLDER), [])

  const { mutate: createFolder, loading: createLoading } = useCreate({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })
  const { mutate: createNode, loading: fileCreationLoading } = useCreate({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })
  const { mutate: getRootNodes, loading: fileFetching } = useGetFolderNodes({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      fileUsage: FileUsage.MANIFEST_FILE
    }
  })

  const [childNodes, setChildNodes] = React.useState<FileStoreNodeDTO[]>(formikProps?.values?.fileNodesData || [])
  const [openFileDrawer, setOpenFileDrawer] = React.useState<boolean>(false)

  const saveConstructManifestObj = (filesData: FileStoreNodeDTO[]): void => {
    const paths = {
      files: [] as string[],
      valuesPath: [] as string[]
    }
    const fileNodesData = filesData.map(node => {
      if (node.path?.includes('values')) {
        paths.valuesPath.push(`account:${node.path}`)
      } else {
        paths.files.push(`account:${node.path}`)
      }
      return {
        ...node,
        parentName: SAMPLE_MANIFEST_FOLDER
      }
    })

    const manifestType = formikProps?.values?.manifestData?.type as ManifestTypes

    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: get(serviceData, 'serviceDefinition.spec.manifests[0].manifest.identifier'),
        type: manifestType,
        spec: {
          store: {
            type: ManifestStoreMap.Harness,
            spec: {
              files: paths.files,
              valuesPath: paths.valuesPath,
              skipResourceVersioning: false,
              ...(manifestType === 'HelmChart' && { helmVersion: 'V2' })
            }
          }
        }
      }
    }
    formikProps?.setFieldValue('manifestConfig', manifestObj)
    formikProps?.setFieldValue('fileNodesData', fileNodesData)

    const updatedContextService = produce(serviceData as ServiceDataType, draft => {
      set(draft, 'serviceDefinition.spec.manifests[0]', manifestObj)
      set(draft, 'data.fileNodesData', fileNodesData)
    })
    saveServiceData(updatedContextService)
  }

  // fetch all files from onBoarding sample folder
  const getListOfAllFiles = React.useCallback(async (): Promise<void> => {
    await getRootNodes({
      identifier: folderIdentifier,
      name: SAMPLE_MANIFEST_FOLDER,
      type: FileStoreNodeTypes.FOLDER,
      parentIdentifier: FILE_STORE_ROOT
    }).then(response => {
      if (response?.data?.children) {
        saveConstructManifestObj(response.data.children)
        setChildNodes(response.data.children)
      }
    })

    onSuccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderIdentifier, onSuccess])

  // sample_manifest files creation at account level filestore
  const getPromisedForManifestFiles = React.useCallback(() => {
    const promises: Promise<ResponseFileDTO>[] = []
    Object.entries(manifestFileContents).forEach(async ([key, value]) => {
      const formData = new FormData()
      const blobContentEditor = new Blob([value], { type: 'text/plain' })
      const defaultMimeType = ExtensionType.YAML
      formData.append('type', FileStoreNodeTypes.FILE)
      formData.append('content', blobContentEditor)
      formData.append('mimeType', defaultMimeType)
      formData.append('name', key)
      formData.append('identifier', StringUtils.getIdentifierFromName(key))
      formData.append('parentIdentifier', folderIdentifier as string)
      formData.append('fileUsage', FileUsage.MANIFEST_FILE)

      promises.push(createNode(formData as any))
    })

    Promise.all(promises)
      .then(_responses => {
        getListOfAllFiles()
      })
      .catch((e: any) => {
        showError(e)
      })
    // Promises.al
  }, [createNode, folderIdentifier, getListOfAllFiles, showError])

  // sample_manifest folder creation at account level filestore
  const registerSampleManifestFolder = React.useCallback(async (): Promise<void> => {
    const getConfig: FileStoreNodeDTO = {
      identifier: folderIdentifier,
      name: SAMPLE_MANIFEST_FOLDER,
      type: FileStoreNodeTypes.FOLDER
    }

    try {
      const data = new FormData()
      data.append('identifier', getConfig.identifier)
      data.append('name', getConfig.name)
      data.append('type', getConfig.type)
      data.append('parentIdentifier', FILE_STORE_ROOT)

      const createResponse = await createFolder(data as any)

      if (createResponse.status === 'SUCCESS') {
        await getPromisedForManifestFiles()
      }
    } catch (_e) {
      // do nothing
      getListOfAllFiles()
    }
  }, [folderIdentifier, createFolder, getPromisedForManifestFiles, getListOfAllFiles])

  React.useEffect(() => {
    // register folder/files - if not present in context
    isEmpty(childNodes) ? registerSampleManifestFolder() : saveConstructManifestObj(childNodes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childNodes])

  if (createLoading || fileCreationLoading || fileFetching) {
    return <PageSpinner />
  }

  return (
    <>
      <Container padding={{ bottom: 'large' }}>
        <Layout.Vertical>
          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
            <Icon name={'harness'} size={28} padding={{ right: 'medium' }} />
            <Layout.Vertical>
              <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'small' }} color={Color.GREY_600}>
                {getString('cd.steps.commands.locationFileStore')}
              </Text>

              <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_500}>
                {getString('cd.getStartedWithCD.inHarnessFileStore')}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
          <Container className={css.borderBottomClass} padding={{ top: 'xlarge', bottom: 'medium' }} />

          {childNodes.map((child, index) => {
            return (
              <React.Fragment key={child.identifier}>
                <Layout.Horizontal flex={{ alignItems: 'center' }} padding="medium">
                  <Layout.Horizontal flex={{ alignItems: 'center' }}>
                    <img src={FileIcon} style={{ marginRight: 10 }} />
                    <Text color={Color.GREY_800} font={{ size: 'normal' }} lineClamp={1}>
                      {child.name}
                    </Text>
                  </Layout.Horizontal>
                  <Layout.Horizontal>
                    <Icon
                      name={'eye-open'}
                      size={20}
                      margin={{ right: 'medium' }}
                      onClick={() => {
                        setOpenFileDrawer(true)
                        setDrawerData({
                          fileContent: child,
                          mode: DrawerMode.Preview
                        })
                      }}
                    />
                  </Layout.Horizontal>
                </Layout.Horizontal>
                {index < childNodes.length - 1 && <Container className={css.borderBottomClass} />}
              </React.Fragment>
            )
          })}
        </Layout.Vertical>
      </Container>
      {!isEmpty(drawerData?.fileContent) && (
        <RightDrawer isOpen={openFileDrawer} setIsOpen={setOpenFileDrawer}>
          <FilePreview />
        </RightDrawer>
      )}
    </>
  )
}

export default InHarnessFileStore
