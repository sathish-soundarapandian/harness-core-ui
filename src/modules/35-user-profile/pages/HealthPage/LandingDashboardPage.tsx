// import React, { useEffect, useState } from "react"
// import ReactTimeago from 'react-timeago'
// import { set } from 'lodash-es'
// import { useParams, useHistory } from 'react-router-dom'
// import {
//   Button,
//   Container,
//   Text,
//   Layout,
//   Popover,
//   Card,
//   useToaster,
//   useConfirmationDialog,
//   Icon
// } from '@wings-software/uicore'
// import { Color } from '@harness/design-system'
// import { Menu, MenuItem, Classes, Position } from '@blueprintjs/core'
// import { useStrings } from 'framework/strings'
// import { useDeleteHealthGroupByIdentifier, HealthGroupDetails } from 'services/portal'
// import routes from '@common/RouteDefinitions'
// import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
// import { healthTypeToIcon } from '@common/utils/healthUtils'
// import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
// import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
// import { ResourceType } from '@rbac/interfaces/ResourceType'
// import { usePermission } from '@rbac/hooks/usePermission'
// import css from './HealthsPage.module.scss'
// const columnWidths = {
//   icon: '80px',
//   name: '25%',
//   tags: '20%',
//   instances: '20%',
//   heartbeat: 'calc(15% - 40px)',
//   status: 'calc(15% - 40px)',
//   actions: '5%'
// }
// const HealthListingHeader = () => {
//   const { getString } = useStrings()
//   return (
//     <Layout.Horizontal className={css.healthListHeader}>
//       <div key="del-name" style={{ width: columnWidths.name }}>
//       </div>
//       <div key="status" style={{ width: columnWidths.status }}>
//       </div>
//     </Layout.Horizontal>
//   )
// }
// const UsingFetch = () => {
//   const [HealthServices,setHealthServices] = useState([])
//   const fetchData = () => {
//     // GetAllHealth


//     fetch("https://localhost:8181/api/allhealth")
//       .then(response => { 
         
//         return response.json()
//       })
//       .then(data => {
//         setHealthServices(data) 

//       })
//   }

//   useEffect(() => {
//     fetchData()

//   }, [])

//   return (

//     // <Container className={css.healthListContainer}>
//     <div>
//     {HealthServices.length > 0 && (
//       <ul>
//       {HealthServices.map(healthservice => (    

//       // <Card className={css.healthItemContainer}>
//       //   <Layout.Horizontal className={css.healthItemSubcontainer}>
//       //     <Layout.Horizontal width={columnWidths.name}>
//       //       <Layout.Vertical>
//       //         <Layout.Horizontal spacing="small" data-testid={healthservice.serviceName}>
//       //           <Text color={Color.BLACK}>{healthservice.serviceName}</Text>
//       //         </Layout.Horizontal>
//       //       </Layout.Vertical>
//       //     </Layout.Horizontal>

//       //     <Layout.Vertical width={columnWidths.status}>            
//       //       <Text >
//       //         {healthservice.status}
//       //       </Text>
//       //     </Layout.Vertical>
//       //   </Layout.Horizontal>
//       // </Card>
//       <li> {healthservice.serviceName} {healthservice.status}</li>
//       )
//       )
//       }
      
//         </ul>
//     )
//     }
//     {/* </Container> */}
//     </div>



//   )
// }

// export default UsingFetch