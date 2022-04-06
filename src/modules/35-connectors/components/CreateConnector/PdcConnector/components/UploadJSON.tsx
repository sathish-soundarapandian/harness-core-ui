/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useRef, DragEvent } from 'react'
import { Icon, Text } from '@harness/uicore'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { uploadHostItem } from '../StepDetails/PdcDetails'

import css from './UploadJSON.module.scss'

interface UploadJSONInterface {
  setJsonValue: (value: uploadHostItem[]) => void
}

const UploadJSON = ({ setJsonValue }: UploadJSONInterface) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const [fileContent, setFileContent] = useState([] as uploadHostItem[])
  const [fileName, setFileName] = useState<string>('')
  const [dropHighlight, setDropHighlight] = useState(false)

  useEffect(() => {
    setJsonValue(fileContent)
  }, [fileContent])

  const handleFileUpload = async (file: File) => {
    setFileName('')
    try {
      const fr = new FileReader()
      fr.onload = () => {
        try {
          setFileContent(JSON.parse(fr.result as string))
          setFileName(file.name)
        } catch (e) {
          showError(e.message)
        }
      }
      fr.readAsText(file)
    } catch (e) {
      showError(getString('connectors.pdc.errorUploading'))
    }
  }

  const preventDefaults = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      className={`${css.uploadComponent} ${dropHighlight ? css.highlightedDrop : ''}`}
      onClick={() => inputRef.current.click()}
      onDragEnter={e => {
        preventDefaults(e)
        setDropHighlight(true)
      }}
      onDragOver={e => {
        preventDefaults(e)
        setDropHighlight(true)
      }}
      onDragLeave={e => {
        preventDefaults(e)
        setDropHighlight(false)
      }}
      onDrop={event => {
        preventDefaults(event)
        setDropHighlight(false)
        if (event.dataTransfer.items) {
          // Use DataTransferItemList interface to access the file(s)
          for (let i = 0; i < event.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (event.dataTransfer.items[i].kind === 'file') {
              const file = event.dataTransfer.items[i].getAsFile()
              handleFileUpload(file as any)
            }
          }
        } else {
          // Use DataTransfer interface to access the file(s)
          for (let i = 0; i < event.dataTransfer.files.length; i++) {
            handleFileUpload(event.dataTransfer.files[i])
          }
        }
      }}
    >
      <input
        type="file"
        id="bulk"
        name="bulk-upload"
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={event => handleFileUpload((event.target as any).files[0])}
      />
      <Icon name="upload-box" size={24} className={css.uploadIcon} />
      {fileName ? (
        <Text>{fileName}</Text>
      ) : (
        <>
          <Text key="uploadText1">{getString('connectors.pdc.hostsUpload1')}</Text>
          <Text key="uploadText2">{getString('connectors.pdc.hostsUpload2')}</Text>
        </>
      )}
    </div>
  )
}

export default UploadJSON
