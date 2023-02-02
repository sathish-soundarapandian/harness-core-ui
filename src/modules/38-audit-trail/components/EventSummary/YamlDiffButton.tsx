/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Text, Layout, Icon, Container } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import React, { ReactElement, useMemo, useState } from 'react'
import { MonacoDiffEditor } from 'react-monaco-editor'
import { useStrings } from 'framework/strings'
import { useGetYamlDiff } from 'services/audit'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import css from './EventSummary.module.scss'

interface YamlDiffButtonProps {
  auditId: string
  accountIdentifier: string
}

const DIFF_VIEWER_OPTIONS = {
  ignoreTrimWhitespace: true,
  minimap: { enabled: false },
  codeLens: false,
  readOnly: true,
  renderSideBySide: false,
  lineNumbers: 'off' as const,
  inDiffEditor: true,
  scrollBeyondLastLine: false,
  smartSelect: false
}

const YamlDiffButton: React.FC<YamlDiffButtonProps> = ({ auditId, accountIdentifier }) => {
  const [showDiff, setShowDiff] = useState<boolean>(false)
  const [buttonClientY, setButtonClientY] = useState(0)
  const editorHeight = useMemo(() => `calc(100vh - ${buttonClientY + 60}px)`, [buttonClientY])
  const { getString } = useStrings()

  const {
    data,
    loading,
    error,
    refetch: fetchYamlDiff
  } = useGetYamlDiff({
    queryParams: {
      accountIdentifier,
      auditId
    },
    lazy: true
  })

  const renderEditor = (): ReactElement => {
    if (loading) {
      return <ContainerSpinner />
    }

    if (error) {
      return (
        <Text margin={{ top: 'small' }} color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
          {getString('auditTrail.noYamlDifference')}
        </Text>
      )
    }

    return (
      <Container margin={{ top: 'small' }}>
        <MonacoDiffEditor
          width="100%"
          height={editorHeight}
          language="yaml"
          original={data?.data?.oldYaml}
          value={data?.data?.newYaml}
          options={DIFF_VIEWER_OPTIONS}
        />
      </Container>
    )
  }

  const handleButtonClick = (e: React.MouseEvent<Element, MouseEvent>): void => {
    e.persist()
    setButtonClientY(e.clientY)
    if (showDiff === false) {
      fetchYamlDiff()
      setShowDiff(true)
    } else {
      setShowDiff(false)
    }
  }

  return (
    <>
      <Layout.Horizontal
        className={css.yamlButton}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
        color={Color.GREY_800}
        padding={{ top: 'small', bottom: 'small' }}
        onClick={handleButtonClick}
      >
        <Text margin={{ right: 'xsmall' }} font={{ variation: FontVariation.SMALL_SEMI }}>
          {getString('auditTrail.yamlDifference')}
        </Text>
        <Icon color={Color.PRIMARY_7} name={showDiff ? 'chevron-up' : 'chevron-down'} />
      </Layout.Horizontal>

      {showDiff && renderEditor()}
    </>
  )
}

export default YamlDiffButton
