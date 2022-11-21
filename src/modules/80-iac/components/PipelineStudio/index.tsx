import React from 'react'
import { IACMStudioProvider } from './Provider'
import { IacComponentMounter } from '../IacApp'

export const IACMStudio = (props: any) => {
    console.log('IACMStudio: ', props);
    return (
        <IACMStudioProvider>
            <IacComponentMounter component='IacStudio' childProps={props} />
        </IACMStudioProvider>
    )
}