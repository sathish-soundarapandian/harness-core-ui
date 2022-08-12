import React, { useCallback } from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Color } from '@wings-software/design-system'
import { debounce, get } from 'lodash-es'
import { YamlDiffView } from '@pipeline/components/InputSetErrorHandling/YamlDiffView/YamlDiffView'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO } from '@pipeline/utils/types'

interface ReconcileDialogProps {
  inputSetUpdateHandler?: (updatedInputSet: InputSetDTO) => void
  overlayInputSetIdentifier?: string
  canUpdateInputSet: boolean
  oldYaml: string
  newYaml: string
  error: any
  refetchYamlDiff: () => void
  updateLoading?: boolean
  onClose: () => void
  isOverlayInputSet?: boolean
}

export function ReconcileDialog({
  inputSetUpdateHandler,
  overlayInputSetIdentifier,
  canUpdateInputSet,
  oldYaml,
  newYaml,
  error,
  refetchYamlDiff,
  updateLoading,
  onClose,
  isOverlayInputSet
}: ReconcileDialogProps): React.ReactElement {
  const { getString } = useStrings()
  const updatedObj: any = yamlParse(newYaml)

  const debouncedClose = useCallback(
    debounce(() => onClose(), 1000),
    []
  )

  return (
    <Container>
      <Layout.Vertical>
        <Container
          border={{ bottom: true }}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}
        >
          <Text font={{ variation: FontVariation.H4 }}>
            {overlayInputSetIdentifier ? ' OVERLAY INPUT SET ERROR INSPECTION' : 'INPUT SET ERROR INSPECTION'}
          </Text>
        </Container>
        <Container
          style={{ flex: 1 }}
          width={'100%'}
          background={Color.FORM_BG}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'xxxlarge', left: 'xxxlarge' }}
        >
          <YamlDiffView oldYaml={oldYaml} newYaml={newYaml} error={error} refetchYamlDiff={refetchYamlDiff} />
        </Container>
        <Container
          border={{ bottom: true }}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}
        >
          <RbacButton
            text={getString('pipeline.inputSets.removeInvalidFields')}
            width={232}
            intent="danger"
            disabled={!canUpdateInputSet}
            onClick={() => {
              inputSetUpdateHandler?.(
                overlayInputSetIdentifier || isOverlayInputSet
                  ? get(updatedObj, 'overlayInputSet', {})
                  : get(updatedObj, 'inputSet', {})
              )
              debouncedClose()
            }}
            loading={updateLoading}
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
