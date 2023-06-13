import React, { useState } from 'react'
import { Layout, Text, TextInput, useConfirmationDialog } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import { useToaster } from '@common/exports'
import { String, useStrings } from 'framework/strings'
import type { DeleteFeatureFlagQueryParams, Feature } from 'services/cf'
import useResponseError from '@cf/hooks/useResponseError'
import ArchiveFlagButtons from './ArchiveFlagButtons'

export interface ArchiveDialogProps {
  backToListingPage?: () => void
  flagData: Feature
  deleteFeatureFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  queryParams: DeleteFeatureFlagQueryParams
  refetchFlags?: () => void
}

interface UseArchiveFlagDialogReturn {
  openDialog: () => void
}

const useArchiveFlagDialog = ({
  flagData,
  deleteFeatureFlag,
  queryParams,
  refetchFlags,
  backToListingPage
}: ArchiveDialogProps): UseArchiveFlagDialogReturn => {
  const [isAnIdentifierMatch, setIsAnIdentifierMatch] = useState<boolean>(false)
  const [validationFlagIdentifier, setValidationFlagIdentifier] = useState<string>('')
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const { handleResponseError } = useResponseError()

  const handleArchive = async (): Promise<void> => {
    try {
      await deleteFeatureFlag(flagData.identifier, { queryParams })
      showSuccess(getString('cf.featureFlags.archiving.archiveSuccess'))
      if (backToListingPage) {
        backToListingPage()
      } else if (refetchFlags) {
        refetchFlags()
      }
      setValidationFlagIdentifier('')
      closeDialog()
    } catch (e) {
      handleResponseError(e)
    }
  }

  const { openDialog, closeDialog } = useConfirmationDialog({
    intent: Intent.DANGER,
    titleText: getString('cf.featureFlags.archiving.archiveFlag'),
    contentText: (
      <Layout.Vertical spacing="small">
        <String
          stringID="cf.featureFlags.archiving.warningDescription"
          vars={{ flagIdentifier: flagData.identifier }}
          useRichText
        />
        <Text>{getString('cf.featureFlags.archiving.confirmFlag')}</Text>
        <TextInput
          onPaste={e => e.preventDefault()}
          errorText={
            !isAnIdentifierMatch && validationFlagIdentifier !== ''
              ? getString('cf.featureFlags.archiving.mismatchIdentifierError')
              : undefined
          }
          intent={!isAnIdentifierMatch && validationFlagIdentifier !== '' ? Intent.DANGER : Intent.PRIMARY}
          aria-label={getString('cf.featureFlags.archiving.confirmFlag')}
          placeholder={flagData?.identifier}
          value={validationFlagIdentifier}
          onChange={e => {
            setValidationFlagIdentifier((e?.target as HTMLInputElement)?.value)
            setIsAnIdentifierMatch((e?.target as HTMLInputElement)?.value === flagData?.identifier)
          }}
        />
      </Layout.Vertical>
    ),
    customButtons: (
      <ArchiveFlagButtons
        identifierMatch={isAnIdentifierMatch}
        onClose={() => {
          closeDialog()
        }}
        onArchive={handleArchive}
      />
    )
  })

  return { openDialog }
}

export default useArchiveFlagDialog
