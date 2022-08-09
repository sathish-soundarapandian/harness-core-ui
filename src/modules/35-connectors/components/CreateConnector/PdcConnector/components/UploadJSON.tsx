/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useRef, DragEvent, useCallback } from 'react'
import { Icon, Text } from '@harness/uicore'
import { Button, ButtonVariation, FormInput } from '@wings-software/uicore'
import { debounce } from 'lodash-es'
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
  const [fileName, setFileName] = useState<string>('')
  const [dropHighlight, setDropHighlight] = useState(false)

  const handleFileUpload = async (file: File) => {
    setFileName('')
    try {
      const fr = new FileReader()
      fr.onload = () => {
        try {
          const jsonValue = JSON.parse(fr.result as string)
          setJsonValue(jsonValue)
          setFileName(file.name)
          prettyPrintJsonContent(jsonValue)
        } catch (e) {
          showError(getString('connectors.pdc.errorParsingJsonFile'))
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

  const prettyPrintJsonContent = (jsonValue: string) => {
    const textAreaElement: HTMLTextAreaElement | null = document.getElementsByTagName('textarea')[0]
    const pretty = JSON.stringify(jsonValue, undefined, 4)
    if (textAreaElement) {
      textAreaElement.value = pretty
    }
  }

  const handleJsonAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const target = event.target as HTMLTextAreaElement
      const jsonValue = JSON.parse(target.value)
      setJsonValue(jsonValue)
    } catch (e) {
      showError(e.message)
    }
  }

  const debouncedOnChange = useCallback(debounce(handleJsonAreaChange, 1000), [])

  return (
    <>
      <input
        type="file"
        id="bulk"
        name="bulk-upload"
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={event => handleFileUpload((event.target as any).files[0])}
      />
      {!fileName && (
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
            try {
              preventDefaults(event)
              setDropHighlight(false)
              for (let i = 0; i < event.dataTransfer.files.length; i++) {
                handleFileUpload(event.dataTransfer.files[i])
              }
            } catch (e) {
              showError(e)
            }
          }}
        >
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
      )}
      {fileName && (
        <>
          <Button
            variation={ButtonVariation.SECONDARY}
            icon="syncing"
            onClick={() => inputRef.current.click()}
            title={getString('filestore.view.replaceFile')}
            text={getString('filestore.view.replaceFile')}
            margin={{ left: 'small' }}
            style={{
              position: 'absolute',
              left: '600px',
              top: '105px'
            }}
          />
          <FormInput.TextArea
            name="hostsJson"
            onChange={debouncedOnChange}
            label={getString('connectors.pdc.hostsJson')}
          />
        </>
      )}
    </>
  )
}

export default UploadJSON
