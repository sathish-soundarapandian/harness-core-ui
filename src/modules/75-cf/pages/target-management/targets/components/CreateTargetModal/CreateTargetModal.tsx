/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, FormEvent, useCallback, useState } from 'react'
import { Button, ButtonVariation, Container, Layout, ModalDialog, Text } from '@harness/uicore'
import { Radio, RadioGroup, Spinner } from '@blueprintjs/core'
import { String, useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import FileUpload from './FileUpload'
import TargetList from './TargetList'
import filterTargets from './filterTargets'
import type { TargetData } from './types'

const getEmptyTarget = (): TargetData => ({ name: '', identifier: '' })

export interface CreateTargetModalProps {
  loading: boolean
  onSubmitTargets: (targets: TargetData[], hideModal: () => void) => void
  onSubmitTargetFile: (file: File, hideModal: () => void) => void
  isLinkVariation?: boolean
}

const CreateTargetModal: FC<CreateTargetModalProps> = ({
  loading,
  onSubmitTargets,
  onSubmitTargetFile,
  isLinkVariation
}) => {
  const [isModalDisplayed, setIsModelDisplayed] = useState<boolean>(false)

  const hideModal = useCallback(() => setIsModelDisplayed(false), [])
  const openModal = useCallback(() => setIsModelDisplayed(true), [])

  const LIST = 'list'
  const UPLOAD = 'upload'
  const [isList, setIsList] = useState(true)
  const [targets, setTargets] = useState<TargetData[]>([getEmptyTarget()])
  const [targetFile, setTargetFile] = useState<File>()
  const addDisabled = filterTargets(targets).length === 0 && !targetFile
  const { getString } = useStrings()
  const { activeEnvironment } = useActiveEnvironment()

  const { isPlanEnforcementEnabled } = usePlanEnforcement()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  const handleChange = useCallback((e: FormEvent<HTMLInputElement>): void => {
    setIsList((e.target as HTMLInputElement).value === LIST)
    setTargets([getEmptyTarget()])
    setTargetFile(undefined)
  }, [])

  const handleTargetAdd = useCallback((): void => {
    setTargets([...targets, getEmptyTarget()])
  }, [targets])

  const handleTargetRemove = useCallback(
    (index: number): void => {
      targets.splice(index, 1)
      setTargets([...targets])
    },
    [targets]
  )

  const handleTargetChange = useCallback(
    (idx: number, newData: TargetData): void => {
      targets[idx] = newData
      setTargets([...targets])
    },
    [targets]
  )

  const handleSubmit = useCallback((): void => {
    if (!isList && targetFile) {
      // submit target csv
      onSubmitTargetFile(targetFile, () => {
        hideModal()
        setTargetFile(undefined)
      })
    } else {
      // submit manually typed targets
      const filteredTargets = filterTargets(targets)
      if (filteredTargets.length) {
        onSubmitTargets(filteredTargets, () => {
          hideModal()
          setTargets([getEmptyTarget()])
          setTargetFile(undefined)
        })
      }
    }
  }, [hideModal, isList, onSubmitTargetFile, onSubmitTargets, targetFile, targets])

  const handleCancel = useCallback((): void => {
    setIsList(true)
    setTargets([getEmptyTarget()])
    setTargetFile(undefined)
    hideModal()
  }, [hideModal])

  return (
    <>
      <RbacButton
        icon="plus"
        intent="primary"
        variation={isLinkVariation ? ButtonVariation.LINK : ButtonVariation.PRIMARY}
        text={getString('cf.targets.create')}
        onClick={openModal}
        permission={{
          resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
          permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
        }}
        {...planEnforcementProps}
      />

      <ModalDialog
        isOpen={isModalDisplayed}
        height={555}
        width={750}
        enforceFocus={false}
        onClose={hideModal}
        title={getString('cf.targets.addTargetsLabel')}
        footer={
          <Layout.Horizontal spacing="small">
            <Button
              variation={ButtonVariation.PRIMARY}
              disabled={addDisabled || loading}
              text={getString('add')}
              intent="primary"
              onClick={handleSubmit}
            />
            <Button
              variation={ButtonVariation.TERTIARY}
              disabled={loading}
              text={getString('cancel')}
              onClick={handleCancel}
            />
            {loading && <Spinner size={16} />}
          </Layout.Horizontal>
        }
      >
        <RadioGroup name="modalVariant" selectedValue={isList ? LIST : UPLOAD} onChange={handleChange}>
          <Radio name="modalVariant" label={getString('cf.targets.list')} value={LIST} />
          {isList && (
            <Container margin={{ left: 'xlarge', bottom: 'medium' }}>
              <TargetList
                targets={targets}
                onAdd={handleTargetAdd}
                onRemove={handleTargetRemove}
                onChange={handleTargetChange}
              />
            </Container>
          )}

          <Radio name="modalVariant" label={getString('cf.targets.upload')} value={UPLOAD} />
          {!isList && (
            <Layout.Vertical spacing="small" margin={{ left: 'xlarge' }}>
              <Text tooltip={getString('cf.targets.uploadHelp')} rightIcon="question">
                <String stringID="cf.targets.uploadHeadline" useRichText />
              </Text>
              <FileUpload onChange={setTargetFile} />
            </Layout.Vertical>
          )}
        </RadioGroup>
      </ModalDialog>
    </>
  )
}

export default CreateTargetModal
