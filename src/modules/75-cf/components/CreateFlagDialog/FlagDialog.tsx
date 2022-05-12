/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Dialog } from '@blueprintjs/core'
import { Button, Container, Text, Icon } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ExitModalActions, Category, FeatureActions } from '@common/constants/TrackingConstants'
import { FlagTypeVariations } from './FlagDialogUtils'
import FlagWizard from '../CreateFlagWizard/FlagWizard'
import FlagTypeElement from '../CreateFlagType/FlagTypeElement'
import CreateFlagButton from '../CreateFlagButton/CreateFlagButton'
import css from './FlagDialog.module.scss'

export interface FlagModalProps {
  disabled?: boolean
  environment: string
}

const FlagModal: React.FC<FlagModalProps> = ({ disabled, environment }) => {
  const { getString } = useStrings()
  const [flagTypeClicked, setFlagTypeClicked] = useState(false)
  const [flagTypeView, setFlagTypeView] = useState('')

  const booleanFlagBtn = (typeOfFlag: boolean): void => {
    setFlagTypeClicked(typeOfFlag)
    setFlagTypeView(FlagTypeVariations.booleanFlag)
  }

  const multiFlagBtn = (typeOfFlag: boolean): void => {
    setFlagTypeClicked(typeOfFlag)
    setFlagTypeView(FlagTypeVariations.multiFlag)
  }

  const toggleFlagType = (newFlagType: string): void => {
    setFlagTypeView(newFlagType)
  }

  const { trackEvent } = useTelemetry()

  const FeatureSelect = (): React.ReactElement => {
    useEffect(() => {
      trackEvent(FeatureActions.SelectFeatureFlagType, {
        category: Category.FEATUREFLAG
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
      <Container className={css.typeFlagContainer} padding="huge">
        <Text color={Color.WHITE} margin={{ bottom: 'small' }} style={{ fontSize: '24px' }}>
          {getString('cf.featureFlags.typeOfFlag')}
        </Text>
        <Text font="small" color={Color.WHITE} margin={{ bottom: 'xxxlarge' }}>
          {getString('cf.featureFlags.startVariation')}
        </Text>
        <Container className={css.typeFlagBtns}>
          <FlagTypeElement
            type={FlagTypeVariations.booleanFlag}
            text={getString('cf.boolean')}
            textDesc={getString('cf.featureFlags.booleanBtnText')}
            typeOfFlagFnc={booleanFlagBtn}
          >
            <Icon name="full-circle" color={Color.BLUE_800} />
            <Icon name="full-circle" color={Color.BLUE_500} className={css.iconMl} />
          </FlagTypeElement>

          <FlagTypeElement
            type={FlagTypeVariations.multiFlag}
            text={getString('cf.multivariate')}
            textDesc={getString('cf.featureFlags.multiBtnText')}
            typeOfFlagFnc={multiFlagBtn}
          >
            <Icon name="full-circle" color={Color.BLUE_800} />
            <Icon name="full-circle" color={Color.BLUE_500} className={css.iconMl} />
            <Icon name="full-circle" color={Color.YELLOW_700} className={css.iconMl} />
            <Icon name="small-plus" color={Color.GREY_600} className={css.iconMl} />
          </FlagTypeElement>
        </Container>
      </Container>
    )
  }

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          setFlagTypeClicked(false)
          hideModal()
        }}
        className={css.modal}
      >
        {flagTypeClicked ? (
          <FlagWizard
            flagTypeView={flagTypeView}
            environmentIdentifier={environment}
            toggleFlagType={toggleFlagType}
            hideModal={hideModal}
            goBackToTypeSelections={() => {
              trackEvent(FeatureActions.BackToSelectFeatureFlagType, {
                category: Category.FEATUREFLAG
              })
              setFlagTypeClicked(false)
            }}
          />
        ) : (
          <FeatureSelect />
        )}

        <Button
          minimal
          icon="small-cross"
          iconProps={{ size: 25 }}
          onClick={() => {
            setFlagTypeClicked(false)
            trackEvent(ExitModalActions.ExitByClose, {
              category: Category.FEATUREFLAG
            })
            hideModal()
          }}
          className={css.closeIcon}
        />
      </Dialog>
    )
  }, [flagTypeClicked, flagTypeView])

  return <CreateFlagButton disabled={disabled} showModal={showModal} />
}

export default FlagModal
