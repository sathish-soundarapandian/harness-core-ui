/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ChangeEvent, FC, useCallback, useState } from 'react'
import { Button, ButtonVariation, Container, Layout, SimpleTagInput, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import uploadImageUrl from '@cf/images/upload.svg'
import filterTargets from './filterTargets'
import type { TargetData } from './types'

import css from './FileUpload.module.scss'

export interface FileUploadProps {
  onChange: (file?: File) => void
}

const FileUpload: FC<FileUploadProps> = ({ onChange }) => {
  const { getString } = useStrings()
  const [targets, setTargets] = useState<TargetData[]>([])
  const [tagItems, setTagItems] = useState<{ label: string; value: string }[]>([])

  const handleRemove = useCallback((): void => {
    setTargets([])
    onChange(undefined)
    setTagItems([])
  }, [onChange])

  const handleUpload = useCallback(
    (file: File): void => {
      file
        .text()
        .then((str: string) =>
          str
            .split(/\r?\n/)
            .filter(value => !!value.length)
            .map(row => row.split(',').map(col => col.trim()))
            .map(([name, identifier]) => ({ name, identifier }))
        )
        .then(filterTargets)
        .then((targetData: TargetData[]) => {
          setTagItems(
            targetData.map(
              ({ name, identifier }) => ({ label: identifier, value: name } as { label: string; value: string })
            )
          )
          setTargets(targetData)
          onChange(file)
        })
    },
    [onChange]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      /* istanbul ignore else */
      if (e.currentTarget.files?.length) {
        handleUpload(e.currentTarget.files[0])
      }
    },
    [handleUpload]
  )

  return (
    <>
      {!targets?.length ? (
        <label className={css.uploadButton}>
          <img src={uploadImageUrl} width={100} height={100} alt="" />
          <Text>{getString('cf.targets.uploadYourFile')}</Text>
          <input type="file" name="bulk-upload" hidden onChange={handleChange} />
        </label>
      ) : (
        <>
          <Layout.Horizontal
            margin={{ bottom: 'small' }}
            flex={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text>
              <String stringID="cf.targets.uploadStats" vars={{ count: targets.length }} useRichText />
            </Text>

            <Button
              intent="primary"
              variation={ButtonVariation.LINK}
              text={getString('filters.clearAll')}
              onClick={handleRemove}
            />
          </Layout.Horizontal>

          <Container className={css.uploadResults} height={220} padding="xsmall" background={Color.PRIMARY_BG}>
            <SimpleTagInput readonly noInputBorder selectedItems={tagItems} items={tagItems} />
          </Container>
        </>
      )}
    </>
  )
}

export default FileUpload
