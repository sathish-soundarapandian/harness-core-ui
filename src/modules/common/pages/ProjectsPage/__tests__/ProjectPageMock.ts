export const projectPageMock = {
  data: {
    status: 'SUCCESS',
    data: {
      pageCount: 1,
      itemCount: 6,
      pageSize: 50,
      content: [
        {
          accountIdentifier: 'testAcc',
          orgIdentifier: 'testOrg',
          identifier: 'test',
          name: 'test',
          color: '#e6b800',
          modules: ['CD'],
          description: 'test',
          tags: ['tag1', 'tag2'],
          owners: ['testAcc'],
          lastModifiedAt: 1599715118275
        },
        {
          accountIdentifier: 'testAcc',
          orgIdentifier: 'Cisco_Meraki',
          identifier: 'Online_Banking',
          name: 'Online Banking',
          color: '#1c1c28',
          modules: ['CD', 'CV'],
          description: 'UI for the Payment',
          owners: ['testAcc'],
          tags: ['UI', 'Production'],
          lastModifiedAt: 1599715118275
        },
        {
          accountIdentifier: 'testAcc',
          orgIdentifier: 'Cisco_Meraki',
          identifier: 'Portal',
          name: 'Portal',
          color: '#ff8800',
          modules: ['CV'],
          description: 'Online users',
          owners: ['testAcc'],
          tags: ['prod', 'ui', 'customer'],
          lastModifiedAt: 1599715155888
        },
        {
          accountIdentifier: 'testAcc',
          orgIdentifier: 'Cisco_Prime',
          identifier: 'Project_1',
          name: 'Project 1',
          color: '#e6b800',
          modules: [],
          description: '',
          owners: ['testAcc'],
          tags: [],
          lastModifiedAt: 1599740365287
        },
        {
          accountIdentifier: 'testAcc',
          orgIdentifier: 'Cisco_Prime',
          identifier: 'Project_Demo',
          name: 'Project Demo',
          color: '#004fc4',
          modules: [],
          description: 'Demo project',
          owners: ['testAcc'],
          tags: ['demo', 'temporary'],
          lastModifiedAt: 1599730109213
        },
        {
          accountIdentifier: 'testAcc',
          orgIdentifier: 'Harness',
          identifier: 'Drone_Data_Supplier',
          name: 'Drone Data Supplier',
          color: '#e67a00',
          modules: ['CD'],
          description: 'Drone',
          owners: ['testAcc'],
          tags: ['prod', 'master'],
          lastModifiedAt: 1599715251972
        },
        {
          accountIdentifier: 'testAcc',
          orgIdentifier: 'Harness',
          identifier: 'Swagger',
          name: 'Swagger',
          color: '#e6b800',
          modules: [],
          description: 'Swagger 2.0',
          owners: ['testAcc'],
          tags: ['ui', 'backend'],
          lastModifiedAt: 1599715290787
        }
      ],
      pageIndex: 0,
      empty: false
    },
    metaData: undefined,
    correlationId: '370210dc-a345-42fa-b3cf-69bd64eb5073'
  },
  loading: false
}
