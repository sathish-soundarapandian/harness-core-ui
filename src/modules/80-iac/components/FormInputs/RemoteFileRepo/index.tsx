import React, { useState } from 'react'
import cx from 'classnames'
import { get } from 'lodash-es'
import { AllowedTypes, Button, Color, getMultiTypeFromValue, Label, Layout, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import RemoteWizard from '../RemoteWizard'
import styles from './styles.module.scss'

type RemoteFileRepoProps = {
    initialValues: any
    onSubmit: (data: any) => void
    stepOneName: string
    stepTwoName: string
    expressions: string[]
    allowableTypes: AllowedTypes
    readonly: boolean
}

const RemoteFileRepo = ({
    initialValues,
    onSubmit,
    stepOneName,
    stepTwoName,
    expressions,
    allowableTypes,
    readonly
}: RemoteFileRepoProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [connectorView, setConnectorView] = useState<boolean>(false)
    const { getString } = useStrings()
    const handleConnectorViewChange = (isConnectorView: boolean): void => {
        setConnectorView(isConnectorView)
    }
    const onClose = (): void => {
        setIsOpen(false)
        setConnectorView(false)
    }
    const path = get(initialValues, 'spec.folderPath')
    return (
        <>
            <Layout.Vertical>
                <Label style={{ color: Color.GREY_900 }} className={styles.label}>
                    {getString('iac.pipelineSteps.configureRemoteFile')}
                </Label>
                <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
                    <div className={cx(styles.remoteFile, styles.addMarginBottom)} onClick={() => setIsOpen(true)}>
                        <>
                            <a className={cx(styles.fullWidth, styles.placeholder)}>
                                {getMultiTypeFromValue(path) === MultiTypeInputType.RUNTIME
                                    ? `/${path}`
                                    : path
                                        ? path
                                        : getString('iac.pipelineSteps.remoteRepoPlaceHolder')}
                            </a>
                            <Button minimal icon="Edit" withoutBoxShadow iconProps={{ size: 16 }} withoutCurrentColor={true} />
                        </>
                    </div>
                </Layout.Horizontal>
            </Layout.Vertical>
            <RemoteWizard
                handleConnectorViewChange={handleConnectorViewChange}
                initialValues={initialValues}
                expressions={expressions}
                allowableTypes={allowableTypes}
                newConnectorView={connectorView}
                isReadonly={readonly}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={data => {
                    onSubmit(data)
                    onClose()
                }}
                stepOneName={stepOneName}
                stepTwoName={stepTwoName}
            />
        </>
    )
}

export default RemoteFileRepo
