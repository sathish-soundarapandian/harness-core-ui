/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect} from 'react'

import {
  Container,
  Layout,
} from '@wings-software/uicore'

import HealthListingItem, { HealthListingHeader } from './HealthListingItem'

import css from './HealthPage.module.scss'
import type { HealthServices } from 'services/portal'
import { getConfig } from 'services/config'
import { isOnPrem } from '@common/utils/utils'


export const HealthServicesListing = () => {

  
  const [HealthService,setHealthServices] = useState([])
  const fetchData = () => {
    // GetAllHealth
  
  const path = getConfig('api/allhealth')
    fetch(path)
      .then(response => { 
         
        return response.json()
      })
      .then(data => {
        setHealthServices(data) 

      })
  }

  useEffect(() => {
    fetchData()

  }, [])

  const isonprem = isOnPrem()


  return (
    
    <Container height="100%">
      {isonprem ? <h1>This is not for SaaS</h1> : 
      <Layout.Vertical className={css.listBody}>
      <Container className={css.healthListContainer}>
        {
          <Container width="100%">
            <HealthListingHeader />
            {HealthService.map((healthservice: HealthServices) => (
              <HealthListingItem                  
               healthservice={healthservice}                 
              />
            ))}
          </Container>
        }
      </Container>
      </Layout.Vertical>
      }
      
    </Container>
  )
}
export default HealthServicesListing
