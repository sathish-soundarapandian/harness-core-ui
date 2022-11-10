/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Spinner } from '@blueprintjs/core'
import { defaultTo, isEmpty, isEqual } from 'lodash-es'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Color,
  Container,
  FontVariation,
  Layout,
  Text,
  useToaster
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import FileIcon from '@filestore/images/file-.svg'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import { useStrings } from 'framework/strings'
import { DrawerMode } from '@cd/pages/get-started-with-cd/CDOnboardingUtils'
import { useDownloadFile, useUpdate } from 'services/cd-ng'
import { ExtensionType } from '@filestore/utils/constants'
import { FileStoreNodeTypes, FileUsage } from '@filestore/interfaces/FileStore'
import { useCDOnboardingContext } from '@cd/pages/get-started-with-cd/CDOnboardingStore'
import css from './InHarnessFileStore.module.scss'

export default function FilePreview(): JSX.Element {
  const { drawerData, setDrawerData } = useCDOnboardingContext()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId } = useParams<ProjectPathProps>()

  const [initialContent, setInitialContent] = React.useState<string>('')
  const [value, setValue] = React.useState('')

  const handleSubmit = async (): Promise<void> => {
    const formData = new FormData()
    const blobContentEditor = new Blob([value as string], { type: 'text/plain' })

    const defaultMimeType = ExtensionType.YAML

    formData.append('type', FileStoreNodeTypes.FILE)
    formData.append('content', blobContentEditor)
    formData.append('mimeType', defaultMimeType)
    formData.append('name', drawerData?.fileContent?.name as string)
    formData.append('identifier', drawerData?.fileContent?.identifier as string)
    formData.append('parentIdentifier', drawerData?.fileContent?.parentIdentifier as string)
    formData.append('fileUsage', FileUsage.MANIFEST_FILE)

    try {
      const responseUpdate = await updateNode(formData as any)
      if (responseUpdate.status === 'SUCCESS') {
        showSuccess(getString('filestore.fileSuccessSaved', { name: drawerData?.fileContent?.name as string }))
      }
      setInitialContent(value)
    } catch (e: any) {
      if (e?.data?.message) {
        showError(e.data.message)
      }
    }
  }

  const {
    data,
    loading: downloadLoading,
    refetch
  } = useDownloadFile({
    identifier: drawerData?.fileContent?.identifier as string,
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  const { mutate: updateNode, loading: saveLoading } = useUpdate({
    identifier: drawerData?.fileContent?.identifier as string,
    queryParams: { accountIdentifier: accountId }
  })

  useEffect(() => {
    if (data) {
      ;(data as unknown as Response)
        .clone()
        .text()
        .then((content: string) => {
          setInitialContent(content)
          setValue(content)
        })
    }
  }, [data, drawerData])

  useEffect(() => {
    refetch()
  }, [drawerData, refetch])

  const onEdit = (): void => {
    setDrawerData({
      ...drawerData,
      mode: DrawerMode.Edit
    })
  }
  const drawerTitle = React.useCallback((): JSX.Element => {
    return (
      <Container className={css.titleWrapper} margin={{ bottom: 'medium' }} padding={'medium'}>
        <Container
          margin={{ bottom: 'small' }}
          flex={{ alignItems: 'center', justifyContent: 'space-between' }}
          width="100%"
        >
          <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
            <img src={FileIcon} style={{ marginRight: 10 }} />
            <Text lineClamp={1} color={Color.BLACK} font={{ variation: FontVariation.H4 }}>
              {defaultTo(drawerData?.fileContent?.name, '')}
            </Text>
          </Layout.Horizontal>
          {drawerData?.mode === DrawerMode.Edit ? (
            <Layout.Horizontal spacing={'medium'}>
              <Button
                variation={ButtonVariation.PRIMARY}
                size={ButtonSize.SMALL}
                className={css.applyChanges}
                disabled={isEmpty(value) || saveLoading || isEqual(initialContent, value)}
                text={getString('save')}
                onClick={handleSubmit}
              />
              <Button
                variation={ButtonVariation.SECONDARY}
                className={css.cancel}
                disabled={saveLoading}
                text={getString('common.discard')}
                onClick={() => {
                  setValue(initialContent)
                }}
              />
            </Layout.Horizontal>
          ) : (
            <Button
              variation={ButtonVariation.PRIMARY}
              className={css.applyChanges}
              disabled={false} //readOnly
              text={getString('edit')}
              onClick={onEdit}
            />
          )}
        </Container>
      </Container>
    )
  }, [drawerData, getString, initialContent, onEdit, saveLoading, value])

  return (
    <Container height="100%" className={css.contentEdtior}>
      {drawerTitle()}
      {downloadLoading || saveLoading ? (
        <Spinner />
      ) : (
        <Container height="100%" padding={{ left: 'medium', right: 'medium' }}>
          <MonacoEditor
            language="yaml"
            value={value}
            data-testid="monaco-editor"
            onChange={val => setValue(val)}
            options={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: 13,
              minimap: {
                enabled: false
              },
              readOnly: drawerData?.mode === DrawerMode.Preview,
              scrollBeyondLastLine: false
            }}
          />
        </Container>
      )}
    </Container>
  )
}
