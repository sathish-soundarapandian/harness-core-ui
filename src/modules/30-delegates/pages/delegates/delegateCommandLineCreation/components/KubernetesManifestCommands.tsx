import { Layout, Text, Container, Button, ButtonSize, ButtonVariation, OverlaySpinner } from '@harness/uicore'

import { FontVariation, Color } from '@harness/design-system'
import React, { useState } from 'react'

import cx from 'classnames'
import CommandBlock from '@common/CommandBlock/CommandBlock'

import { useStrings } from 'framework/strings'
import { DelegateActions, Category } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import CopyButton from '@common/utils/CopyButton'
import css from '../DelegateCommandLineCreation.module.scss'

interface KubernetesManifestCommandsProps {
  command: string
  yaml: string
  yamlDownloaded: boolean
}
const KubernetesManifestCommands: React.FC<KubernetesManifestCommandsProps> = ({ command, yaml, yamlDownloaded }) => {
  const { getString } = useStrings()
  const [basicMode, setBasicMode] = useState(true)
  const [previewYaml, setPreviewYaml] = useState(false)

  const { trackEvent } = useTelemetry()
  const linkRef = React.useRef<HTMLAnchorElement>(null)
  return (
    <Layout.Vertical margin={{ bottom: 'xxxlarge' }}>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.yamlFileOptions')}
      </Text>

      <Layout.Horizontal spacing="none" margin={{ bottom: 'xlarge', top: 'none' }}>
        <Button
          size={ButtonSize.SMALL}
          className={css.kubernetesButtons}
          round
          onClick={() => {
            setBasicMode(true)
            trackEvent(DelegateActions.DelegateCommandLineKubernetesManifestBasic, {
              category: Category.DELEGATE
            })
          }}
          text={getString('basic')}
          intent={basicMode ? 'primary' : 'none'}
        ></Button>
        <Button
          size={ButtonSize.SMALL}
          className={css.kubernetesButtons}
          onClick={() => {
            setBasicMode(false)
            trackEvent(DelegateActions.DelegateCommandLineKubernetesManifestCustom, {
              category: Category.DELEGATE
            })
          }}
          intent={!basicMode ? 'primary' : 'none'}
          round
          text={getString('common.repo_provider.customLabel')}
        ></Button>
      </Layout.Horizontal>

      {basicMode && (
        <>
          <Layout.Horizontal spacing="none" margin={{ bottom: 'xlarge', top: 'none' }}>
            <Text font={{ variation: FontVariation.BODY }}>
              {getString('delegates.commandLineCreation.yamlBasicOptionText')}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal
            spacing="none"
            flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
            margin={{ bottom: 'xlarge', top: 'none' }}
          >
            <Button
              className={css.kubernetesButtons}
              variation={ButtonVariation.SECONDARY}
              onClick={event => {
                event.stopPropagation()
                const content = new Blob([yaml as BlobPart], { type: 'data:text/plain;charset=utf-8' })
                if (linkRef?.current) {
                  linkRef.current.href = window.URL.createObjectURL(content)
                  linkRef.current.download = `harness-delegate.yaml`
                  linkRef.current.click()
                }
                trackEvent(DelegateActions.DelegateCommandLineKubernetesManifestDownloadYaml, {
                  category: Category.DELEGATE
                })
              }}
              text={getString('common.downloadYaml')}
            ></Button>
            <a className="hide" ref={linkRef} target={'_blank'} />
            {!previewYaml && (
              <Button
                className={css.kubernetesButtons}
                variation={ButtonVariation.LINK}
                onClick={() => {
                  setPreviewYaml(true)
                  trackEvent(DelegateActions.DelegateCommandLineKubernetesManifestPreviewYaml, {
                    category: Category.DELEGATE
                  })
                }}
                text={getString('common.previewYAML')}
              ></Button>
            )}
            {previewYaml && (
              <Button
                className={css.kubernetesButtons}
                icon="cross"
                color={Color.GREY_500}
                width={150}
                variation={ButtonVariation.ICON}
                onClick={() => {
                  setPreviewYaml(false)
                  trackEvent(DelegateActions.DelegateCommandLineKubernetesManifestPreviewYamlClosed, {
                    category: Category.DELEGATE
                  })
                }}
                text={getString('delegates.commandLineCreation.closePreview')}
              ></Button>
            )}
          </Layout.Horizontal>
          {previewYaml && (
            <Container margin={{ bottom: 'xxlarge' }}>
              <Container className={cx(css.terrformCommandContainer, { [css.terrformCommandContainerCenter]: !yaml })}>
                <OverlaySpinner show={!yamlDownloaded}>
                  {yaml && (
                    <CommandBlock
                      telemetryProps={{
                        copyTelemetryProps: {
                          eventName: DelegateActions.DelegateCommandLineKubernetesYamlDownloadCopy,
                          properties: { category: Category.DELEGATE }
                        },
                        downloadTelemetryProps: {
                          eventName: DelegateActions.DelegateCommandLineKubernetesYamlDownloadCommand,
                          properties: { category: Category.DELEGATE }
                        }
                      }}
                      commandSnippet={yaml}
                      allowCopy={true}
                      ignoreWhiteSpaces={false}
                      allowDownload={true}
                      downloadFileProps={{ downloadFileExtension: 'yaml', downloadFileName: 'harness-delegate' }}
                    />
                  )}
                </OverlaySpinner>
              </Container>
            </Container>
          )}
        </>
      )}
      {!basicMode && (
        <>
          <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
            {getString('delegates.commandLineCreation.firstComandHeadingKubernetes')}
          </Text>
          <Container margin={{ bottom: 'xxlarge' }}>
            <CommandBlock
              commandSnippet={getString('delegates.commandLineCreation.firstComandKubernetesFirstLine')}
              allowCopy={true}
              telemetryProps={{
                copyTelemetryProps: {
                  eventName: DelegateActions.DelegateCommandLineKubernetesManifestCommandCopy1,
                  properties: { category: Category.DELEGATE }
                }
              }}
            />
          </Container>
          <Text font={{ variation: FontVariation.BODY }} margin={{ bottom: 'xlarge', top: 'none' }}>
            {getString('delegates.commandLineCreation.createYourOwnYaml')}
          </Text>

          <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
            {getString('delegates.commandLineCreation.commandsKubernetesHeading')}
          </Text>

          <ul className={css.ulList}>
            {command.split('\n').map(line => {
              let nonCopySnippetLocal = ''
              let copySnippetLocal = ''
              const splitStr = line.split(' with ')
              if (splitStr.length > 1) {
                nonCopySnippetLocal = `${splitStr[0]} with `
                copySnippetLocal = splitStr[1]
              } else {
                nonCopySnippetLocal = splitStr[0]
                copySnippetLocal = splitStr[0]
              }
              return (
                <li key={line}>
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="xsmall">
                    <Text font={{ variation: FontVariation.SMALL_SEMI }}>{nonCopySnippetLocal} </Text>
                    {splitStr.length > 1 && (
                      <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.PRIMARY_7}>
                        {copySnippetLocal}
                      </Text>
                    )}
                    <CopyButton
                      textToCopy={copySnippetLocal}
                      intent={'primary'}
                      onCopySuccess={() => {
                        trackEvent(`${DelegateActions.DelegateCommandLineReplaceCommands} ${line}`, {
                          category: Category.DELEGATE
                        })
                      }}
                    />
                  </Layout.Horizontal>
                </li>
              )
            })}
          </ul>
        </>
      )}
      <Text font={{ variation: FontVariation.H6 }} className={css.textHeading}>
        {getString('delegates.commandLineCreation.thirdCommandHeadingTerraform')}
      </Text>
      <CommandBlock
        ignoreWhiteSpaces={false}
        telemetryProps={{
          copyTelemetryProps: {
            eventName: DelegateActions.DelegateCommandLineKubernetesManifestCommandCopy2,
            properties: { category: Category.DELEGATE }
          }
        }}
        commandSnippet={getString('delegates.commandLineCreation.lastCommandKubernetesLastLine')}
        allowCopy={true}
      />
    </Layout.Vertical>
  )
}
export default KubernetesManifestCommands
