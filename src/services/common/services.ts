/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import gql from 'graphql-tag'
import * as Urql from 'urql'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export const CallOutFragmentDoc = gql`
  fragment CallOut on ComponentPricingPageCallOut {
    title
    desc
  }
`
export const PlansFragmentDoc = gql`
  fragment Plans on ComponentPricingPagePlansZone {
    id
    title
    desc
    img {
      url
      width
      height
    }
    price
    yearlyPrice
    unit
    link
    featureListZone {
      id
      title
      link
    }
    buttonText
    primaryButton
    comingSoon
    priceTips
    priceTerm
    priceTermTips
    yearlyPriceTips
    yearlyPriceTerm
    yearlyPriceTermTips
    support
    featureTitle
    unitTips
  }
`
export const FeatureCaptionFragmentDoc = gql`
  fragment FeatureCaption on ComponentPricingPageFeatureCaption {
    id
    title
    btnText
    btnLink
    primaryButton
  }
`
export const FeatureGroupFragmentDoc = gql`
  fragment FeatureGroup on ComponentPricingPageFeatureGroup {
    id
    title
    detailedFeature {
      id
      title
      link
      communityValue
      communityText
      freeValue
      freeText
      teamValue
      teamText
      enterpriseValue
      enterpriseText
    }
  }
`
export const FaqFragmentDoc = gql`
  fragment Faq on ComponentPricingPageFaq {
    id
    faqTitle
    faqAnswer
    anchor
  }
`
export const FetchPlansDocument = gql`
  query fetchPlans {
    pricing {
      id
      published_at
      created_at
      updated_at
      hero {
        title
        desc
        subTitle
      }
      ciPlans {
        ...Plans
      }
      ciSaasPlans {
        ...Plans
      }
      cdPlans {
        ...Plans
      }
      ccPlans {
        ...Plans
      }
      ffPlans {
        ...Plans
      }
      srmPlans {
        ...Plans
      }
      ciFeatureCaption {
        ...FeatureCaption
      }
      ciFeatureGroup {
        ...FeatureGroup
      }
      cdFeatureCaption {
        ...FeatureCaption
      }
      cdFeatureGroup {
        ...FeatureGroup
      }
      ccFeatureCaption {
        ...FeatureCaption
      }
      ccFeatureGroup {
        ...FeatureGroup
      }
      ffFeatureCaption {
        ...FeatureCaption
      }
      ffFeatureGroup {
        ...FeatureGroup
      }
      ciSaasFeatureCaption {
        ...FeatureCaption
      }
      ciSaasFeatureGroup {
        ...FeatureGroup
      }
      srmFeatureCaption {
        ...FeatureCaption
      }
      srmFeatureGroup {
        ...FeatureGroup
      }
      cdFaq {
        ...Faq
      }
      ciFaq {
        ...Faq
      }
      ccFaq {
        ...Faq
      }
      ffFaq {
        ...Faq
      }
      caseStudies {
        id
        quote
        client
        link
        clientPic {
          width
          height
          url
        }
      }
      openSource {
        ...CallOut
      }
    }
  }
  ${PlansFragmentDoc}
  ${FeatureCaptionFragmentDoc}
  ${FeatureGroupFragmentDoc}
  ${FaqFragmentDoc}
  ${CallOutFragmentDoc}
`

export function useFetchPlansQuery(options?: Omit<Urql.UseQueryArgs<FetchPlansQueryVariables>, 'query'>) {
  return Urql.useQuery<FetchPlansQuery>({ query: FetchPlansDocument, ...options })
}
export type CallOutFragment = { __typename?: 'ComponentPricingPageCallOut'; title: string | null; desc: string | null }

export type PlansFragment = {
  __typename?: 'ComponentPricingPagePlansZone'
  id: string
  title: string | null
  desc: string | null
  price: string | null
  yearlyPrice: string | null
  unit: string | null
  link: string | null
  buttonText: string | null
  primaryButton: boolean | null
  comingSoon: boolean | null
  priceTips: string | null
  priceTerm: string | null
  priceTermTips: string | null
  yearlyPriceTips: string | null
  yearlyPriceTerm: string | null
  yearlyPriceTermTips: string | null
  support: string | null
  featureTitle: string | null
  unitTips: string | null
  img: { __typename?: 'UploadFile'; url: string; width: number | null; height: number | null } | null
  featureListZone: Array<{
    __typename?: 'ComponentPageFeatureLIstZone'
    id: string
    title: string | null
    link: string | null
  } | null> | null
}

export type FeatureCaptionFragment = {
  __typename?: 'ComponentPricingPageFeatureCaption'
  id: string
  title: string | null
  btnText: string | null
  btnLink: string | null
  primaryButton: boolean | null
}

export type FeatureGroupFragment = {
  __typename?: 'ComponentPricingPageFeatureGroup'
  id: string
  title: string | null
  detailedFeature: Array<{
    __typename?: 'ComponentPricingPageDetailedFeature'
    id: string
    title: string | null
    link: string | null
    communityValue: Enum_Componentpricingpagedetailedfeature_Communityvalue | null
    communityText: string | null
    freeValue: Enum_Componentpricingpagedetailedfeature_Freevalue | null
    freeText: string | null
    teamValue: Enum_Componentpricingpagedetailedfeature_Teamvalue | null
    teamText: string | null
    enterpriseValue: Enum_Componentpricingpagedetailedfeature_Enterprisevalue | null
    enterpriseText: string | null
  } | null> | null
}

export type FaqFragment = {
  __typename?: 'ComponentPricingPageFaq'
  id: string
  faqTitle: string | null
  faqAnswer: string | null
  anchor: string | null
}

export type FetchPlansQueryVariables = Exact<{ [key: string]: never }>

export type FetchPlansQuery = {
  __typename?: 'Query'
  pricing: {
    __typename?: 'Pricing'
    id: string
    published_at: any | null
    created_at: any
    updated_at: any
    hero: {
      __typename?: 'ComponentPageMiniTitleZone'
      title: string | null
      desc: string | null
      subTitle: string | null
    } | null
    ciPlans: Array<{
      __typename?: 'ComponentPricingPagePlansZone'
      id: string
      title: string | null
      desc: string | null
      price: string | null
      yearlyPrice: string | null
      unit: string | null
      link: string | null
      buttonText: string | null
      primaryButton: boolean | null
      comingSoon: boolean | null
      priceTips: string | null
      priceTerm: string | null
      priceTermTips: string | null
      yearlyPriceTips: string | null
      yearlyPriceTerm: string | null
      yearlyPriceTermTips: string | null
      support: string | null
      featureTitle: string | null
      unitTips: string | null
      img: { __typename?: 'UploadFile'; url: string; width: number | null; height: number | null } | null
      featureListZone: Array<{
        __typename?: 'ComponentPageFeatureLIstZone'
        id: string
        title: string | null
        link: string | null
      } | null> | null
    } | null> | null
    ciSaasPlans: Array<{
      __typename?: 'ComponentPricingPagePlansZone'
      id: string
      title: string | null
      desc: string | null
      price: string | null
      yearlyPrice: string | null
      unit: string | null
      link: string | null
      buttonText: string | null
      primaryButton: boolean | null
      comingSoon: boolean | null
      priceTips: string | null
      priceTerm: string | null
      priceTermTips: string | null
      yearlyPriceTips: string | null
      yearlyPriceTerm: string | null
      yearlyPriceTermTips: string | null
      support: string | null
      featureTitle: string | null
      unitTips: string | null
      img: { __typename?: 'UploadFile'; url: string; width: number | null; height: number | null } | null
      featureListZone: Array<{
        __typename?: 'ComponentPageFeatureLIstZone'
        id: string
        title: string | null
        link: string | null
      } | null> | null
    } | null> | null
    cdPlans: Array<{
      __typename?: 'ComponentPricingPagePlansZone'
      id: string
      title: string | null
      desc: string | null
      price: string | null
      yearlyPrice: string | null
      unit: string | null
      link: string | null
      buttonText: string | null
      primaryButton: boolean | null
      comingSoon: boolean | null
      priceTips: string | null
      priceTerm: string | null
      priceTermTips: string | null
      yearlyPriceTips: string | null
      yearlyPriceTerm: string | null
      yearlyPriceTermTips: string | null
      support: string | null
      featureTitle: string | null
      unitTips: string | null
      img: { __typename?: 'UploadFile'; url: string; width: number | null; height: number | null } | null
      featureListZone: Array<{
        __typename?: 'ComponentPageFeatureLIstZone'
        id: string
        title: string | null
        link: string | null
      } | null> | null
    } | null> | null
    ccPlans: Array<{
      __typename?: 'ComponentPricingPagePlansZone'
      id: string
      title: string | null
      desc: string | null
      price: string | null
      yearlyPrice: string | null
      unit: string | null
      link: string | null
      buttonText: string | null
      primaryButton: boolean | null
      comingSoon: boolean | null
      priceTips: string | null
      priceTerm: string | null
      priceTermTips: string | null
      yearlyPriceTips: string | null
      yearlyPriceTerm: string | null
      yearlyPriceTermTips: string | null
      support: string | null
      featureTitle: string | null
      unitTips: string | null
      img: { __typename?: 'UploadFile'; url: string; width: number | null; height: number | null } | null
      featureListZone: Array<{
        __typename?: 'ComponentPageFeatureLIstZone'
        id: string
        title: string | null
        link: string | null
      } | null> | null
    } | null> | null
    ffPlans: Array<{
      __typename?: 'ComponentPricingPagePlansZone'
      id: string
      title: string | null
      desc: string | null
      price: string | null
      yearlyPrice: string | null
      unit: string | null
      link: string | null
      buttonText: string | null
      primaryButton: boolean | null
      comingSoon: boolean | null
      priceTips: string | null
      priceTerm: string | null
      priceTermTips: string | null
      yearlyPriceTips: string | null
      yearlyPriceTerm: string | null
      yearlyPriceTermTips: string | null
      support: string | null
      featureTitle: string | null
      unitTips: string | null
      img: { __typename?: 'UploadFile'; url: string; width: number | null; height: number | null } | null
      featureListZone: Array<{
        __typename?: 'ComponentPageFeatureLIstZone'
        id: string
        title: string | null
        link: string | null
      } | null> | null
    } | null> | null
    srmPlans: Array<{
      __typename?: 'ComponentPricingPagePlansZone'
      id: string
      title: string | null
      desc: string | null
      price: string | null
      yearlyPrice: string | null
      unit: string | null
      link: string | null
      buttonText: string | null
      primaryButton: boolean | null
      comingSoon: boolean | null
      priceTips: string | null
      priceTerm: string | null
      priceTermTips: string | null
      yearlyPriceTips: string | null
      yearlyPriceTerm: string | null
      yearlyPriceTermTips: string | null
      support: string | null
      featureTitle: string | null
      unitTips: string | null
      img: { __typename?: 'UploadFile'; url: string; width: number | null; height: number | null } | null
      featureListZone: Array<{
        __typename?: 'ComponentPageFeatureLIstZone'
        id: string
        title: string | null
        link: string | null
      } | null> | null
    } | null> | null
    ciFeatureCaption: Array<{
      __typename?: 'ComponentPricingPageFeatureCaption'
      id: string
      title: string | null
      btnText: string | null
      btnLink: string | null
      primaryButton: boolean | null
    } | null> | null
    ciFeatureGroup: Array<{
      __typename?: 'ComponentPricingPageFeatureGroup'
      id: string
      title: string | null
      detailedFeature: Array<{
        __typename?: 'ComponentPricingPageDetailedFeature'
        id: string
        title: string | null
        link: string | null
        communityValue: Enum_Componentpricingpagedetailedfeature_Communityvalue | null
        communityText: string | null
        freeValue: Enum_Componentpricingpagedetailedfeature_Freevalue | null
        freeText: string | null
        teamValue: Enum_Componentpricingpagedetailedfeature_Teamvalue | null
        teamText: string | null
        enterpriseValue: Enum_Componentpricingpagedetailedfeature_Enterprisevalue | null
        enterpriseText: string | null
      } | null> | null
    } | null> | null
    cdFeatureCaption: Array<{
      __typename?: 'ComponentPricingPageFeatureCaption'
      id: string
      title: string | null
      btnText: string | null
      btnLink: string | null
      primaryButton: boolean | null
    } | null> | null
    cdFeatureGroup: Array<{
      __typename?: 'ComponentPricingPageFeatureGroup'
      id: string
      title: string | null
      detailedFeature: Array<{
        __typename?: 'ComponentPricingPageDetailedFeature'
        id: string
        title: string | null
        link: string | null
        communityValue: Enum_Componentpricingpagedetailedfeature_Communityvalue | null
        communityText: string | null
        freeValue: Enum_Componentpricingpagedetailedfeature_Freevalue | null
        freeText: string | null
        teamValue: Enum_Componentpricingpagedetailedfeature_Teamvalue | null
        teamText: string | null
        enterpriseValue: Enum_Componentpricingpagedetailedfeature_Enterprisevalue | null
        enterpriseText: string | null
      } | null> | null
    } | null> | null
    ccFeatureCaption: Array<{
      __typename?: 'ComponentPricingPageFeatureCaption'
      id: string
      title: string | null
      btnText: string | null
      btnLink: string | null
      primaryButton: boolean | null
    } | null> | null
    ccFeatureGroup: Array<{
      __typename?: 'ComponentPricingPageFeatureGroup'
      id: string
      title: string | null
      detailedFeature: Array<{
        __typename?: 'ComponentPricingPageDetailedFeature'
        id: string
        title: string | null
        link: string | null
        communityValue: Enum_Componentpricingpagedetailedfeature_Communityvalue | null
        communityText: string | null
        freeValue: Enum_Componentpricingpagedetailedfeature_Freevalue | null
        freeText: string | null
        teamValue: Enum_Componentpricingpagedetailedfeature_Teamvalue | null
        teamText: string | null
        enterpriseValue: Enum_Componentpricingpagedetailedfeature_Enterprisevalue | null
        enterpriseText: string | null
      } | null> | null
    } | null> | null
    ffFeatureCaption: Array<{
      __typename?: 'ComponentPricingPageFeatureCaption'
      id: string
      title: string | null
      btnText: string | null
      btnLink: string | null
      primaryButton: boolean | null
    } | null> | null
    ffFeatureGroup: Array<{
      __typename?: 'ComponentPricingPageFeatureGroup'
      id: string
      title: string | null
      detailedFeature: Array<{
        __typename?: 'ComponentPricingPageDetailedFeature'
        id: string
        title: string | null
        link: string | null
        communityValue: Enum_Componentpricingpagedetailedfeature_Communityvalue | null
        communityText: string | null
        freeValue: Enum_Componentpricingpagedetailedfeature_Freevalue | null
        freeText: string | null
        teamValue: Enum_Componentpricingpagedetailedfeature_Teamvalue | null
        teamText: string | null
        enterpriseValue: Enum_Componentpricingpagedetailedfeature_Enterprisevalue | null
        enterpriseText: string | null
      } | null> | null
    } | null> | null
    ciSaasFeatureCaption: Array<{
      __typename?: 'ComponentPricingPageFeatureCaption'
      id: string
      title: string | null
      btnText: string | null
      btnLink: string | null
      primaryButton: boolean | null
    } | null> | null
    ciSaasFeatureGroup: Array<{
      __typename?: 'ComponentPricingPageFeatureGroup'
      id: string
      title: string | null
      detailedFeature: Array<{
        __typename?: 'ComponentPricingPageDetailedFeature'
        id: string
        title: string | null
        link: string | null
        communityValue: Enum_Componentpricingpagedetailedfeature_Communityvalue | null
        communityText: string | null
        freeValue: Enum_Componentpricingpagedetailedfeature_Freevalue | null
        freeText: string | null
        teamValue: Enum_Componentpricingpagedetailedfeature_Teamvalue | null
        teamText: string | null
        enterpriseValue: Enum_Componentpricingpagedetailedfeature_Enterprisevalue | null
        enterpriseText: string | null
      } | null> | null
    } | null> | null
    srmFeatureCaption: Array<{
      __typename?: 'ComponentPricingPageFeatureCaption'
      id: string
      title: string | null
      btnText: string | null
      btnLink: string | null
      primaryButton: boolean | null
    } | null> | null
    srmFeatureGroup: Array<{
      __typename?: 'ComponentPricingPageFeatureGroup'
      id: string
      title: string | null
      detailedFeature: Array<{
        __typename?: 'ComponentPricingPageDetailedFeature'
        id: string
        title: string | null
        link: string | null
        communityValue: Enum_Componentpricingpagedetailedfeature_Communityvalue | null
        communityText: string | null
        freeValue: Enum_Componentpricingpagedetailedfeature_Freevalue | null
        freeText: string | null
        teamValue: Enum_Componentpricingpagedetailedfeature_Teamvalue | null
        teamText: string | null
        enterpriseValue: Enum_Componentpricingpagedetailedfeature_Enterprisevalue | null
        enterpriseText: string | null
      } | null> | null
    } | null> | null
    cdFaq: Array<{
      __typename?: 'ComponentPricingPageFaq'
      id: string
      faqTitle: string | null
      faqAnswer: string | null
      anchor: string | null
    } | null> | null
    ciFaq: Array<{
      __typename?: 'ComponentPricingPageFaq'
      id: string
      faqTitle: string | null
      faqAnswer: string | null
      anchor: string | null
    } | null> | null
    ccFaq: Array<{
      __typename?: 'ComponentPricingPageFaq'
      id: string
      faqTitle: string | null
      faqAnswer: string | null
      anchor: string | null
    } | null> | null
    ffFaq: Array<{
      __typename?: 'ComponentPricingPageFaq'
      id: string
      faqTitle: string | null
      faqAnswer: string | null
      anchor: string | null
    } | null> | null
    caseStudies: Array<{
      __typename?: 'ComponentPageCaseStudyZone'
      id: string
      quote: string | null
      client: string | null
      link: string | null
      clientPic: { __typename?: 'UploadFile'; width: number | null; height: number | null; url: string } | null
    } | null> | null
    openSource: { __typename?: 'ComponentPricingPageCallOut'; title: string | null; desc: string | null } | null
  } | null
}

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: any
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any
  /** The `Long` scalar type represents 52-bit integers */
  Long: any
  /** A time string with format: HH:mm:ss.SSS */
  Time: any
  /** The `Upload` scalar type represents a file upload. */
  Upload: any
}

export type AboutUs = {
  __typename?: 'AboutUs'
  awards: Maybe<Array<Maybe<ComponentPageModules>>>
  coreValues: Maybe<Array<Maybe<ComponentPageModules>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  executiveTeam: Maybe<Array<Maybe<ComponentPageExecutiveZone>>>
  harnessOffices: Maybe<ComponentCompanyPageOfficesZone>
  hero: Maybe<ComponentPageTitleZone>
  id: Scalars['ID']
  investors: Maybe<ComponentPageSimpleZone>
  joinTeam: Maybe<ComponentPageTeamZone>
  offices: Maybe<Array<Maybe<ComponentCompanyPageAdressZone>>>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type AboutUsInput = {
  awards: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  coreValues: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  created_by: InputMaybe<Scalars['ID']>
  executiveTeam: InputMaybe<Array<InputMaybe<ComponentPageExecutiveZoneInput>>>
  harnessOffices: InputMaybe<ComponentCompanyPageOfficesZoneInput>
  hero: InputMaybe<ComponentPageTitleZoneInput>
  investors: InputMaybe<ComponentPageSimpleZoneInput>
  joinTeam: InputMaybe<ComponentPageTeamZoneInput>
  offices: InputMaybe<Array<InputMaybe<ComponentCompanyPageAdressZoneInput>>>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type AdminUser = {
  __typename?: 'AdminUser'
  firstname: Scalars['String']
  id: Scalars['ID']
  lastname: Scalars['String']
  username: Maybe<Scalars['String']>
}

export type BackgroundColor = {
  __typename?: 'BackgroundColor'
  colorCode: Maybe<Scalars['String']>
  colorName: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  id: Scalars['ID']
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type BackgroundColorAggregator = {
  __typename?: 'BackgroundColorAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type BackgroundColorConnection = {
  __typename?: 'BackgroundColorConnection'
  aggregate: Maybe<BackgroundColorAggregator>
  groupBy: Maybe<BackgroundColorGroupBy>
  values: Maybe<Array<Maybe<BackgroundColor>>>
}

export type BackgroundColorConnectionColorCode = {
  __typename?: 'BackgroundColorConnectionColorCode'
  connection: Maybe<BackgroundColorConnection>
  key: Maybe<Scalars['String']>
}

export type BackgroundColorConnectionColorName = {
  __typename?: 'BackgroundColorConnectionColorName'
  connection: Maybe<BackgroundColorConnection>
  key: Maybe<Scalars['String']>
}

export type BackgroundColorConnectionCreated_At = {
  __typename?: 'BackgroundColorConnectionCreated_at'
  connection: Maybe<BackgroundColorConnection>
  key: Maybe<Scalars['DateTime']>
}

export type BackgroundColorConnectionCreated_By = {
  __typename?: 'BackgroundColorConnectionCreated_by'
  connection: Maybe<BackgroundColorConnection>
  key: Maybe<Scalars['ID']>
}

export type BackgroundColorConnectionId = {
  __typename?: 'BackgroundColorConnectionId'
  connection: Maybe<BackgroundColorConnection>
  key: Maybe<Scalars['ID']>
}

export type BackgroundColorConnectionPublished_At = {
  __typename?: 'BackgroundColorConnectionPublished_at'
  connection: Maybe<BackgroundColorConnection>
  key: Maybe<Scalars['DateTime']>
}

export type BackgroundColorConnectionUpdated_At = {
  __typename?: 'BackgroundColorConnectionUpdated_at'
  connection: Maybe<BackgroundColorConnection>
  key: Maybe<Scalars['DateTime']>
}

export type BackgroundColorConnectionUpdated_By = {
  __typename?: 'BackgroundColorConnectionUpdated_by'
  connection: Maybe<BackgroundColorConnection>
  key: Maybe<Scalars['ID']>
}

export type BackgroundColorGroupBy = {
  __typename?: 'BackgroundColorGroupBy'
  colorCode: Maybe<Array<Maybe<BackgroundColorConnectionColorCode>>>
  colorName: Maybe<Array<Maybe<BackgroundColorConnectionColorName>>>
  created_at: Maybe<Array<Maybe<BackgroundColorConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<BackgroundColorConnectionCreated_By>>>
  id: Maybe<Array<Maybe<BackgroundColorConnectionId>>>
  published_at: Maybe<Array<Maybe<BackgroundColorConnectionPublished_At>>>
  updated_at: Maybe<Array<Maybe<BackgroundColorConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<BackgroundColorConnectionUpdated_By>>>
}

export type BackgroundColorInput = {
  colorCode: InputMaybe<Scalars['String']>
  colorName: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type CareerInput = {
  benefits: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  caseStudies: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  events: InputMaybe<Array<InputMaybe<ComponentPageTextImageZoneInput>>>
  harnessIs: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  joinTeam: InputMaybe<ComponentPageTeamZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type Careers = {
  __typename?: 'Careers'
  benefits: Maybe<Array<Maybe<ComponentPageModules>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  events: Maybe<Array<Maybe<ComponentPageTextImageZone>>>
  harnessIs: Maybe<Array<Maybe<ComponentPageModules>>>
  id: Scalars['ID']
  joinTeam: Maybe<ComponentPageTeamZone>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type CaseStudy = {
  __typename?: 'CaseStudy'
  background_color: Maybe<BackgroundColor>
  companyLogo: Maybe<UploadFile>
  company_size: Maybe<CompanySize>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  description: Maybe<Scalars['String']>
  harness_modules: Maybe<Array<Maybe<HarnessModule>>>
  id: Scalars['ID']
  industry: Maybe<Industry>
  integrations: Maybe<Array<Maybe<Integration>>>
  outcomes: Maybe<Array<Maybe<Outcome>>>
  published_at: Maybe<Scalars['DateTime']>
  title: Maybe<Scalars['String']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
  videoLink: Maybe<Scalars['String']>
}

export type CaseStudyHarness_ModulesArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type CaseStudyIntegrationsArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type CaseStudyOutcomesArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type CaseStudyAggregator = {
  __typename?: 'CaseStudyAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type CaseStudyConnection = {
  __typename?: 'CaseStudyConnection'
  aggregate: Maybe<CaseStudyAggregator>
  groupBy: Maybe<CaseStudyGroupBy>
  values: Maybe<Array<Maybe<CaseStudy>>>
}

export type CaseStudyConnectionBackground_Color = {
  __typename?: 'CaseStudyConnectionBackground_color'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['ID']>
}

export type CaseStudyConnectionCompanyLogo = {
  __typename?: 'CaseStudyConnectionCompanyLogo'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['ID']>
}

export type CaseStudyConnectionCompany_Size = {
  __typename?: 'CaseStudyConnectionCompany_size'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['ID']>
}

export type CaseStudyConnectionCreated_At = {
  __typename?: 'CaseStudyConnectionCreated_at'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['DateTime']>
}

export type CaseStudyConnectionCreated_By = {
  __typename?: 'CaseStudyConnectionCreated_by'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['ID']>
}

export type CaseStudyConnectionDescription = {
  __typename?: 'CaseStudyConnectionDescription'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['String']>
}

export type CaseStudyConnectionId = {
  __typename?: 'CaseStudyConnectionId'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['ID']>
}

export type CaseStudyConnectionIndustry = {
  __typename?: 'CaseStudyConnectionIndustry'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['ID']>
}

export type CaseStudyConnectionPublished_At = {
  __typename?: 'CaseStudyConnectionPublished_at'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['DateTime']>
}

export type CaseStudyConnectionTitle = {
  __typename?: 'CaseStudyConnectionTitle'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['String']>
}

export type CaseStudyConnectionUpdated_At = {
  __typename?: 'CaseStudyConnectionUpdated_at'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['DateTime']>
}

export type CaseStudyConnectionUpdated_By = {
  __typename?: 'CaseStudyConnectionUpdated_by'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['ID']>
}

export type CaseStudyConnectionVideoLink = {
  __typename?: 'CaseStudyConnectionVideoLink'
  connection: Maybe<CaseStudyConnection>
  key: Maybe<Scalars['String']>
}

export type CaseStudyGroupBy = {
  __typename?: 'CaseStudyGroupBy'
  background_color: Maybe<Array<Maybe<CaseStudyConnectionBackground_Color>>>
  companyLogo: Maybe<Array<Maybe<CaseStudyConnectionCompanyLogo>>>
  company_size: Maybe<Array<Maybe<CaseStudyConnectionCompany_Size>>>
  created_at: Maybe<Array<Maybe<CaseStudyConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<CaseStudyConnectionCreated_By>>>
  description: Maybe<Array<Maybe<CaseStudyConnectionDescription>>>
  id: Maybe<Array<Maybe<CaseStudyConnectionId>>>
  industry: Maybe<Array<Maybe<CaseStudyConnectionIndustry>>>
  published_at: Maybe<Array<Maybe<CaseStudyConnectionPublished_At>>>
  title: Maybe<Array<Maybe<CaseStudyConnectionTitle>>>
  updated_at: Maybe<Array<Maybe<CaseStudyConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<CaseStudyConnectionUpdated_By>>>
  videoLink: Maybe<Array<Maybe<CaseStudyConnectionVideoLink>>>
}

export type CaseStudyInput = {
  background_color: InputMaybe<Scalars['ID']>
  companyLogo: InputMaybe<Scalars['ID']>
  company_size: InputMaybe<Scalars['ID']>
  created_by: InputMaybe<Scalars['ID']>
  description: InputMaybe<Scalars['String']>
  harness_modules: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  industry: InputMaybe<Scalars['ID']>
  integrations: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  outcomes: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
  videoLink: InputMaybe<Scalars['String']>
}

export type CompanySize = {
  __typename?: 'CompanySize'
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  id: Scalars['ID']
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type CompanySizeAggregator = {
  __typename?: 'CompanySizeAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type CompanySizeConnection = {
  __typename?: 'CompanySizeConnection'
  aggregate: Maybe<CompanySizeAggregator>
  groupBy: Maybe<CompanySizeGroupBy>
  values: Maybe<Array<Maybe<CompanySize>>>
}

export type CompanySizeConnectionCreated_At = {
  __typename?: 'CompanySizeConnectionCreated_at'
  connection: Maybe<CompanySizeConnection>
  key: Maybe<Scalars['DateTime']>
}

export type CompanySizeConnectionCreated_By = {
  __typename?: 'CompanySizeConnectionCreated_by'
  connection: Maybe<CompanySizeConnection>
  key: Maybe<Scalars['ID']>
}

export type CompanySizeConnectionId = {
  __typename?: 'CompanySizeConnectionId'
  connection: Maybe<CompanySizeConnection>
  key: Maybe<Scalars['ID']>
}

export type CompanySizeConnectionItem = {
  __typename?: 'CompanySizeConnectionItem'
  connection: Maybe<CompanySizeConnection>
  key: Maybe<Scalars['String']>
}

export type CompanySizeConnectionPublished_At = {
  __typename?: 'CompanySizeConnectionPublished_at'
  connection: Maybe<CompanySizeConnection>
  key: Maybe<Scalars['DateTime']>
}

export type CompanySizeConnectionUpdated_At = {
  __typename?: 'CompanySizeConnectionUpdated_at'
  connection: Maybe<CompanySizeConnection>
  key: Maybe<Scalars['DateTime']>
}

export type CompanySizeConnectionUpdated_By = {
  __typename?: 'CompanySizeConnectionUpdated_by'
  connection: Maybe<CompanySizeConnection>
  key: Maybe<Scalars['ID']>
}

export type CompanySizeGroupBy = {
  __typename?: 'CompanySizeGroupBy'
  created_at: Maybe<Array<Maybe<CompanySizeConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<CompanySizeConnectionCreated_By>>>
  id: Maybe<Array<Maybe<CompanySizeConnectionId>>>
  item: Maybe<Array<Maybe<CompanySizeConnectionItem>>>
  published_at: Maybe<Array<Maybe<CompanySizeConnectionPublished_At>>>
  updated_at: Maybe<Array<Maybe<CompanySizeConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<CompanySizeConnectionUpdated_By>>>
}

export type CompanySizeInput = {
  created_by: InputMaybe<Scalars['ID']>
  item: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type CompetitorComparison = {
  __typename?: 'CompetitorComparison'
  caseStudy: Maybe<ComponentCompetitorComparisonPageComparisonCaseStudy>
  competitor: Maybe<Scalars['String']>
  competitorLogo: Maybe<UploadFile>
  competitorSummary: Maybe<ComponentCompetitorComparisonPageProductSummaryZone>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  detailedFeatureComparison: Maybe<ComponentCompetitorComparisonPageDetailedFeatureComparison>
  featureComparison: Maybe<ComponentCompetitorComparisonPageFeatureComparison>
  harnessLogo: Maybe<UploadFile>
  harnessModule: Maybe<Enum_Competitorcomparison_Harnessmodule>
  harnessSummary: Maybe<ComponentCompetitorComparisonPageProductSummaryZone>
  id: Scalars['ID']
  published_at: Maybe<Scalars['DateTime']>
  recommended: Maybe<ComponentPageScreenshotZone>
  screenshot: Maybe<ComponentPageScreenshotZone>
  slug: Scalars['String']
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type CompetitorComparisonAggregator = {
  __typename?: 'CompetitorComparisonAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type CompetitorComparisonConnection = {
  __typename?: 'CompetitorComparisonConnection'
  aggregate: Maybe<CompetitorComparisonAggregator>
  groupBy: Maybe<CompetitorComparisonGroupBy>
  values: Maybe<Array<Maybe<CompetitorComparison>>>
}

export type CompetitorComparisonConnectionCaseStudy = {
  __typename?: 'CompetitorComparisonConnectionCaseStudy'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionCompetitor = {
  __typename?: 'CompetitorComparisonConnectionCompetitor'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['String']>
}

export type CompetitorComparisonConnectionCompetitorLogo = {
  __typename?: 'CompetitorComparisonConnectionCompetitorLogo'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionCompetitorSummary = {
  __typename?: 'CompetitorComparisonConnectionCompetitorSummary'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionCreated_At = {
  __typename?: 'CompetitorComparisonConnectionCreated_at'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['DateTime']>
}

export type CompetitorComparisonConnectionCreated_By = {
  __typename?: 'CompetitorComparisonConnectionCreated_by'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionDetailedFeatureComparison = {
  __typename?: 'CompetitorComparisonConnectionDetailedFeatureComparison'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionFeatureComparison = {
  __typename?: 'CompetitorComparisonConnectionFeatureComparison'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionHarnessLogo = {
  __typename?: 'CompetitorComparisonConnectionHarnessLogo'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionHarnessModule = {
  __typename?: 'CompetitorComparisonConnectionHarnessModule'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['String']>
}

export type CompetitorComparisonConnectionHarnessSummary = {
  __typename?: 'CompetitorComparisonConnectionHarnessSummary'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionId = {
  __typename?: 'CompetitorComparisonConnectionId'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionPublished_At = {
  __typename?: 'CompetitorComparisonConnectionPublished_at'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['DateTime']>
}

export type CompetitorComparisonConnectionRecommended = {
  __typename?: 'CompetitorComparisonConnectionRecommended'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionScreenshot = {
  __typename?: 'CompetitorComparisonConnectionScreenshot'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonConnectionSlug = {
  __typename?: 'CompetitorComparisonConnectionSlug'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['String']>
}

export type CompetitorComparisonConnectionUpdated_At = {
  __typename?: 'CompetitorComparisonConnectionUpdated_at'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['DateTime']>
}

export type CompetitorComparisonConnectionUpdated_By = {
  __typename?: 'CompetitorComparisonConnectionUpdated_by'
  connection: Maybe<CompetitorComparisonConnection>
  key: Maybe<Scalars['ID']>
}

export type CompetitorComparisonGroupBy = {
  __typename?: 'CompetitorComparisonGroupBy'
  caseStudy: Maybe<Array<Maybe<CompetitorComparisonConnectionCaseStudy>>>
  competitor: Maybe<Array<Maybe<CompetitorComparisonConnectionCompetitor>>>
  competitorLogo: Maybe<Array<Maybe<CompetitorComparisonConnectionCompetitorLogo>>>
  competitorSummary: Maybe<Array<Maybe<CompetitorComparisonConnectionCompetitorSummary>>>
  created_at: Maybe<Array<Maybe<CompetitorComparisonConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<CompetitorComparisonConnectionCreated_By>>>
  detailedFeatureComparison: Maybe<Array<Maybe<CompetitorComparisonConnectionDetailedFeatureComparison>>>
  featureComparison: Maybe<Array<Maybe<CompetitorComparisonConnectionFeatureComparison>>>
  harnessLogo: Maybe<Array<Maybe<CompetitorComparisonConnectionHarnessLogo>>>
  harnessModule: Maybe<Array<Maybe<CompetitorComparisonConnectionHarnessModule>>>
  harnessSummary: Maybe<Array<Maybe<CompetitorComparisonConnectionHarnessSummary>>>
  id: Maybe<Array<Maybe<CompetitorComparisonConnectionId>>>
  published_at: Maybe<Array<Maybe<CompetitorComparisonConnectionPublished_At>>>
  recommended: Maybe<Array<Maybe<CompetitorComparisonConnectionRecommended>>>
  screenshot: Maybe<Array<Maybe<CompetitorComparisonConnectionScreenshot>>>
  slug: Maybe<Array<Maybe<CompetitorComparisonConnectionSlug>>>
  updated_at: Maybe<Array<Maybe<CompetitorComparisonConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<CompetitorComparisonConnectionUpdated_By>>>
}

export type CompetitorComparisonInput = {
  caseStudy: InputMaybe<ComponentCompetitorComparisonPageComparisonCaseStudyInput>
  competitor: InputMaybe<Scalars['String']>
  competitorLogo: InputMaybe<Scalars['ID']>
  competitorSummary: InputMaybe<ComponentCompetitorComparisonPageProductSummaryZoneInput>
  created_by: InputMaybe<Scalars['ID']>
  detailedFeatureComparison: InputMaybe<ComponentCompetitorComparisonPageDetailedFeatureComparisonInput>
  featureComparison: InputMaybe<ComponentCompetitorComparisonPageFeatureComparisonInput>
  harnessLogo: InputMaybe<Scalars['ID']>
  harnessModule: InputMaybe<Enum_Competitorcomparison_Harnessmodule>
  harnessSummary: InputMaybe<ComponentCompetitorComparisonPageProductSummaryZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  recommended: InputMaybe<ComponentPageScreenshotZoneInput>
  screenshot: InputMaybe<ComponentPageScreenshotZoneInput>
  slug: Scalars['String']
  updated_by: InputMaybe<Scalars['ID']>
}

export type ComponentCompanyPageAdressZone = {
  __typename?: 'ComponentCompanyPageAdressZone'
  address: Maybe<Scalars['String']>
  id: Scalars['ID']
  name: Maybe<Scalars['String']>
}

export type ComponentCompanyPageAdressZoneInput = {
  address: InputMaybe<Scalars['String']>
  name: InputMaybe<Scalars['String']>
}

export type ComponentCompanyPageOfficesZone = {
  __typename?: 'ComponentCompanyPageOfficesZone'
  addresses: Maybe<Array<Maybe<ComponentCompanyPageAdressZone>>>
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentCompanyPageOfficesZoneInput = {
  addresses: InputMaybe<Array<InputMaybe<ComponentCompanyPageAdressZoneInput>>>
  desc: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageComparisonCaseStudy = {
  __typename?: 'ComponentCompetitorComparisonPageComparisonCaseStudy'
  caseStudy: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageComparisonCaseStudyInput = {
  caseStudy: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  desc: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageDetailedFeatureComparison = {
  __typename?: 'ComponentCompetitorComparisonPageDetailedFeatureComparison'
  detailedFeature: Maybe<Array<Maybe<ComponentCompetitorComparisonPageProductDetailedFeature>>>
  id: Scalars['ID']
  note: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageDetailedFeatureComparisonInput = {
  detailedFeature: InputMaybe<Array<InputMaybe<ComponentCompetitorComparisonPageProductDetailedFeatureInput>>>
  note: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageFeatureComparison = {
  __typename?: 'ComponentCompetitorComparisonPageFeatureComparison'
  id: Scalars['ID']
  productFeature: Maybe<Array<Maybe<ComponentCompetitorComparisonPageProductFeature>>>
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageFeatureComparisonInput = {
  productFeature: InputMaybe<Array<InputMaybe<ComponentCompetitorComparisonPageProductFeatureInput>>>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageProductDetailedFeature = {
  __typename?: 'ComponentCompetitorComparisonPageProductDetailedFeature'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageProductDetailedFeatureInput = {
  desc: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageProductFeature = {
  __typename?: 'ComponentCompetitorComparisonPageProductFeature'
  competitorText: Maybe<Scalars['String']>
  competitorValue: Maybe<Enum_Componentcompetitorcomparisonpageproductfeature_Competitorvalue>
  id: Scalars['ID']
  label: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  text: Maybe<Scalars['String']>
  value: Maybe<Enum_Componentcompetitorcomparisonpageproductfeature_Value>
}

export type ComponentCompetitorComparisonPageProductFeatureInput = {
  competitorText: InputMaybe<Scalars['String']>
  competitorValue: InputMaybe<Enum_Componentcompetitorcomparisonpageproductfeature_Competitorvalue>
  label: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  text: InputMaybe<Scalars['String']>
  value: InputMaybe<Enum_Componentcompetitorcomparisonpageproductfeature_Value>
}

export type ComponentCompetitorComparisonPageProductSummaryZone = {
  __typename?: 'ComponentCompetitorComparisonPageProductSummaryZone'
  categorized: Maybe<Scalars['String']>
  companySize: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  founded: Maybe<Scalars['String']>
  funding: Maybe<Scalars['String']>
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  logo: Maybe<UploadFile>
  name: Maybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageProductSummaryZoneInput = {
  categorized: InputMaybe<Scalars['String']>
  companySize: InputMaybe<Scalars['String']>
  desc: InputMaybe<Scalars['String']>
  founded: InputMaybe<Scalars['String']>
  funding: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  logo: InputMaybe<Scalars['ID']>
  name: InputMaybe<Scalars['String']>
}

export type ComponentPageCaseListZone = {
  __typename?: 'ComponentPageCaseListZone'
  caseDescription: Maybe<Scalars['String']>
  caseTitle: Maybe<Scalars['String']>
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  moduleColor: Maybe<Enum_Componentpagecaselistzone_Modulecolor>
  videoLink: Maybe<Scalars['String']>
}

export type ComponentPageCaseListZoneInput = {
  caseDescription: InputMaybe<Scalars['String']>
  caseTitle: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  moduleColor: InputMaybe<Enum_Componentpagecaselistzone_Modulecolor>
  videoLink: InputMaybe<Scalars['String']>
}

export type ComponentPageCaseStudyZone = {
  __typename?: 'ComponentPageCaseStudyZone'
  background_color: Maybe<BackgroundColor>
  btnText: Maybe<Scalars['String']>
  client: Maybe<Scalars['String']>
  clientPic: Maybe<UploadFile>
  harness_modules: Maybe<Array<Maybe<HarnessModule>>>
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  quote: Maybe<Scalars['String']>
}

export type ComponentPageCaseStudyZoneHarness_ModulesArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type ComponentPageCaseStudyZoneInput = {
  background_color: InputMaybe<Scalars['ID']>
  btnText: InputMaybe<Scalars['String']>
  client: InputMaybe<Scalars['String']>
  clientPic: InputMaybe<Scalars['ID']>
  harness_modules: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  link: InputMaybe<Scalars['String']>
  quote: InputMaybe<Scalars['String']>
}

export type ComponentPageCustomerLogoZone = {
  __typename?: 'ComponentPageCustomerLogoZone'
  customerName: Maybe<Scalars['String']>
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  logo: Maybe<UploadFile>
}

export type ComponentPageCustomerLogoZoneInput = {
  customerName: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  logo: InputMaybe<Scalars['ID']>
}

export type ComponentPageExecutiveZone = {
  __typename?: 'ComponentPageExecutiveZone'
  bio: Maybe<Scalars['String']>
  id: Scalars['ID']
  img: Maybe<UploadFile>
  name: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentPageExecutiveZoneInput = {
  bio: InputMaybe<Scalars['String']>
  img: InputMaybe<Scalars['ID']>
  name: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageFeatureLIstZone = {
  __typename?: 'ComponentPageFeatureLIstZone'
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentPageFeatureLIstZoneInput = {
  link: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageHarnessModule = {
  __typename?: 'ComponentPageHarnessModule'
  harness_modules: Maybe<Array<Maybe<HarnessModule>>>
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
}

export type ComponentPageHarnessModuleHarness_ModulesArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type ComponentPageHarnessModuleInput = {
  harness_modules: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageImagePlus = {
  __typename?: 'ComponentPageImagePlus'
  comingSoon: Maybe<Scalars['Boolean']>
  id: Scalars['ID']
  img: Maybe<UploadFile>
  link: Maybe<Scalars['String']>
  name: Maybe<Scalars['String']>
}

export type ComponentPageImagePlusInput = {
  comingSoon: InputMaybe<Scalars['Boolean']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  name: InputMaybe<Scalars['String']>
}

export type ComponentPageImageZone = {
  __typename?: 'ComponentPageImageZone'
  id: Scalars['ID']
  img: Maybe<UploadFile>
  link: Maybe<Scalars['String']>
  name: Maybe<Scalars['String']>
}

export type ComponentPageImageZoneInput = {
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  name: InputMaybe<Scalars['String']>
}

export type ComponentPageMiniTitleZone = {
  __typename?: 'ComponentPageMiniTitleZone'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentPageMiniTitleZoneInput = {
  desc: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageModuleInput = {
  desc: InputMaybe<Scalars['String']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageModules = {
  __typename?: 'ComponentPageModules'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  img: Maybe<UploadFile>
  link: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentPageMultiImgListZone = {
  __typename?: 'ComponentPageMultiImgListZone'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  img: Maybe<Array<Maybe<ComponentPageImageZone>>>
  list: Maybe<Array<Maybe<ComponentPageFeatureLIstZone>>>
  title: Maybe<Scalars['String']>
}

export type ComponentPageMultiImgListZoneInput = {
  desc: InputMaybe<Scalars['String']>
  img: InputMaybe<Array<InputMaybe<ComponentPageImageZoneInput>>>
  list: InputMaybe<Array<InputMaybe<ComponentPageFeatureLIstZoneInput>>>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageMultiImgZone = {
  __typename?: 'ComponentPageMultiImgZone'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  img: Maybe<Array<Maybe<UploadFile>>>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentPageMultiImgZoneImgArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type ComponentPageMultiImgZoneInput = {
  desc: InputMaybe<Scalars['String']>
  img: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  link: InputMaybe<Scalars['String']>
  secondaryLink: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageNewsZone = {
  __typename?: 'ComponentPageNewsZone'
  featured: Maybe<Scalars['Boolean']>
  id: Scalars['ID']
  img: Maybe<UploadFile>
  link: Maybe<Scalars['String']>
  logo: Maybe<UploadFile>
  media: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  year: Maybe<Scalars['Int']>
}

export type ComponentPageNewsZoneInput = {
  featured: InputMaybe<Scalars['Boolean']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  logo: InputMaybe<Scalars['ID']>
  media: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  year: InputMaybe<Scalars['Int']>
}

export type ComponentPageOptionZone = {
  __typename?: 'ComponentPageOptionZone'
  id: Scalars['ID']
  optionDescription: Maybe<Scalars['String']>
  optionSubTitle: Maybe<Scalars['String']>
  optionTitle: Maybe<Scalars['String']>
  screenshot: Maybe<UploadFile>
}

export type ComponentPageOptionZoneInput = {
  optionDescription: InputMaybe<Scalars['String']>
  optionSubTitle: InputMaybe<Scalars['String']>
  optionTitle: InputMaybe<Scalars['String']>
  screenshot: InputMaybe<Scalars['ID']>
}

export type ComponentPageProductIntroLogoZone = {
  __typename?: 'ComponentPageProductIntroLogoZone'
  ProdIntroDesc: Maybe<Scalars['String']>
  id: Scalars['ID']
  prodIntroScreenshot: Maybe<UploadFile>
  prodIntroTitle: Maybe<Scalars['String']>
  prodLogo: Maybe<UploadFile>
}

export type ComponentPageProductIntroLogoZoneInput = {
  ProdIntroDesc: InputMaybe<Scalars['String']>
  prodIntroScreenshot: InputMaybe<Scalars['ID']>
  prodIntroTitle: InputMaybe<Scalars['String']>
  prodLogo: InputMaybe<Scalars['ID']>
}

export type ComponentPageProductTitleZone = {
  __typename?: 'ComponentPageProductTitleZone'
  backgroundImg: Maybe<UploadFile>
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  img: Maybe<UploadFile>
  link: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  video: Maybe<Scalars['String']>
}

export type ComponentPageProductTitleZoneInput = {
  backgroundImg: InputMaybe<Scalars['ID']>
  desc: InputMaybe<Scalars['String']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  video: InputMaybe<Scalars['String']>
}

export type ComponentPageQuoteZone = {
  __typename?: 'ComponentPageQuoteZone'
  id: Scalars['ID']
  quoteName: Maybe<Scalars['String']>
  quoteText: Maybe<Scalars['String']>
}

export type ComponentPageQuoteZoneInput = {
  quoteName: InputMaybe<Scalars['String']>
  quoteText: InputMaybe<Scalars['String']>
}

export type ComponentPageRichTextZone = {
  __typename?: 'ComponentPageRichTextZone'
  bodyText: Maybe<Scalars['String']>
  dateText: Maybe<Scalars['String']>
  id: Scalars['ID']
  pageTitle: Maybe<Scalars['String']>
}

export type ComponentPageRichTextZoneInput = {
  bodyText: InputMaybe<Scalars['String']>
  dateText: InputMaybe<Scalars['String']>
  pageTitle: InputMaybe<Scalars['String']>
}

export type ComponentPageScreenshotZone = {
  __typename?: 'ComponentPageScreenshotZone'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  img: Maybe<Array<Maybe<ComponentPageImageZone>>>
  title: Maybe<Scalars['String']>
}

export type ComponentPageScreenshotZoneInput = {
  desc: InputMaybe<Scalars['String']>
  img: InputMaybe<Array<InputMaybe<ComponentPageImageZoneInput>>>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageSectionOptionInput = {
  optionDesc: InputMaybe<Scalars['String']>
  optionImg: InputMaybe<Scalars['ID']>
  optionTitle: InputMaybe<Scalars['String']>
  richTextDesc: InputMaybe<Scalars['String']>
}

export type ComponentPageSectionOptions = {
  __typename?: 'ComponentPageSectionOptions'
  id: Scalars['ID']
  optionDesc: Maybe<Scalars['String']>
  optionImg: Maybe<UploadFile>
  optionTitle: Maybe<Scalars['String']>
  richTextDesc: Maybe<Scalars['String']>
}

export type ComponentPageSectionSecurity = {
  __typename?: 'ComponentPageSectionSecurity'
  id: Scalars['ID']
  securityDesc: Maybe<Scalars['String']>
  securityImg: Maybe<UploadFile>
  securityTitle: Maybe<Scalars['String']>
}

export type ComponentPageSectionSecurityInput = {
  securityDesc: InputMaybe<Scalars['String']>
  securityImg: InputMaybe<Scalars['ID']>
  securityTitle: InputMaybe<Scalars['String']>
}

export type ComponentPageSimpleTitleZone = {
  __typename?: 'ComponentPageSimpleTitleZone'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentPageSimpleTitleZoneInput = {
  desc: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  secondaryLink: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageSimpleZone = {
  __typename?: 'ComponentPageSimpleZone'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  investorList: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  title: Maybe<Scalars['String']>
}

export type ComponentPageSimpleZoneInput = {
  desc: InputMaybe<Scalars['String']>
  investorList: InputMaybe<Array<InputMaybe<ComponentPageCustomerLogoZoneInput>>>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageTeamZone = {
  __typename?: 'ComponentPageTeamZone'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  teamPics: Maybe<Array<Maybe<ComponentPageImageZone>>>
  title: Maybe<Scalars['String']>
}

export type ComponentPageTeamZoneInput = {
  desc: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  secondaryLink: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  teamPics: InputMaybe<Array<InputMaybe<ComponentPageImageZoneInput>>>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageTextImageZone = {
  __typename?: 'ComponentPageTextImageZone'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  img: Maybe<UploadFile>
  link: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentPageTextImageZoneInput = {
  desc: InputMaybe<Scalars['String']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageTextZone = {
  __typename?: 'ComponentPageTextZone'
  FeatureIntro: Maybe<Scalars['String']>
  featureTitle: Maybe<Scalars['String']>
  id: Scalars['ID']
  imageName: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type ComponentPageTextZoneInput = {
  FeatureIntro: InputMaybe<Scalars['String']>
  featureTitle: InputMaybe<Scalars['String']>
  imageName: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
}

export type ComponentPageTitleImgZone = {
  __typename?: 'ComponentPageTitleImgZone'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  img: Maybe<UploadFile>
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentPageTitleImgZoneInput = {
  desc: InputMaybe<Scalars['String']>
  img: InputMaybe<Scalars['ID']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageTitleZone = {
  __typename?: 'ComponentPageTitleZone'
  description: Maybe<Scalars['String']>
  desktopHeroAnimation: Maybe<UploadFile>
  id: Scalars['ID']
  img: Maybe<UploadFile>
  mobileHeroAnimation: Maybe<UploadFile>
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentPageTitleZoneInput = {
  description: InputMaybe<Scalars['String']>
  desktopHeroAnimation: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  mobileHeroAnimation: InputMaybe<Scalars['ID']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPageWorkflow = {
  __typename?: 'ComponentPageWorkflow'
  id: Scalars['ID']
  workflowCard: Maybe<Array<Maybe<ComponentPageWorkflowCard>>>
  workflowDesc: Maybe<Scalars['String']>
  workflowImg: Maybe<UploadFile>
  workflowTitle: Maybe<Scalars['String']>
}

export type ComponentPageWorkflowCard = {
  __typename?: 'ComponentPageWorkflowCard'
  cardDesc: Maybe<Scalars['String']>
  cardImg: Maybe<UploadFile>
  cardTitle: Maybe<Scalars['String']>
  id: Scalars['ID']
}

export type ComponentPageWorkflowCardInput = {
  cardDesc: InputMaybe<Scalars['String']>
  cardImg: InputMaybe<Scalars['ID']>
  cardTitle: InputMaybe<Scalars['String']>
}

export type ComponentPageWorkflowInput = {
  workflowCard: InputMaybe<Array<InputMaybe<ComponentPageWorkflowCardInput>>>
  workflowDesc: InputMaybe<Scalars['String']>
  workflowImg: InputMaybe<Scalars['ID']>
  workflowTitle: InputMaybe<Scalars['String']>
}

export type ComponentPricingPageCallOut = {
  __typename?: 'ComponentPricingPageCallOut'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
}

export type ComponentPricingPageCallOutInput = {
  desc: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPricingPageDetailedFeature = {
  __typename?: 'ComponentPricingPageDetailedFeature'
  communityText: Maybe<Scalars['String']>
  communityValue: Maybe<Enum_Componentpricingpagedetailedfeature_Communityvalue>
  enterpriseText: Maybe<Scalars['String']>
  enterpriseValue: Maybe<Enum_Componentpricingpagedetailedfeature_Enterprisevalue>
  freeText: Maybe<Scalars['String']>
  freeValue: Maybe<Enum_Componentpricingpagedetailedfeature_Freevalue>
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  teamText: Maybe<Scalars['String']>
  teamValue: Maybe<Enum_Componentpricingpagedetailedfeature_Teamvalue>
  title: Maybe<Scalars['String']>
}

export type ComponentPricingPageDetailedFeatureInput = {
  communityText: InputMaybe<Scalars['String']>
  communityValue: InputMaybe<Enum_Componentpricingpagedetailedfeature_Communityvalue>
  enterpriseText: InputMaybe<Scalars['String']>
  enterpriseValue: InputMaybe<Enum_Componentpricingpagedetailedfeature_Enterprisevalue>
  freeText: InputMaybe<Scalars['String']>
  freeValue: InputMaybe<Enum_Componentpricingpagedetailedfeature_Freevalue>
  link: InputMaybe<Scalars['String']>
  teamText: InputMaybe<Scalars['String']>
  teamValue: InputMaybe<Enum_Componentpricingpagedetailedfeature_Teamvalue>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPricingPageFaq = {
  __typename?: 'ComponentPricingPageFaq'
  anchor: Maybe<Scalars['String']>
  faqAnswer: Maybe<Scalars['String']>
  faqTitle: Maybe<Scalars['String']>
  id: Scalars['ID']
}

export type ComponentPricingPageFaqInput = {
  anchor: InputMaybe<Scalars['String']>
  faqAnswer: InputMaybe<Scalars['String']>
  faqTitle: InputMaybe<Scalars['String']>
}

export type ComponentPricingPageFeatureCaption = {
  __typename?: 'ComponentPricingPageFeatureCaption'
  btnLink: Maybe<Scalars['String']>
  btnText: Maybe<Scalars['String']>
  id: Scalars['ID']
  primaryButton: Maybe<Scalars['Boolean']>
  title: Maybe<Scalars['String']>
}

export type ComponentPricingPageFeatureCaptionInput = {
  btnLink: InputMaybe<Scalars['String']>
  btnText: InputMaybe<Scalars['String']>
  primaryButton: InputMaybe<Scalars['Boolean']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPricingPageFeatureGroup = {
  __typename?: 'ComponentPricingPageFeatureGroup'
  detailedFeature: Maybe<Array<Maybe<ComponentPricingPageDetailedFeature>>>
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
}

export type ComponentPricingPageFeatureGroupInput = {
  detailedFeature: InputMaybe<Array<InputMaybe<ComponentPricingPageDetailedFeatureInput>>>
  title: InputMaybe<Scalars['String']>
}

export type ComponentPricingPageMorePlansZone = {
  __typename?: 'ComponentPricingPageMorePlansZone'
  buttonText: Maybe<Scalars['String']>
  deploymentVerification: Maybe<Scalars['Boolean']>
  deplymentPerDay: Maybe<Scalars['String']>
  deplymentUnits: Maybe<Scalars['String']>
  enterpriseGovernance: Maybe<Scalars['String']>
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  managementAtScale: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
  security: Maybe<Scalars['String']>
  servicesSupported: Maybe<Scalars['String']>
  support: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  users: Maybe<Scalars['String']>
}

export type ComponentPricingPageMorePlansZoneInput = {
  buttonText: InputMaybe<Scalars['String']>
  deploymentVerification: InputMaybe<Scalars['Boolean']>
  deplymentPerDay: InputMaybe<Scalars['String']>
  deplymentUnits: InputMaybe<Scalars['String']>
  enterpriseGovernance: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  managementAtScale: InputMaybe<Scalars['String']>
  primaryButton: InputMaybe<Scalars['Boolean']>
  security: InputMaybe<Scalars['String']>
  servicesSupported: InputMaybe<Scalars['String']>
  support: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  users: InputMaybe<Scalars['String']>
}

export type ComponentPricingPagePlansZone = {
  __typename?: 'ComponentPricingPagePlansZone'
  buttonText: Maybe<Scalars['String']>
  comingSoon: Maybe<Scalars['Boolean']>
  desc: Maybe<Scalars['String']>
  featureListZone: Maybe<Array<Maybe<ComponentPageFeatureLIstZone>>>
  featureTitle: Maybe<Scalars['String']>
  id: Scalars['ID']
  img: Maybe<UploadFile>
  link: Maybe<Scalars['String']>
  price: Maybe<Scalars['String']>
  priceTerm: Maybe<Scalars['String']>
  priceTermTips: Maybe<Scalars['String']>
  priceTips: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
  support: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  unit: Maybe<Scalars['String']>
  unitTips: Maybe<Scalars['String']>
  yearlyPrice: Maybe<Scalars['String']>
  yearlyPriceTerm: Maybe<Scalars['String']>
  yearlyPriceTermTips: Maybe<Scalars['String']>
  yearlyPriceTips: Maybe<Scalars['String']>
}

export type ComponentPricingPagePlansZoneInput = {
  buttonText: InputMaybe<Scalars['String']>
  comingSoon: InputMaybe<Scalars['Boolean']>
  desc: InputMaybe<Scalars['String']>
  featureListZone: InputMaybe<Array<InputMaybe<ComponentPageFeatureLIstZoneInput>>>
  featureTitle: InputMaybe<Scalars['String']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  price: InputMaybe<Scalars['String']>
  priceTerm: InputMaybe<Scalars['String']>
  priceTermTips: InputMaybe<Scalars['String']>
  priceTips: InputMaybe<Scalars['String']>
  primaryButton: InputMaybe<Scalars['Boolean']>
  support: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  unit: InputMaybe<Scalars['String']>
  unitTips: InputMaybe<Scalars['String']>
  yearlyPrice: InputMaybe<Scalars['String']>
  yearlyPriceTerm: InputMaybe<Scalars['String']>
  yearlyPriceTermTips: InputMaybe<Scalars['String']>
  yearlyPriceTips: InputMaybe<Scalars['String']>
}

export type ComponentPricingPageTooltipsZone = {
  __typename?: 'ComponentPricingPageTooltipsZone'
  id: Scalars['ID']
  keyword: Maybe<Scalars['String']>
  tooltip: Maybe<Scalars['String']>
}

export type ComponentPricingPageTooltipsZoneInput = {
  keyword: InputMaybe<Scalars['String']>
  tooltip: InputMaybe<Scalars['String']>
}

export type ComponentProductPageIntegrationZone = {
  __typename?: 'ComponentProductPageIntegrationZone'
  clientSide: Maybe<Array<Maybe<ComponentPageImagePlus>>>
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  serverSide: Maybe<Array<Maybe<ComponentPageImagePlus>>>
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentProductPageIntegrationZoneInput = {
  clientSide: InputMaybe<Array<InputMaybe<ComponentPageImagePlusInput>>>
  desc: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  secondaryLink: InputMaybe<Scalars['String']>
  serverSide: InputMaybe<Array<InputMaybe<ComponentPageImagePlusInput>>>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ComponentProductPageIntegrationsZone = {
  __typename?: 'ComponentProductPageIntegrationsZone'
  desc: Maybe<Scalars['String']>
  id: Scalars['ID']
  img: Maybe<Array<Maybe<ComponentPageImagePlus>>>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
}

export type ComponentProductPageIntegrationsZoneInput = {
  desc: InputMaybe<Scalars['String']>
  img: InputMaybe<Array<InputMaybe<ComponentPageImagePlusInput>>>
  link: InputMaybe<Scalars['String']>
  secondaryLink: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type ContactSale = {
  __typename?: 'ContactSale'
  company: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  email: Maybe<Scalars['String']>
  firstName: Maybe<Scalars['String']>
  id: Scalars['ID']
  lastName: Maybe<Scalars['String']>
  phone: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  title: Maybe<Scalars['String']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type ContactSaleAggregator = {
  __typename?: 'ContactSaleAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type ContactSaleConnection = {
  __typename?: 'ContactSaleConnection'
  aggregate: Maybe<ContactSaleAggregator>
  groupBy: Maybe<ContactSaleGroupBy>
  values: Maybe<Array<Maybe<ContactSale>>>
}

export type ContactSaleConnectionCompany = {
  __typename?: 'ContactSaleConnectionCompany'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['String']>
}

export type ContactSaleConnectionCreated_At = {
  __typename?: 'ContactSaleConnectionCreated_at'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['DateTime']>
}

export type ContactSaleConnectionCreated_By = {
  __typename?: 'ContactSaleConnectionCreated_by'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['ID']>
}

export type ContactSaleConnectionEmail = {
  __typename?: 'ContactSaleConnectionEmail'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['String']>
}

export type ContactSaleConnectionFirstName = {
  __typename?: 'ContactSaleConnectionFirstName'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['String']>
}

export type ContactSaleConnectionId = {
  __typename?: 'ContactSaleConnectionId'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['ID']>
}

export type ContactSaleConnectionLastName = {
  __typename?: 'ContactSaleConnectionLastName'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['String']>
}

export type ContactSaleConnectionPhone = {
  __typename?: 'ContactSaleConnectionPhone'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['String']>
}

export type ContactSaleConnectionPublished_At = {
  __typename?: 'ContactSaleConnectionPublished_at'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['DateTime']>
}

export type ContactSaleConnectionTitle = {
  __typename?: 'ContactSaleConnectionTitle'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['String']>
}

export type ContactSaleConnectionUpdated_At = {
  __typename?: 'ContactSaleConnectionUpdated_at'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['DateTime']>
}

export type ContactSaleConnectionUpdated_By = {
  __typename?: 'ContactSaleConnectionUpdated_by'
  connection: Maybe<ContactSaleConnection>
  key: Maybe<Scalars['ID']>
}

export type ContactSaleGroupBy = {
  __typename?: 'ContactSaleGroupBy'
  company: Maybe<Array<Maybe<ContactSaleConnectionCompany>>>
  created_at: Maybe<Array<Maybe<ContactSaleConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<ContactSaleConnectionCreated_By>>>
  email: Maybe<Array<Maybe<ContactSaleConnectionEmail>>>
  firstName: Maybe<Array<Maybe<ContactSaleConnectionFirstName>>>
  id: Maybe<Array<Maybe<ContactSaleConnectionId>>>
  lastName: Maybe<Array<Maybe<ContactSaleConnectionLastName>>>
  phone: Maybe<Array<Maybe<ContactSaleConnectionPhone>>>
  published_at: Maybe<Array<Maybe<ContactSaleConnectionPublished_At>>>
  title: Maybe<Array<Maybe<ContactSaleConnectionTitle>>>
  updated_at: Maybe<Array<Maybe<ContactSaleConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<ContactSaleConnectionUpdated_By>>>
}

export type ContactSaleInput = {
  company: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  email: InputMaybe<Scalars['String']>
  firstName: InputMaybe<Scalars['String']>
  lastName: InputMaybe<Scalars['String']>
  phone: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type ContactUs = {
  __typename?: 'ContactUs'
  company: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  email: Maybe<Scalars['String']>
  firstName: Maybe<Scalars['String']>
  id: Scalars['ID']
  lastName: Maybe<Scalars['String']>
  phone: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  title: Maybe<Scalars['String']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type ContactUsAggregator = {
  __typename?: 'ContactUsAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type ContactUsConnection = {
  __typename?: 'ContactUsConnection'
  aggregate: Maybe<ContactUsAggregator>
  groupBy: Maybe<ContactUsGroupBy>
  values: Maybe<Array<Maybe<ContactUs>>>
}

export type ContactUsConnectionCompany = {
  __typename?: 'ContactUsConnectionCompany'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['String']>
}

export type ContactUsConnectionCreated_At = {
  __typename?: 'ContactUsConnectionCreated_at'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['DateTime']>
}

export type ContactUsConnectionCreated_By = {
  __typename?: 'ContactUsConnectionCreated_by'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['ID']>
}

export type ContactUsConnectionEmail = {
  __typename?: 'ContactUsConnectionEmail'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['String']>
}

export type ContactUsConnectionFirstName = {
  __typename?: 'ContactUsConnectionFirstName'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['String']>
}

export type ContactUsConnectionId = {
  __typename?: 'ContactUsConnectionId'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['ID']>
}

export type ContactUsConnectionLastName = {
  __typename?: 'ContactUsConnectionLastName'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['String']>
}

export type ContactUsConnectionPhone = {
  __typename?: 'ContactUsConnectionPhone'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['String']>
}

export type ContactUsConnectionPublished_At = {
  __typename?: 'ContactUsConnectionPublished_at'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['DateTime']>
}

export type ContactUsConnectionTitle = {
  __typename?: 'ContactUsConnectionTitle'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['String']>
}

export type ContactUsConnectionUpdated_At = {
  __typename?: 'ContactUsConnectionUpdated_at'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['DateTime']>
}

export type ContactUsConnectionUpdated_By = {
  __typename?: 'ContactUsConnectionUpdated_by'
  connection: Maybe<ContactUsConnection>
  key: Maybe<Scalars['ID']>
}

export type ContactUsGroupBy = {
  __typename?: 'ContactUsGroupBy'
  company: Maybe<Array<Maybe<ContactUsConnectionCompany>>>
  created_at: Maybe<Array<Maybe<ContactUsConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<ContactUsConnectionCreated_By>>>
  email: Maybe<Array<Maybe<ContactUsConnectionEmail>>>
  firstName: Maybe<Array<Maybe<ContactUsConnectionFirstName>>>
  id: Maybe<Array<Maybe<ContactUsConnectionId>>>
  lastName: Maybe<Array<Maybe<ContactUsConnectionLastName>>>
  phone: Maybe<Array<Maybe<ContactUsConnectionPhone>>>
  published_at: Maybe<Array<Maybe<ContactUsConnectionPublished_At>>>
  title: Maybe<Array<Maybe<ContactUsConnectionTitle>>>
  updated_at: Maybe<Array<Maybe<ContactUsConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<ContactUsConnectionUpdated_By>>>
}

export type ContactUsInput = {
  company: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  email: InputMaybe<Scalars['String']>
  firstName: InputMaybe<Scalars['String']>
  lastName: InputMaybe<Scalars['String']>
  phone: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type Customer = {
  __typename?: 'Customer'
  caseStudy: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  feature: Maybe<Array<Maybe<ComponentPageHarnessModule>>>
  id: Scalars['ID']
  logoRow1: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  logoRow2: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  published_at: Maybe<Scalars['DateTime']>
  title: Maybe<ComponentPageTitleZone>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type CustomerInput = {
  caseStudy: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  feature: InputMaybe<Array<InputMaybe<ComponentPageHarnessModuleInput>>>
  logoRow1: InputMaybe<Array<InputMaybe<ComponentPageCustomerLogoZoneInput>>>
  logoRow2: InputMaybe<Array<InputMaybe<ComponentPageCustomerLogoZoneInput>>>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<ComponentPageTitleZoneInput>
  updated_by: InputMaybe<Scalars['ID']>
}

export type DevOpsToolInput = {
  created_by: InputMaybe<Scalars['ID']>
  hero: InputMaybe<ComponentPageTitleImgZoneInput>
  introDesc: InputMaybe<Scalars['String']>
  introTitle: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type DevOpsTools = {
  __typename?: 'DevOpsTools'
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  hero: Maybe<ComponentPageTitleImgZone>
  id: Scalars['ID']
  introDesc: Maybe<Scalars['String']>
  introTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type EBook = {
  __typename?: 'EBook'
  content: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  detail_image: Maybe<UploadFile>
  id: Scalars['ID']
  mkto_form_id: Maybe<Scalars['Int']>
  pdf: Maybe<UploadFile>
  preview_image: Maybe<UploadFile>
  published: Maybe<Scalars['DateTime']>
  published_at: Maybe<Scalars['DateTime']>
  slug: Scalars['String']
  title: Scalars['String']
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type EBookAggregator = {
  __typename?: 'EBookAggregator'
  avg: Maybe<EBookAggregatorAvg>
  count: Maybe<Scalars['Int']>
  max: Maybe<EBookAggregatorMax>
  min: Maybe<EBookAggregatorMin>
  sum: Maybe<EBookAggregatorSum>
  totalCount: Maybe<Scalars['Int']>
}

export type EBookAggregatorAvg = {
  __typename?: 'EBookAggregatorAvg'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type EBookAggregatorMax = {
  __typename?: 'EBookAggregatorMax'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type EBookAggregatorMin = {
  __typename?: 'EBookAggregatorMin'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type EBookAggregatorSum = {
  __typename?: 'EBookAggregatorSum'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type EBookConnection = {
  __typename?: 'EBookConnection'
  aggregate: Maybe<EBookAggregator>
  groupBy: Maybe<EBookGroupBy>
  values: Maybe<Array<Maybe<EBook>>>
}

export type EBookConnectionContent = {
  __typename?: 'EBookConnectionContent'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['String']>
}

export type EBookConnectionCreated_At = {
  __typename?: 'EBookConnectionCreated_at'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['DateTime']>
}

export type EBookConnectionCreated_By = {
  __typename?: 'EBookConnectionCreated_by'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['ID']>
}

export type EBookConnectionDetail_Image = {
  __typename?: 'EBookConnectionDetail_image'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['ID']>
}

export type EBookConnectionId = {
  __typename?: 'EBookConnectionId'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['ID']>
}

export type EBookConnectionMkto_Form_Id = {
  __typename?: 'EBookConnectionMkto_form_id'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['Int']>
}

export type EBookConnectionPdf = {
  __typename?: 'EBookConnectionPdf'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['ID']>
}

export type EBookConnectionPreview_Image = {
  __typename?: 'EBookConnectionPreview_image'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['ID']>
}

export type EBookConnectionPublished = {
  __typename?: 'EBookConnectionPublished'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['DateTime']>
}

export type EBookConnectionPublished_At = {
  __typename?: 'EBookConnectionPublished_at'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['DateTime']>
}

export type EBookConnectionSlug = {
  __typename?: 'EBookConnectionSlug'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['String']>
}

export type EBookConnectionTitle = {
  __typename?: 'EBookConnectionTitle'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['String']>
}

export type EBookConnectionUpdated_At = {
  __typename?: 'EBookConnectionUpdated_at'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['DateTime']>
}

export type EBookConnectionUpdated_By = {
  __typename?: 'EBookConnectionUpdated_by'
  connection: Maybe<EBookConnection>
  key: Maybe<Scalars['ID']>
}

export type EBookGroupBy = {
  __typename?: 'EBookGroupBy'
  content: Maybe<Array<Maybe<EBookConnectionContent>>>
  created_at: Maybe<Array<Maybe<EBookConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<EBookConnectionCreated_By>>>
  detail_image: Maybe<Array<Maybe<EBookConnectionDetail_Image>>>
  id: Maybe<Array<Maybe<EBookConnectionId>>>
  mkto_form_id: Maybe<Array<Maybe<EBookConnectionMkto_Form_Id>>>
  pdf: Maybe<Array<Maybe<EBookConnectionPdf>>>
  preview_image: Maybe<Array<Maybe<EBookConnectionPreview_Image>>>
  published: Maybe<Array<Maybe<EBookConnectionPublished>>>
  published_at: Maybe<Array<Maybe<EBookConnectionPublished_At>>>
  slug: Maybe<Array<Maybe<EBookConnectionSlug>>>
  title: Maybe<Array<Maybe<EBookConnectionTitle>>>
  updated_at: Maybe<Array<Maybe<EBookConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<EBookConnectionUpdated_By>>>
}

export type EBookInput = {
  content: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  detail_image: InputMaybe<Scalars['ID']>
  mkto_form_id: InputMaybe<Scalars['Int']>
  pdf: InputMaybe<Scalars['ID']>
  preview_image: InputMaybe<Scalars['ID']>
  published: InputMaybe<Scalars['DateTime']>
  published_at: InputMaybe<Scalars['DateTime']>
  slug: Scalars['String']
  title: Scalars['String']
  updated_by: InputMaybe<Scalars['ID']>
}

export enum Enum_Competitorcomparison_Harnessmodule {
  CloudCostManagement = 'Cloud_Cost_Management',
  ContinuousDelivery = 'Continuous_Delivery',
  ContinuousIntegration = 'Continuous_Integration',
  FeatureFlagsManagement = 'Feature_Flags_Management'
}

export enum Enum_Componentcompetitorcomparisonpageproductfeature_Competitorvalue {
  Maybe = 'Maybe',
  Na = 'NA',
  No = 'No',
  Yes = 'Yes'
}

export enum Enum_Componentcompetitorcomparisonpageproductfeature_Value {
  Maybe = 'Maybe',
  Na = 'NA',
  No = 'No',
  Yes = 'Yes'
}

export enum Enum_Componentpagecaselistzone_Modulecolor {
  Builds = 'builds',
  Changeintel = 'changeintel',
  Cloudcost = 'cloudcost',
  Deployment = 'deployment',
  Featureflag = 'featureflag',
  Filters = 'filters'
}

export enum Enum_Componentpricingpagedetailedfeature_Communityvalue {
  No = 'No',
  Yes = 'Yes'
}

export enum Enum_Componentpricingpagedetailedfeature_Enterprisevalue {
  No = 'No',
  Yes = 'Yes'
}

export enum Enum_Componentpricingpagedetailedfeature_Freevalue {
  No = 'No',
  Yes = 'Yes'
}

export enum Enum_Componentpricingpagedetailedfeature_Teamvalue {
  No = 'No',
  Yes = 'Yes'
}

export enum Enum_Harnessmodule_Modulestyle {
  Builds = 'builds',
  Changeintel = 'changeintel',
  Cloudcost = 'cloudcost',
  Deployment = 'deployment',
  Featureflag = 'featureflag'
}

export enum Enum_Userspermissionsuser_Interest {
  Cd = 'CD',
  Ce = 'CE',
  Cf = 'CF',
  Ci = 'CI',
  Cv = 'CV'
}

export enum Enum_Userspermissionsuser_Occupation {
  Cio = 'CIO',
  Designer = 'designer',
  Engineer = 'engineer'
}

export type Event = {
  __typename?: 'Event'
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  detailsLeftColumn: Maybe<Scalars['String']>
  detailsRightColumn: Maybe<Scalars['String']>
  id: Scalars['ID']
  mktoFormTitle: Maybe<Scalars['String']>
  mkto_form_id: Maybe<Scalars['String']>
  panelists: Maybe<Array<Maybe<Panelist>>>
  profilesHeading: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  registerImage: Maybe<UploadFile>
  registration: Maybe<Scalars['Boolean']>
  slug: Scalars['String']
  title: Scalars['String']
  topBannerImg: Maybe<UploadFile>
  topBannerText: Maybe<Scalars['String']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type EventPanelistsArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type EventAggregator = {
  __typename?: 'EventAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type EventConnection = {
  __typename?: 'EventConnection'
  aggregate: Maybe<EventAggregator>
  groupBy: Maybe<EventGroupBy>
  values: Maybe<Array<Maybe<Event>>>
}

export type EventConnectionCreated_At = {
  __typename?: 'EventConnectionCreated_at'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['DateTime']>
}

export type EventConnectionCreated_By = {
  __typename?: 'EventConnectionCreated_by'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['ID']>
}

export type EventConnectionDetailsLeftColumn = {
  __typename?: 'EventConnectionDetailsLeftColumn'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['String']>
}

export type EventConnectionDetailsRightColumn = {
  __typename?: 'EventConnectionDetailsRightColumn'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['String']>
}

export type EventConnectionId = {
  __typename?: 'EventConnectionId'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['ID']>
}

export type EventConnectionMktoFormTitle = {
  __typename?: 'EventConnectionMktoFormTitle'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['String']>
}

export type EventConnectionMkto_Form_Id = {
  __typename?: 'EventConnectionMkto_form_id'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['String']>
}

export type EventConnectionProfilesHeading = {
  __typename?: 'EventConnectionProfilesHeading'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['String']>
}

export type EventConnectionPublished_At = {
  __typename?: 'EventConnectionPublished_at'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['DateTime']>
}

export type EventConnectionRegisterImage = {
  __typename?: 'EventConnectionRegisterImage'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['ID']>
}

export type EventConnectionRegistration = {
  __typename?: 'EventConnectionRegistration'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['Boolean']>
}

export type EventConnectionSlug = {
  __typename?: 'EventConnectionSlug'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['String']>
}

export type EventConnectionTitle = {
  __typename?: 'EventConnectionTitle'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['String']>
}

export type EventConnectionTopBannerImg = {
  __typename?: 'EventConnectionTopBannerImg'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['ID']>
}

export type EventConnectionTopBannerText = {
  __typename?: 'EventConnectionTopBannerText'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['String']>
}

export type EventConnectionUpdated_At = {
  __typename?: 'EventConnectionUpdated_at'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['DateTime']>
}

export type EventConnectionUpdated_By = {
  __typename?: 'EventConnectionUpdated_by'
  connection: Maybe<EventConnection>
  key: Maybe<Scalars['ID']>
}

export type EventGroupBy = {
  __typename?: 'EventGroupBy'
  created_at: Maybe<Array<Maybe<EventConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<EventConnectionCreated_By>>>
  detailsLeftColumn: Maybe<Array<Maybe<EventConnectionDetailsLeftColumn>>>
  detailsRightColumn: Maybe<Array<Maybe<EventConnectionDetailsRightColumn>>>
  id: Maybe<Array<Maybe<EventConnectionId>>>
  mktoFormTitle: Maybe<Array<Maybe<EventConnectionMktoFormTitle>>>
  mkto_form_id: Maybe<Array<Maybe<EventConnectionMkto_Form_Id>>>
  profilesHeading: Maybe<Array<Maybe<EventConnectionProfilesHeading>>>
  published_at: Maybe<Array<Maybe<EventConnectionPublished_At>>>
  registerImage: Maybe<Array<Maybe<EventConnectionRegisterImage>>>
  registration: Maybe<Array<Maybe<EventConnectionRegistration>>>
  slug: Maybe<Array<Maybe<EventConnectionSlug>>>
  title: Maybe<Array<Maybe<EventConnectionTitle>>>
  topBannerImg: Maybe<Array<Maybe<EventConnectionTopBannerImg>>>
  topBannerText: Maybe<Array<Maybe<EventConnectionTopBannerText>>>
  updated_at: Maybe<Array<Maybe<EventConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<EventConnectionUpdated_By>>>
}

export type EventInput = {
  created_by: InputMaybe<Scalars['ID']>
  detailsLeftColumn: InputMaybe<Scalars['String']>
  detailsRightColumn: InputMaybe<Scalars['String']>
  mktoFormTitle: InputMaybe<Scalars['String']>
  mkto_form_id: InputMaybe<Scalars['String']>
  panelists: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  profilesHeading: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  registerImage: InputMaybe<Scalars['ID']>
  registration: InputMaybe<Scalars['Boolean']>
  slug: Scalars['String']
  title: Scalars['String']
  topBannerImg: InputMaybe<Scalars['ID']>
  topBannerText: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type FileInfoInput = {
  alternativeText: InputMaybe<Scalars['String']>
  caption: InputMaybe<Scalars['String']>
  name: InputMaybe<Scalars['String']>
}

export type FileInput = {
  alternativeText: InputMaybe<Scalars['String']>
  caption: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  ext: InputMaybe<Scalars['String']>
  formats: InputMaybe<Scalars['JSON']>
  hash: Scalars['String']
  height: InputMaybe<Scalars['Int']>
  mime: Scalars['String']
  name: Scalars['String']
  previewUrl: InputMaybe<Scalars['String']>
  provider: Scalars['String']
  provider_metadata: InputMaybe<Scalars['JSON']>
  related: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  size: Scalars['Float']
  updated_by: InputMaybe<Scalars['ID']>
  url: Scalars['String']
  width: InputMaybe<Scalars['Int']>
}

export type HarnessModule = {
  __typename?: 'HarnessModule'
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  id: Scalars['ID']
  item: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  moduleDesc: Maybe<Scalars['String']>
  moduleLogo: Maybe<Array<Maybe<UploadFile>>>
  moduleName: Maybe<Scalars['String']>
  moduleStyle: Maybe<Enum_Harnessmodule_Modulestyle>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type HarnessModuleModuleLogoArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type HarnessModuleAggregator = {
  __typename?: 'HarnessModuleAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type HarnessModuleConnection = {
  __typename?: 'HarnessModuleConnection'
  aggregate: Maybe<HarnessModuleAggregator>
  groupBy: Maybe<HarnessModuleGroupBy>
  values: Maybe<Array<Maybe<HarnessModule>>>
}

export type HarnessModuleConnectionCreated_At = {
  __typename?: 'HarnessModuleConnectionCreated_at'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['DateTime']>
}

export type HarnessModuleConnectionCreated_By = {
  __typename?: 'HarnessModuleConnectionCreated_by'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['ID']>
}

export type HarnessModuleConnectionId = {
  __typename?: 'HarnessModuleConnectionId'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['ID']>
}

export type HarnessModuleConnectionItem = {
  __typename?: 'HarnessModuleConnectionItem'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['String']>
}

export type HarnessModuleConnectionLink = {
  __typename?: 'HarnessModuleConnectionLink'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['String']>
}

export type HarnessModuleConnectionModuleDesc = {
  __typename?: 'HarnessModuleConnectionModuleDesc'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['String']>
}

export type HarnessModuleConnectionModuleName = {
  __typename?: 'HarnessModuleConnectionModuleName'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['String']>
}

export type HarnessModuleConnectionModuleStyle = {
  __typename?: 'HarnessModuleConnectionModuleStyle'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['String']>
}

export type HarnessModuleConnectionPublished_At = {
  __typename?: 'HarnessModuleConnectionPublished_at'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['DateTime']>
}

export type HarnessModuleConnectionUpdated_At = {
  __typename?: 'HarnessModuleConnectionUpdated_at'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['DateTime']>
}

export type HarnessModuleConnectionUpdated_By = {
  __typename?: 'HarnessModuleConnectionUpdated_by'
  connection: Maybe<HarnessModuleConnection>
  key: Maybe<Scalars['ID']>
}

export type HarnessModuleGroupBy = {
  __typename?: 'HarnessModuleGroupBy'
  created_at: Maybe<Array<Maybe<HarnessModuleConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<HarnessModuleConnectionCreated_By>>>
  id: Maybe<Array<Maybe<HarnessModuleConnectionId>>>
  item: Maybe<Array<Maybe<HarnessModuleConnectionItem>>>
  link: Maybe<Array<Maybe<HarnessModuleConnectionLink>>>
  moduleDesc: Maybe<Array<Maybe<HarnessModuleConnectionModuleDesc>>>
  moduleName: Maybe<Array<Maybe<HarnessModuleConnectionModuleName>>>
  moduleStyle: Maybe<Array<Maybe<HarnessModuleConnectionModuleStyle>>>
  published_at: Maybe<Array<Maybe<HarnessModuleConnectionPublished_At>>>
  updated_at: Maybe<Array<Maybe<HarnessModuleConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<HarnessModuleConnectionUpdated_By>>>
}

export type HarnessModuleInput = {
  created_by: InputMaybe<Scalars['ID']>
  item: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  moduleDesc: InputMaybe<Scalars['String']>
  moduleLogo: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  moduleName: InputMaybe<Scalars['String']>
  moduleStyle: InputMaybe<Enum_Harnessmodule_Modulestyle>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type HarnessSubscription = {
  __typename?: 'HarnessSubscription'
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  id: Scalars['ID']
  mainBody: Maybe<ComponentPageRichTextZone>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type HarnessSubscriptionInput = {
  created_by: InputMaybe<Scalars['ID']>
  mainBody: InputMaybe<ComponentPageRichTextZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type Home = {
  __typename?: 'Home'
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  explore: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  feature: Maybe<Array<Maybe<ComponentPageTextZone>>>
  id: Scalars['ID']
  published_at: Maybe<Scalars['DateTime']>
  title: Maybe<ComponentPageTitleZone>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type HomeInput = {
  caseStudies: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<ComponentPageCustomerLogoZoneInput>>>
  explore: InputMaybe<Array<InputMaybe<ComponentPageOptionZoneInput>>>
  feature: InputMaybe<Array<InputMaybe<ComponentPageTextZoneInput>>>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<ComponentPageTitleZoneInput>
  updated_by: InputMaybe<Scalars['ID']>
}

export type Industry = {
  __typename?: 'Industry'
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  id: Scalars['ID']
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type IndustryAggregator = {
  __typename?: 'IndustryAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type IndustryConnection = {
  __typename?: 'IndustryConnection'
  aggregate: Maybe<IndustryAggregator>
  groupBy: Maybe<IndustryGroupBy>
  values: Maybe<Array<Maybe<Industry>>>
}

export type IndustryConnectionCreated_At = {
  __typename?: 'IndustryConnectionCreated_at'
  connection: Maybe<IndustryConnection>
  key: Maybe<Scalars['DateTime']>
}

export type IndustryConnectionCreated_By = {
  __typename?: 'IndustryConnectionCreated_by'
  connection: Maybe<IndustryConnection>
  key: Maybe<Scalars['ID']>
}

export type IndustryConnectionId = {
  __typename?: 'IndustryConnectionId'
  connection: Maybe<IndustryConnection>
  key: Maybe<Scalars['ID']>
}

export type IndustryConnectionItem = {
  __typename?: 'IndustryConnectionItem'
  connection: Maybe<IndustryConnection>
  key: Maybe<Scalars['String']>
}

export type IndustryConnectionPublished_At = {
  __typename?: 'IndustryConnectionPublished_at'
  connection: Maybe<IndustryConnection>
  key: Maybe<Scalars['DateTime']>
}

export type IndustryConnectionUpdated_At = {
  __typename?: 'IndustryConnectionUpdated_at'
  connection: Maybe<IndustryConnection>
  key: Maybe<Scalars['DateTime']>
}

export type IndustryConnectionUpdated_By = {
  __typename?: 'IndustryConnectionUpdated_by'
  connection: Maybe<IndustryConnection>
  key: Maybe<Scalars['ID']>
}

export type IndustryGroupBy = {
  __typename?: 'IndustryGroupBy'
  created_at: Maybe<Array<Maybe<IndustryConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<IndustryConnectionCreated_By>>>
  id: Maybe<Array<Maybe<IndustryConnectionId>>>
  item: Maybe<Array<Maybe<IndustryConnectionItem>>>
  published_at: Maybe<Array<Maybe<IndustryConnectionPublished_At>>>
  updated_at: Maybe<Array<Maybe<IndustryConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<IndustryConnectionUpdated_By>>>
}

export type IndustryInput = {
  created_by: InputMaybe<Scalars['ID']>
  item: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type InputId = {
  id: Scalars['ID']
}

export type Integration = {
  __typename?: 'Integration'
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  id: Scalars['ID']
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type IntegrationAggregator = {
  __typename?: 'IntegrationAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type IntegrationConnection = {
  __typename?: 'IntegrationConnection'
  aggregate: Maybe<IntegrationAggregator>
  groupBy: Maybe<IntegrationGroupBy>
  values: Maybe<Array<Maybe<Integration>>>
}

export type IntegrationConnectionCreated_At = {
  __typename?: 'IntegrationConnectionCreated_at'
  connection: Maybe<IntegrationConnection>
  key: Maybe<Scalars['DateTime']>
}

export type IntegrationConnectionCreated_By = {
  __typename?: 'IntegrationConnectionCreated_by'
  connection: Maybe<IntegrationConnection>
  key: Maybe<Scalars['ID']>
}

export type IntegrationConnectionId = {
  __typename?: 'IntegrationConnectionId'
  connection: Maybe<IntegrationConnection>
  key: Maybe<Scalars['ID']>
}

export type IntegrationConnectionItem = {
  __typename?: 'IntegrationConnectionItem'
  connection: Maybe<IntegrationConnection>
  key: Maybe<Scalars['String']>
}

export type IntegrationConnectionPublished_At = {
  __typename?: 'IntegrationConnectionPublished_at'
  connection: Maybe<IntegrationConnection>
  key: Maybe<Scalars['DateTime']>
}

export type IntegrationConnectionUpdated_At = {
  __typename?: 'IntegrationConnectionUpdated_at'
  connection: Maybe<IntegrationConnection>
  key: Maybe<Scalars['DateTime']>
}

export type IntegrationConnectionUpdated_By = {
  __typename?: 'IntegrationConnectionUpdated_by'
  connection: Maybe<IntegrationConnection>
  key: Maybe<Scalars['ID']>
}

export type IntegrationGroupBy = {
  __typename?: 'IntegrationGroupBy'
  created_at: Maybe<Array<Maybe<IntegrationConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<IntegrationConnectionCreated_By>>>
  id: Maybe<Array<Maybe<IntegrationConnectionId>>>
  item: Maybe<Array<Maybe<IntegrationConnectionItem>>>
  published_at: Maybe<Array<Maybe<IntegrationConnectionPublished_At>>>
  updated_at: Maybe<Array<Maybe<IntegrationConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<IntegrationConnectionUpdated_By>>>
}

export type IntegrationInput = {
  created_by: InputMaybe<Scalars['ID']>
  item: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type MarketingSite = {
  __typename?: 'MarketingSite'
  aiDesc: Maybe<Scalars['String']>
  aiTitle: Maybe<Scalars['String']>
  caseStudy1: Maybe<Scalars['String']>
  caseStudy1Client: Maybe<Scalars['String']>
  caseStudy2: Maybe<Scalars['String']>
  caseStudy2Client: Maybe<Scalars['String']>
  cdDesc: Maybe<Scalars['String']>
  cdSubTitle: Maybe<Scalars['String']>
  cdTitle: Maybe<Scalars['String']>
  chIntelDesc: Maybe<Scalars['String']>
  chIntelSubTitle: Maybe<Scalars['String']>
  chIntelTitle: Maybe<Scalars['String']>
  ciDesc: Maybe<Scalars['String']>
  ciSubTitle: Maybe<Scalars['String']>
  ciTitle: Maybe<Scalars['String']>
  cloudCostDesc: Maybe<Scalars['String']>
  cloudCostSubTitle: Maybe<Scalars['String']>
  cloudCostTitle: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  developerDesc: Maybe<Scalars['String']>
  developerTitle: Maybe<Scalars['String']>
  featureFlagsDesc: Maybe<Scalars['String']>
  featureFlagsSubTitle: Maybe<Scalars['String']>
  featureFlagsTitle: Maybe<Scalars['String']>
  governaceDesc: Maybe<Scalars['String']>
  governaceTitle: Maybe<Scalars['String']>
  heroSubTitle: Maybe<Scalars['String']>
  heroTitle: Maybe<Scalars['String']>
  id: Scalars['ID']
  name: Maybe<Scalars['String']>
  pipelineDesc: Maybe<Scalars['String']>
  piplineTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type MarketingSiteAggregator = {
  __typename?: 'MarketingSiteAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type MarketingSiteConnection = {
  __typename?: 'MarketingSiteConnection'
  aggregate: Maybe<MarketingSiteAggregator>
  groupBy: Maybe<MarketingSiteGroupBy>
  values: Maybe<Array<Maybe<MarketingSite>>>
}

export type MarketingSiteConnectionAiDesc = {
  __typename?: 'MarketingSiteConnectionAiDesc'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionAiTitle = {
  __typename?: 'MarketingSiteConnectionAiTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCaseStudy1 = {
  __typename?: 'MarketingSiteConnectionCaseStudy1'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCaseStudy1Client = {
  __typename?: 'MarketingSiteConnectionCaseStudy1Client'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCaseStudy2 = {
  __typename?: 'MarketingSiteConnectionCaseStudy2'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCaseStudy2Client = {
  __typename?: 'MarketingSiteConnectionCaseStudy2Client'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCdDesc = {
  __typename?: 'MarketingSiteConnectionCdDesc'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCdSubTitle = {
  __typename?: 'MarketingSiteConnectionCdSubTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCdTitle = {
  __typename?: 'MarketingSiteConnectionCdTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionChIntelDesc = {
  __typename?: 'MarketingSiteConnectionChIntelDesc'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionChIntelSubTitle = {
  __typename?: 'MarketingSiteConnectionChIntelSubTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionChIntelTitle = {
  __typename?: 'MarketingSiteConnectionChIntelTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCiDesc = {
  __typename?: 'MarketingSiteConnectionCiDesc'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCiSubTitle = {
  __typename?: 'MarketingSiteConnectionCiSubTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCiTitle = {
  __typename?: 'MarketingSiteConnectionCiTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCloudCostDesc = {
  __typename?: 'MarketingSiteConnectionCloudCostDesc'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCloudCostSubTitle = {
  __typename?: 'MarketingSiteConnectionCloudCostSubTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCloudCostTitle = {
  __typename?: 'MarketingSiteConnectionCloudCostTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionCreated_At = {
  __typename?: 'MarketingSiteConnectionCreated_at'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['DateTime']>
}

export type MarketingSiteConnectionCreated_By = {
  __typename?: 'MarketingSiteConnectionCreated_by'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['ID']>
}

export type MarketingSiteConnectionDeveloperDesc = {
  __typename?: 'MarketingSiteConnectionDeveloperDesc'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionDeveloperTitle = {
  __typename?: 'MarketingSiteConnectionDeveloperTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionFeatureFlagsDesc = {
  __typename?: 'MarketingSiteConnectionFeatureFlagsDesc'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionFeatureFlagsSubTitle = {
  __typename?: 'MarketingSiteConnectionFeatureFlagsSubTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionFeatureFlagsTitle = {
  __typename?: 'MarketingSiteConnectionFeatureFlagsTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionGovernaceDesc = {
  __typename?: 'MarketingSiteConnectionGovernaceDesc'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionGovernaceTitle = {
  __typename?: 'MarketingSiteConnectionGovernaceTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionHeroSubTitle = {
  __typename?: 'MarketingSiteConnectionHeroSubTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionHeroTitle = {
  __typename?: 'MarketingSiteConnectionHeroTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionId = {
  __typename?: 'MarketingSiteConnectionId'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['ID']>
}

export type MarketingSiteConnectionName = {
  __typename?: 'MarketingSiteConnectionName'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionPipelineDesc = {
  __typename?: 'MarketingSiteConnectionPipelineDesc'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionPiplineTitle = {
  __typename?: 'MarketingSiteConnectionPiplineTitle'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['String']>
}

export type MarketingSiteConnectionPublished_At = {
  __typename?: 'MarketingSiteConnectionPublished_at'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['DateTime']>
}

export type MarketingSiteConnectionUpdated_At = {
  __typename?: 'MarketingSiteConnectionUpdated_at'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['DateTime']>
}

export type MarketingSiteConnectionUpdated_By = {
  __typename?: 'MarketingSiteConnectionUpdated_by'
  connection: Maybe<MarketingSiteConnection>
  key: Maybe<Scalars['ID']>
}

export type MarketingSiteGroupBy = {
  __typename?: 'MarketingSiteGroupBy'
  aiDesc: Maybe<Array<Maybe<MarketingSiteConnectionAiDesc>>>
  aiTitle: Maybe<Array<Maybe<MarketingSiteConnectionAiTitle>>>
  caseStudy1: Maybe<Array<Maybe<MarketingSiteConnectionCaseStudy1>>>
  caseStudy1Client: Maybe<Array<Maybe<MarketingSiteConnectionCaseStudy1Client>>>
  caseStudy2: Maybe<Array<Maybe<MarketingSiteConnectionCaseStudy2>>>
  caseStudy2Client: Maybe<Array<Maybe<MarketingSiteConnectionCaseStudy2Client>>>
  cdDesc: Maybe<Array<Maybe<MarketingSiteConnectionCdDesc>>>
  cdSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionCdSubTitle>>>
  cdTitle: Maybe<Array<Maybe<MarketingSiteConnectionCdTitle>>>
  chIntelDesc: Maybe<Array<Maybe<MarketingSiteConnectionChIntelDesc>>>
  chIntelSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionChIntelSubTitle>>>
  chIntelTitle: Maybe<Array<Maybe<MarketingSiteConnectionChIntelTitle>>>
  ciDesc: Maybe<Array<Maybe<MarketingSiteConnectionCiDesc>>>
  ciSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionCiSubTitle>>>
  ciTitle: Maybe<Array<Maybe<MarketingSiteConnectionCiTitle>>>
  cloudCostDesc: Maybe<Array<Maybe<MarketingSiteConnectionCloudCostDesc>>>
  cloudCostSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionCloudCostSubTitle>>>
  cloudCostTitle: Maybe<Array<Maybe<MarketingSiteConnectionCloudCostTitle>>>
  created_at: Maybe<Array<Maybe<MarketingSiteConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<MarketingSiteConnectionCreated_By>>>
  developerDesc: Maybe<Array<Maybe<MarketingSiteConnectionDeveloperDesc>>>
  developerTitle: Maybe<Array<Maybe<MarketingSiteConnectionDeveloperTitle>>>
  featureFlagsDesc: Maybe<Array<Maybe<MarketingSiteConnectionFeatureFlagsDesc>>>
  featureFlagsSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionFeatureFlagsSubTitle>>>
  featureFlagsTitle: Maybe<Array<Maybe<MarketingSiteConnectionFeatureFlagsTitle>>>
  governaceDesc: Maybe<Array<Maybe<MarketingSiteConnectionGovernaceDesc>>>
  governaceTitle: Maybe<Array<Maybe<MarketingSiteConnectionGovernaceTitle>>>
  heroSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionHeroSubTitle>>>
  heroTitle: Maybe<Array<Maybe<MarketingSiteConnectionHeroTitle>>>
  id: Maybe<Array<Maybe<MarketingSiteConnectionId>>>
  name: Maybe<Array<Maybe<MarketingSiteConnectionName>>>
  pipelineDesc: Maybe<Array<Maybe<MarketingSiteConnectionPipelineDesc>>>
  piplineTitle: Maybe<Array<Maybe<MarketingSiteConnectionPiplineTitle>>>
  published_at: Maybe<Array<Maybe<MarketingSiteConnectionPublished_At>>>
  updated_at: Maybe<Array<Maybe<MarketingSiteConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<MarketingSiteConnectionUpdated_By>>>
}

export type MarketingSiteInput = {
  aiDesc: InputMaybe<Scalars['String']>
  aiTitle: InputMaybe<Scalars['String']>
  caseStudy1: InputMaybe<Scalars['String']>
  caseStudy1Client: InputMaybe<Scalars['String']>
  caseStudy2: InputMaybe<Scalars['String']>
  caseStudy2Client: InputMaybe<Scalars['String']>
  cdDesc: InputMaybe<Scalars['String']>
  cdSubTitle: InputMaybe<Scalars['String']>
  cdTitle: InputMaybe<Scalars['String']>
  chIntelDesc: InputMaybe<Scalars['String']>
  chIntelSubTitle: InputMaybe<Scalars['String']>
  chIntelTitle: InputMaybe<Scalars['String']>
  ciDesc: InputMaybe<Scalars['String']>
  ciSubTitle: InputMaybe<Scalars['String']>
  ciTitle: InputMaybe<Scalars['String']>
  cloudCostDesc: InputMaybe<Scalars['String']>
  cloudCostSubTitle: InputMaybe<Scalars['String']>
  cloudCostTitle: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  developerDesc: InputMaybe<Scalars['String']>
  developerTitle: InputMaybe<Scalars['String']>
  featureFlagsDesc: InputMaybe<Scalars['String']>
  featureFlagsSubTitle: InputMaybe<Scalars['String']>
  featureFlagsTitle: InputMaybe<Scalars['String']>
  governaceDesc: InputMaybe<Scalars['String']>
  governaceTitle: InputMaybe<Scalars['String']>
  heroSubTitle: InputMaybe<Scalars['String']>
  heroTitle: InputMaybe<Scalars['String']>
  name: InputMaybe<Scalars['String']>
  pipelineDesc: InputMaybe<Scalars['String']>
  piplineTitle: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type Morph =
  | AboutUs
  | BackgroundColor
  | BackgroundColorAggregator
  | BackgroundColorConnection
  | BackgroundColorConnectionColorCode
  | BackgroundColorConnectionColorName
  | BackgroundColorConnectionCreated_At
  | BackgroundColorConnectionCreated_By
  | BackgroundColorConnectionId
  | BackgroundColorConnectionPublished_At
  | BackgroundColorConnectionUpdated_At
  | BackgroundColorConnectionUpdated_By
  | BackgroundColorGroupBy
  | Careers
  | CaseStudy
  | CaseStudyAggregator
  | CaseStudyConnection
  | CaseStudyConnectionBackground_Color
  | CaseStudyConnectionCompanyLogo
  | CaseStudyConnectionCompany_Size
  | CaseStudyConnectionCreated_At
  | CaseStudyConnectionCreated_By
  | CaseStudyConnectionDescription
  | CaseStudyConnectionId
  | CaseStudyConnectionIndustry
  | CaseStudyConnectionPublished_At
  | CaseStudyConnectionTitle
  | CaseStudyConnectionUpdated_At
  | CaseStudyConnectionUpdated_By
  | CaseStudyConnectionVideoLink
  | CaseStudyGroupBy
  | CompanySize
  | CompanySizeAggregator
  | CompanySizeConnection
  | CompanySizeConnectionCreated_At
  | CompanySizeConnectionCreated_By
  | CompanySizeConnectionId
  | CompanySizeConnectionItem
  | CompanySizeConnectionPublished_At
  | CompanySizeConnectionUpdated_At
  | CompanySizeConnectionUpdated_By
  | CompanySizeGroupBy
  | CompetitorComparison
  | CompetitorComparisonAggregator
  | CompetitorComparisonConnection
  | CompetitorComparisonConnectionCaseStudy
  | CompetitorComparisonConnectionCompetitor
  | CompetitorComparisonConnectionCompetitorLogo
  | CompetitorComparisonConnectionCompetitorSummary
  | CompetitorComparisonConnectionCreated_At
  | CompetitorComparisonConnectionCreated_By
  | CompetitorComparisonConnectionDetailedFeatureComparison
  | CompetitorComparisonConnectionFeatureComparison
  | CompetitorComparisonConnectionHarnessLogo
  | CompetitorComparisonConnectionHarnessModule
  | CompetitorComparisonConnectionHarnessSummary
  | CompetitorComparisonConnectionId
  | CompetitorComparisonConnectionPublished_At
  | CompetitorComparisonConnectionRecommended
  | CompetitorComparisonConnectionScreenshot
  | CompetitorComparisonConnectionSlug
  | CompetitorComparisonConnectionUpdated_At
  | CompetitorComparisonConnectionUpdated_By
  | CompetitorComparisonGroupBy
  | ComponentCompanyPageAdressZone
  | ComponentCompanyPageOfficesZone
  | ComponentCompetitorComparisonPageComparisonCaseStudy
  | ComponentCompetitorComparisonPageDetailedFeatureComparison
  | ComponentCompetitorComparisonPageFeatureComparison
  | ComponentCompetitorComparisonPageProductDetailedFeature
  | ComponentCompetitorComparisonPageProductFeature
  | ComponentCompetitorComparisonPageProductSummaryZone
  | ComponentPageCaseListZone
  | ComponentPageCaseStudyZone
  | ComponentPageCustomerLogoZone
  | ComponentPageExecutiveZone
  | ComponentPageFeatureLIstZone
  | ComponentPageHarnessModule
  | ComponentPageImagePlus
  | ComponentPageImageZone
  | ComponentPageMiniTitleZone
  | ComponentPageModules
  | ComponentPageMultiImgListZone
  | ComponentPageMultiImgZone
  | ComponentPageNewsZone
  | ComponentPageOptionZone
  | ComponentPageProductIntroLogoZone
  | ComponentPageProductTitleZone
  | ComponentPageQuoteZone
  | ComponentPageRichTextZone
  | ComponentPageScreenshotZone
  | ComponentPageSectionOptions
  | ComponentPageSectionSecurity
  | ComponentPageSimpleTitleZone
  | ComponentPageSimpleZone
  | ComponentPageTeamZone
  | ComponentPageTextImageZone
  | ComponentPageTextZone
  | ComponentPageTitleImgZone
  | ComponentPageTitleZone
  | ComponentPageWorkflow
  | ComponentPageWorkflowCard
  | ComponentPricingPageCallOut
  | ComponentPricingPageDetailedFeature
  | ComponentPricingPageFaq
  | ComponentPricingPageFeatureCaption
  | ComponentPricingPageFeatureGroup
  | ComponentPricingPageMorePlansZone
  | ComponentPricingPagePlansZone
  | ComponentPricingPageTooltipsZone
  | ComponentProductPageIntegrationZone
  | ComponentProductPageIntegrationsZone
  | ContactSale
  | ContactSaleAggregator
  | ContactSaleConnection
  | ContactSaleConnectionCompany
  | ContactSaleConnectionCreated_At
  | ContactSaleConnectionCreated_By
  | ContactSaleConnectionEmail
  | ContactSaleConnectionFirstName
  | ContactSaleConnectionId
  | ContactSaleConnectionLastName
  | ContactSaleConnectionPhone
  | ContactSaleConnectionPublished_At
  | ContactSaleConnectionTitle
  | ContactSaleConnectionUpdated_At
  | ContactSaleConnectionUpdated_By
  | ContactSaleGroupBy
  | ContactUs
  | ContactUsAggregator
  | ContactUsConnection
  | ContactUsConnectionCompany
  | ContactUsConnectionCreated_At
  | ContactUsConnectionCreated_By
  | ContactUsConnectionEmail
  | ContactUsConnectionFirstName
  | ContactUsConnectionId
  | ContactUsConnectionLastName
  | ContactUsConnectionPhone
  | ContactUsConnectionPublished_At
  | ContactUsConnectionTitle
  | ContactUsConnectionUpdated_At
  | ContactUsConnectionUpdated_By
  | ContactUsGroupBy
  | Customer
  | DevOpsTools
  | EBook
  | EBookAggregator
  | EBookAggregatorAvg
  | EBookAggregatorMax
  | EBookAggregatorMin
  | EBookAggregatorSum
  | EBookConnection
  | EBookConnectionContent
  | EBookConnectionCreated_At
  | EBookConnectionCreated_By
  | EBookConnectionDetail_Image
  | EBookConnectionId
  | EBookConnectionMkto_Form_Id
  | EBookConnectionPdf
  | EBookConnectionPreview_Image
  | EBookConnectionPublished
  | EBookConnectionPublished_At
  | EBookConnectionSlug
  | EBookConnectionTitle
  | EBookConnectionUpdated_At
  | EBookConnectionUpdated_By
  | EBookGroupBy
  | Event
  | EventAggregator
  | EventConnection
  | EventConnectionCreated_At
  | EventConnectionCreated_By
  | EventConnectionDetailsLeftColumn
  | EventConnectionDetailsRightColumn
  | EventConnectionId
  | EventConnectionMktoFormTitle
  | EventConnectionMkto_Form_Id
  | EventConnectionProfilesHeading
  | EventConnectionPublished_At
  | EventConnectionRegisterImage
  | EventConnectionRegistration
  | EventConnectionSlug
  | EventConnectionTitle
  | EventConnectionTopBannerImg
  | EventConnectionTopBannerText
  | EventConnectionUpdated_At
  | EventConnectionUpdated_By
  | EventGroupBy
  | HarnessModule
  | HarnessModuleAggregator
  | HarnessModuleConnection
  | HarnessModuleConnectionCreated_At
  | HarnessModuleConnectionCreated_By
  | HarnessModuleConnectionId
  | HarnessModuleConnectionItem
  | HarnessModuleConnectionLink
  | HarnessModuleConnectionModuleDesc
  | HarnessModuleConnectionModuleName
  | HarnessModuleConnectionModuleStyle
  | HarnessModuleConnectionPublished_At
  | HarnessModuleConnectionUpdated_At
  | HarnessModuleConnectionUpdated_By
  | HarnessModuleGroupBy
  | HarnessSubscription
  | Home
  | Industry
  | IndustryAggregator
  | IndustryConnection
  | IndustryConnectionCreated_At
  | IndustryConnectionCreated_By
  | IndustryConnectionId
  | IndustryConnectionItem
  | IndustryConnectionPublished_At
  | IndustryConnectionUpdated_At
  | IndustryConnectionUpdated_By
  | IndustryGroupBy
  | Integration
  | IntegrationAggregator
  | IntegrationConnection
  | IntegrationConnectionCreated_At
  | IntegrationConnectionCreated_By
  | IntegrationConnectionId
  | IntegrationConnectionItem
  | IntegrationConnectionPublished_At
  | IntegrationConnectionUpdated_At
  | IntegrationConnectionUpdated_By
  | IntegrationGroupBy
  | MarketingSite
  | MarketingSiteAggregator
  | MarketingSiteConnection
  | MarketingSiteConnectionAiDesc
  | MarketingSiteConnectionAiTitle
  | MarketingSiteConnectionCaseStudy1
  | MarketingSiteConnectionCaseStudy1Client
  | MarketingSiteConnectionCaseStudy2
  | MarketingSiteConnectionCaseStudy2Client
  | MarketingSiteConnectionCdDesc
  | MarketingSiteConnectionCdSubTitle
  | MarketingSiteConnectionCdTitle
  | MarketingSiteConnectionChIntelDesc
  | MarketingSiteConnectionChIntelSubTitle
  | MarketingSiteConnectionChIntelTitle
  | MarketingSiteConnectionCiDesc
  | MarketingSiteConnectionCiSubTitle
  | MarketingSiteConnectionCiTitle
  | MarketingSiteConnectionCloudCostDesc
  | MarketingSiteConnectionCloudCostSubTitle
  | MarketingSiteConnectionCloudCostTitle
  | MarketingSiteConnectionCreated_At
  | MarketingSiteConnectionCreated_By
  | MarketingSiteConnectionDeveloperDesc
  | MarketingSiteConnectionDeveloperTitle
  | MarketingSiteConnectionFeatureFlagsDesc
  | MarketingSiteConnectionFeatureFlagsSubTitle
  | MarketingSiteConnectionFeatureFlagsTitle
  | MarketingSiteConnectionGovernaceDesc
  | MarketingSiteConnectionGovernaceTitle
  | MarketingSiteConnectionHeroSubTitle
  | MarketingSiteConnectionHeroTitle
  | MarketingSiteConnectionId
  | MarketingSiteConnectionName
  | MarketingSiteConnectionPipelineDesc
  | MarketingSiteConnectionPiplineTitle
  | MarketingSiteConnectionPublished_At
  | MarketingSiteConnectionUpdated_At
  | MarketingSiteConnectionUpdated_By
  | MarketingSiteGroupBy
  | Outcome
  | OutcomeAggregator
  | OutcomeConnection
  | OutcomeConnectionCreated_At
  | OutcomeConnectionCreated_By
  | OutcomeConnectionId
  | OutcomeConnectionItem
  | OutcomeConnectionPublished_At
  | OutcomeConnectionUpdated_At
  | OutcomeConnectionUpdated_By
  | OutcomeGroupBy
  | Panelist
  | PanelistAggregator
  | PanelistConnection
  | PanelistConnectionCompany
  | PanelistConnectionCreated_At
  | PanelistConnectionCreated_By
  | PanelistConnectionFirstName
  | PanelistConnectionId
  | PanelistConnectionJobTitle
  | PanelistConnectionLastName
  | PanelistConnectionProfile_Image
  | PanelistConnectionPublished_At
  | PanelistConnectionUpdated_At
  | PanelistConnectionUpdated_By
  | PanelistGroupBy
  | Partners
  | PressAndNews
  | Pricing
  | Privacy
  | ProductCd
  | ProductChangeIntelligence
  | ProductCi
  | ProductCloudCost
  | ProductFeatureFlags
  | ProductPlatform
  | UploadFile
  | UploadFileAggregator
  | UploadFileAggregatorAvg
  | UploadFileAggregatorMax
  | UploadFileAggregatorMin
  | UploadFileAggregatorSum
  | UploadFileConnection
  | UploadFileConnectionAlternativeText
  | UploadFileConnectionCaption
  | UploadFileConnectionCreated_At
  | UploadFileConnectionCreated_By
  | UploadFileConnectionExt
  | UploadFileConnectionFormats
  | UploadFileConnectionHash
  | UploadFileConnectionHeight
  | UploadFileConnectionId
  | UploadFileConnectionMime
  | UploadFileConnectionName
  | UploadFileConnectionPreviewUrl
  | UploadFileConnectionProvider
  | UploadFileConnectionProvider_Metadata
  | UploadFileConnectionSize
  | UploadFileConnectionUpdated_At
  | UploadFileConnectionUpdated_By
  | UploadFileConnectionUrl
  | UploadFileConnectionWidth
  | UploadFileGroupBy
  | UserPermissionsPasswordPayload
  | UsersPermissionsLoginPayload
  | UsersPermissionsMe
  | UsersPermissionsMeRole
  | UsersPermissionsPermission
  | UsersPermissionsRole
  | UsersPermissionsRoleAggregator
  | UsersPermissionsRoleConnection
  | UsersPermissionsRoleConnectionCreated_By
  | UsersPermissionsRoleConnectionDescription
  | UsersPermissionsRoleConnectionId
  | UsersPermissionsRoleConnectionName
  | UsersPermissionsRoleConnectionType
  | UsersPermissionsRoleConnectionUpdated_By
  | UsersPermissionsRoleGroupBy
  | UsersPermissionsUser
  | UsersPermissionsUserAggregator
  | UsersPermissionsUserConnection
  | UsersPermissionsUserConnectionBlocked
  | UsersPermissionsUserConnectionCompany
  | UsersPermissionsUserConnectionConfirmationToken
  | UsersPermissionsUserConnectionConfirmed
  | UsersPermissionsUserConnectionCreated_At
  | UsersPermissionsUserConnectionCreated_By
  | UsersPermissionsUserConnectionEmail
  | UsersPermissionsUserConnectionId
  | UsersPermissionsUserConnectionInterest
  | UsersPermissionsUserConnectionOccupation
  | UsersPermissionsUserConnectionPassword
  | UsersPermissionsUserConnectionProvider
  | UsersPermissionsUserConnectionResetPasswordToken
  | UsersPermissionsUserConnectionRole
  | UsersPermissionsUserConnectionUpdated_At
  | UsersPermissionsUserConnectionUpdated_By
  | UsersPermissionsUserConnectionUsername
  | UsersPermissionsUserGroupBy
  | Video
  | VideoAggregator
  | VideoAggregatorAvg
  | VideoAggregatorMax
  | VideoAggregatorMin
  | VideoAggregatorSum
  | VideoConnection
  | VideoConnectionContent
  | VideoConnectionCreated_At
  | VideoConnectionCreated_By
  | VideoConnectionDuration
  | VideoConnectionId
  | VideoConnectionMkto_Form_Id
  | VideoConnectionPreview_Image
  | VideoConnectionPublished
  | VideoConnectionPublished_At
  | VideoConnectionRegistration
  | VideoConnectionSlug
  | VideoConnectionTitle
  | VideoConnectionUpdated_At
  | VideoConnectionUpdated_By
  | VideoConnectionVideoType
  | VideoGroupBy
  | Webinars
  | WebinarsAggregator
  | WebinarsAggregatorAvg
  | WebinarsAggregatorMax
  | WebinarsAggregatorMin
  | WebinarsAggregatorSum
  | WebinarsConnection
  | WebinarsConnectionContent
  | WebinarsConnectionCreated_At
  | WebinarsConnectionCreated_By
  | WebinarsConnectionEventDateTime
  | WebinarsConnectionEventType
  | WebinarsConnectionId
  | WebinarsConnectionMkto_Form_Id
  | WebinarsConnectionPreview_Image
  | WebinarsConnectionPublished
  | WebinarsConnectionPublished_At
  | WebinarsConnectionSlug
  | WebinarsConnectionTitle
  | WebinarsConnectionUpdated_At
  | WebinarsConnectionUpdated_By
  | WebinarsGroupBy
  | WebsiteTermsOfUse
  | CreateBackgroundColorPayload
  | CreateCaseStudyPayload
  | CreateCompanySizePayload
  | CreateCompetitorComparisonPayload
  | CreateContactSalePayload
  | CreateContactUsPayload
  | CreateEBookPayload
  | CreateEventPayload
  | CreateHarnessModulePayload
  | CreateIndustryPayload
  | CreateIntegrationPayload
  | CreateMarketingSitePayload
  | CreateOutcomePayload
  | CreatePanelistPayload
  | CreateRolePayload
  | CreateUserPayload
  | CreateVideoPayload
  | CreateWebinarPayload
  | DeleteAboutUsPayload
  | DeleteBackgroundColorPayload
  | DeleteCareerPayload
  | DeleteCaseStudyPayload
  | DeleteCompanySizePayload
  | DeleteCompetitorComparisonPayload
  | DeleteContactSalePayload
  | DeleteContactUsPayload
  | DeleteCustomerPayload
  | DeleteDevOpsToolPayload
  | DeleteEBookPayload
  | DeleteEventPayload
  | DeleteFilePayload
  | DeleteHarnessModulePayload
  | DeleteHarnessSubscriptionPayload
  | DeleteHomePayload
  | DeleteIndustryPayload
  | DeleteIntegrationPayload
  | DeleteMarketingSitePayload
  | DeleteOutcomePayload
  | DeletePanelistPayload
  | DeletePartnerPayload
  | DeletePressAndNewPayload
  | DeletePricingPayload
  | DeletePrivacyPayload
  | DeleteProductCdPayload
  | DeleteProductChangeIntelligencePayload
  | DeleteProductCiPayload
  | DeleteProductCloudCostPayload
  | DeleteProductFeatureFlagPayload
  | DeleteProductPlatformPayload
  | DeleteRolePayload
  | DeleteUserPayload
  | DeleteVideoPayload
  | DeleteWebinarPayload
  | DeleteWebsiteTermsOfUsePayload
  | UpdateAboutUsPayload
  | UpdateBackgroundColorPayload
  | UpdateCareerPayload
  | UpdateCaseStudyPayload
  | UpdateCompanySizePayload
  | UpdateCompetitorComparisonPayload
  | UpdateContactSalePayload
  | UpdateContactUsPayload
  | UpdateCustomerPayload
  | UpdateDevOpsToolPayload
  | UpdateEBookPayload
  | UpdateEventPayload
  | UpdateHarnessModulePayload
  | UpdateHarnessSubscriptionPayload
  | UpdateHomePayload
  | UpdateIndustryPayload
  | UpdateIntegrationPayload
  | UpdateMarketingSitePayload
  | UpdateOutcomePayload
  | UpdatePanelistPayload
  | UpdatePartnerPayload
  | UpdatePressAndNewPayload
  | UpdatePricingPayload
  | UpdatePrivacyPayload
  | UpdateProductCdPayload
  | UpdateProductChangeIntelligencePayload
  | UpdateProductCiPayload
  | UpdateProductCloudCostPayload
  | UpdateProductFeatureFlagPayload
  | UpdateProductPlatformPayload
  | UpdateRolePayload
  | UpdateUserPayload
  | UpdateVideoPayload
  | UpdateWebinarPayload
  | UpdateWebsiteTermsOfUsePayload

export type Mutation = {
  __typename?: 'Mutation'
  createBackgroundColor: Maybe<CreateBackgroundColorPayload>
  createCaseStudy: Maybe<CreateCaseStudyPayload>
  createCompanySize: Maybe<CreateCompanySizePayload>
  createCompetitorComparison: Maybe<CreateCompetitorComparisonPayload>
  createContactSale: Maybe<CreateContactSalePayload>
  createContactUs: Maybe<CreateContactUsPayload>
  createEBook: Maybe<CreateEBookPayload>
  createEvent: Maybe<CreateEventPayload>
  createHarnessModule: Maybe<CreateHarnessModulePayload>
  createIndustry: Maybe<CreateIndustryPayload>
  createIntegration: Maybe<CreateIntegrationPayload>
  createMarketingSite: Maybe<CreateMarketingSitePayload>
  createOutcome: Maybe<CreateOutcomePayload>
  createPanelist: Maybe<CreatePanelistPayload>
  /** Create a new role */
  createRole: Maybe<CreateRolePayload>
  /** Create a new user */
  createUser: Maybe<CreateUserPayload>
  createVideo: Maybe<CreateVideoPayload>
  createWebinar: Maybe<CreateWebinarPayload>
  deleteAboutUs: Maybe<DeleteAboutUsPayload>
  deleteBackgroundColor: Maybe<DeleteBackgroundColorPayload>
  deleteCareer: Maybe<DeleteCareerPayload>
  deleteCaseStudy: Maybe<DeleteCaseStudyPayload>
  deleteCompanySize: Maybe<DeleteCompanySizePayload>
  deleteCompetitorComparison: Maybe<DeleteCompetitorComparisonPayload>
  deleteContactSale: Maybe<DeleteContactSalePayload>
  deleteContactUs: Maybe<DeleteContactUsPayload>
  deleteCustomer: Maybe<DeleteCustomerPayload>
  deleteDevOpsTool: Maybe<DeleteDevOpsToolPayload>
  deleteEBook: Maybe<DeleteEBookPayload>
  deleteEvent: Maybe<DeleteEventPayload>
  /** Delete one file */
  deleteFile: Maybe<DeleteFilePayload>
  deleteHarnessModule: Maybe<DeleteHarnessModulePayload>
  deleteHarnessSubscription: Maybe<DeleteHarnessSubscriptionPayload>
  deleteHome: Maybe<DeleteHomePayload>
  deleteIndustry: Maybe<DeleteIndustryPayload>
  deleteIntegration: Maybe<DeleteIntegrationPayload>
  deleteMarketingSite: Maybe<DeleteMarketingSitePayload>
  deleteOutcome: Maybe<DeleteOutcomePayload>
  deletePanelist: Maybe<DeletePanelistPayload>
  deletePartner: Maybe<DeletePartnerPayload>
  deletePressAndNew: Maybe<DeletePressAndNewPayload>
  deletePricing: Maybe<DeletePricingPayload>
  deletePrivacy: Maybe<DeletePrivacyPayload>
  deleteProductCd: Maybe<DeleteProductCdPayload>
  deleteProductChangeIntelligence: Maybe<DeleteProductChangeIntelligencePayload>
  deleteProductCi: Maybe<DeleteProductCiPayload>
  deleteProductCloudCost: Maybe<DeleteProductCloudCostPayload>
  deleteProductFeatureFlag: Maybe<DeleteProductFeatureFlagPayload>
  deleteProductPlatform: Maybe<DeleteProductPlatformPayload>
  /** Delete an existing role */
  deleteRole: Maybe<DeleteRolePayload>
  /** Delete an existing user */
  deleteUser: Maybe<DeleteUserPayload>
  deleteVideo: Maybe<DeleteVideoPayload>
  deleteWebinar: Maybe<DeleteWebinarPayload>
  deleteWebsiteTermsOfUse: Maybe<DeleteWebsiteTermsOfUsePayload>
  emailConfirmation: Maybe<UsersPermissionsLoginPayload>
  forgotPassword: Maybe<UserPermissionsPasswordPayload>
  login: UsersPermissionsLoginPayload
  multipleUpload: Array<Maybe<UploadFile>>
  register: UsersPermissionsLoginPayload
  resetPassword: Maybe<UsersPermissionsLoginPayload>
  updateAboutUs: Maybe<UpdateAboutUsPayload>
  updateBackgroundColor: Maybe<UpdateBackgroundColorPayload>
  updateCareer: Maybe<UpdateCareerPayload>
  updateCaseStudy: Maybe<UpdateCaseStudyPayload>
  updateCompanySize: Maybe<UpdateCompanySizePayload>
  updateCompetitorComparison: Maybe<UpdateCompetitorComparisonPayload>
  updateContactSale: Maybe<UpdateContactSalePayload>
  updateContactUs: Maybe<UpdateContactUsPayload>
  updateCustomer: Maybe<UpdateCustomerPayload>
  updateDevOpsTool: Maybe<UpdateDevOpsToolPayload>
  updateEBook: Maybe<UpdateEBookPayload>
  updateEvent: Maybe<UpdateEventPayload>
  updateFileInfo: UploadFile
  updateHarnessModule: Maybe<UpdateHarnessModulePayload>
  updateHarnessSubscription: Maybe<UpdateHarnessSubscriptionPayload>
  updateHome: Maybe<UpdateHomePayload>
  updateIndustry: Maybe<UpdateIndustryPayload>
  updateIntegration: Maybe<UpdateIntegrationPayload>
  updateMarketingSite: Maybe<UpdateMarketingSitePayload>
  updateOutcome: Maybe<UpdateOutcomePayload>
  updatePanelist: Maybe<UpdatePanelistPayload>
  updatePartner: Maybe<UpdatePartnerPayload>
  updatePressAndNew: Maybe<UpdatePressAndNewPayload>
  updatePricing: Maybe<UpdatePricingPayload>
  updatePrivacy: Maybe<UpdatePrivacyPayload>
  updateProductCd: Maybe<UpdateProductCdPayload>
  updateProductChangeIntelligence: Maybe<UpdateProductChangeIntelligencePayload>
  updateProductCi: Maybe<UpdateProductCiPayload>
  updateProductCloudCost: Maybe<UpdateProductCloudCostPayload>
  updateProductFeatureFlag: Maybe<UpdateProductFeatureFlagPayload>
  updateProductPlatform: Maybe<UpdateProductPlatformPayload>
  /** Update an existing role */
  updateRole: Maybe<UpdateRolePayload>
  /** Update an existing user */
  updateUser: Maybe<UpdateUserPayload>
  updateVideo: Maybe<UpdateVideoPayload>
  updateWebinar: Maybe<UpdateWebinarPayload>
  updateWebsiteTermsOfUse: Maybe<UpdateWebsiteTermsOfUsePayload>
  upload: UploadFile
}

export type MutationCreateBackgroundColorArgs = {
  input: InputMaybe<CreateBackgroundColorInput>
}

export type MutationCreateCaseStudyArgs = {
  input: InputMaybe<CreateCaseStudyInput>
}

export type MutationCreateCompanySizeArgs = {
  input: InputMaybe<CreateCompanySizeInput>
}

export type MutationCreateCompetitorComparisonArgs = {
  input: InputMaybe<CreateCompetitorComparisonInput>
}

export type MutationCreateContactSaleArgs = {
  input: InputMaybe<CreateContactSaleInput>
}

export type MutationCreateContactUsArgs = {
  input: InputMaybe<CreateContactUsInput>
}

export type MutationCreateEBookArgs = {
  input: InputMaybe<CreateEBookInput>
}

export type MutationCreateEventArgs = {
  input: InputMaybe<CreateEventInput>
}

export type MutationCreateHarnessModuleArgs = {
  input: InputMaybe<CreateHarnessModuleInput>
}

export type MutationCreateIndustryArgs = {
  input: InputMaybe<CreateIndustryInput>
}

export type MutationCreateIntegrationArgs = {
  input: InputMaybe<CreateIntegrationInput>
}

export type MutationCreateMarketingSiteArgs = {
  input: InputMaybe<CreateMarketingSiteInput>
}

export type MutationCreateOutcomeArgs = {
  input: InputMaybe<CreateOutcomeInput>
}

export type MutationCreatePanelistArgs = {
  input: InputMaybe<CreatePanelistInput>
}

export type MutationCreateRoleArgs = {
  input: InputMaybe<CreateRoleInput>
}

export type MutationCreateUserArgs = {
  input: InputMaybe<CreateUserInput>
}

export type MutationCreateVideoArgs = {
  input: InputMaybe<CreateVideoInput>
}

export type MutationCreateWebinarArgs = {
  input: InputMaybe<CreateWebinarInput>
}

export type MutationDeleteBackgroundColorArgs = {
  input: InputMaybe<DeleteBackgroundColorInput>
}

export type MutationDeleteCaseStudyArgs = {
  input: InputMaybe<DeleteCaseStudyInput>
}

export type MutationDeleteCompanySizeArgs = {
  input: InputMaybe<DeleteCompanySizeInput>
}

export type MutationDeleteCompetitorComparisonArgs = {
  input: InputMaybe<DeleteCompetitorComparisonInput>
}

export type MutationDeleteContactSaleArgs = {
  input: InputMaybe<DeleteContactSaleInput>
}

export type MutationDeleteContactUsArgs = {
  input: InputMaybe<DeleteContactUsInput>
}

export type MutationDeleteEBookArgs = {
  input: InputMaybe<DeleteEBookInput>
}

export type MutationDeleteEventArgs = {
  input: InputMaybe<DeleteEventInput>
}

export type MutationDeleteFileArgs = {
  input: InputMaybe<DeleteFileInput>
}

export type MutationDeleteHarnessModuleArgs = {
  input: InputMaybe<DeleteHarnessModuleInput>
}

export type MutationDeleteIndustryArgs = {
  input: InputMaybe<DeleteIndustryInput>
}

export type MutationDeleteIntegrationArgs = {
  input: InputMaybe<DeleteIntegrationInput>
}

export type MutationDeleteMarketingSiteArgs = {
  input: InputMaybe<DeleteMarketingSiteInput>
}

export type MutationDeleteOutcomeArgs = {
  input: InputMaybe<DeleteOutcomeInput>
}

export type MutationDeletePanelistArgs = {
  input: InputMaybe<DeletePanelistInput>
}

export type MutationDeleteRoleArgs = {
  input: InputMaybe<DeleteRoleInput>
}

export type MutationDeleteUserArgs = {
  input: InputMaybe<DeleteUserInput>
}

export type MutationDeleteVideoArgs = {
  input: InputMaybe<DeleteVideoInput>
}

export type MutationDeleteWebinarArgs = {
  input: InputMaybe<DeleteWebinarInput>
}

export type MutationEmailConfirmationArgs = {
  confirmation: Scalars['String']
}

export type MutationForgotPasswordArgs = {
  email: Scalars['String']
}

export type MutationLoginArgs = {
  input: UsersPermissionsLoginInput
}

export type MutationMultipleUploadArgs = {
  field: InputMaybe<Scalars['String']>
  files: Array<InputMaybe<Scalars['Upload']>>
  ref: InputMaybe<Scalars['String']>
  refId: InputMaybe<Scalars['ID']>
  source: InputMaybe<Scalars['String']>
}

export type MutationRegisterArgs = {
  input: UsersPermissionsRegisterInput
}

export type MutationResetPasswordArgs = {
  code: Scalars['String']
  password: Scalars['String']
  passwordConfirmation: Scalars['String']
}

export type MutationUpdateAboutUsArgs = {
  input: InputMaybe<UpdateAboutUsInput>
}

export type MutationUpdateBackgroundColorArgs = {
  input: InputMaybe<UpdateBackgroundColorInput>
}

export type MutationUpdateCareerArgs = {
  input: InputMaybe<UpdateCareerInput>
}

export type MutationUpdateCaseStudyArgs = {
  input: InputMaybe<UpdateCaseStudyInput>
}

export type MutationUpdateCompanySizeArgs = {
  input: InputMaybe<UpdateCompanySizeInput>
}

export type MutationUpdateCompetitorComparisonArgs = {
  input: InputMaybe<UpdateCompetitorComparisonInput>
}

export type MutationUpdateContactSaleArgs = {
  input: InputMaybe<UpdateContactSaleInput>
}

export type MutationUpdateContactUsArgs = {
  input: InputMaybe<UpdateContactUsInput>
}

export type MutationUpdateCustomerArgs = {
  input: InputMaybe<UpdateCustomerInput>
}

export type MutationUpdateDevOpsToolArgs = {
  input: InputMaybe<UpdateDevOpsToolInput>
}

export type MutationUpdateEBookArgs = {
  input: InputMaybe<UpdateEBookInput>
}

export type MutationUpdateEventArgs = {
  input: InputMaybe<UpdateEventInput>
}

export type MutationUpdateFileInfoArgs = {
  id: Scalars['ID']
  info: FileInfoInput
}

export type MutationUpdateHarnessModuleArgs = {
  input: InputMaybe<UpdateHarnessModuleInput>
}

export type MutationUpdateHarnessSubscriptionArgs = {
  input: InputMaybe<UpdateHarnessSubscriptionInput>
}

export type MutationUpdateHomeArgs = {
  input: InputMaybe<UpdateHomeInput>
}

export type MutationUpdateIndustryArgs = {
  input: InputMaybe<UpdateIndustryInput>
}

export type MutationUpdateIntegrationArgs = {
  input: InputMaybe<UpdateIntegrationInput>
}

export type MutationUpdateMarketingSiteArgs = {
  input: InputMaybe<UpdateMarketingSiteInput>
}

export type MutationUpdateOutcomeArgs = {
  input: InputMaybe<UpdateOutcomeInput>
}

export type MutationUpdatePanelistArgs = {
  input: InputMaybe<UpdatePanelistInput>
}

export type MutationUpdatePartnerArgs = {
  input: InputMaybe<UpdatePartnerInput>
}

export type MutationUpdatePressAndNewArgs = {
  input: InputMaybe<UpdatePressAndNewInput>
}

export type MutationUpdatePricingArgs = {
  input: InputMaybe<UpdatePricingInput>
}

export type MutationUpdatePrivacyArgs = {
  input: InputMaybe<UpdatePrivacyInput>
}

export type MutationUpdateProductCdArgs = {
  input: InputMaybe<UpdateProductCdInput>
}

export type MutationUpdateProductChangeIntelligenceArgs = {
  input: InputMaybe<UpdateProductChangeIntelligenceInput>
}

export type MutationUpdateProductCiArgs = {
  input: InputMaybe<UpdateProductCiInput>
}

export type MutationUpdateProductCloudCostArgs = {
  input: InputMaybe<UpdateProductCloudCostInput>
}

export type MutationUpdateProductFeatureFlagArgs = {
  input: InputMaybe<UpdateProductFeatureFlagInput>
}

export type MutationUpdateProductPlatformArgs = {
  input: InputMaybe<UpdateProductPlatformInput>
}

export type MutationUpdateRoleArgs = {
  input: InputMaybe<UpdateRoleInput>
}

export type MutationUpdateUserArgs = {
  input: InputMaybe<UpdateUserInput>
}

export type MutationUpdateVideoArgs = {
  input: InputMaybe<UpdateVideoInput>
}

export type MutationUpdateWebinarArgs = {
  input: InputMaybe<UpdateWebinarInput>
}

export type MutationUpdateWebsiteTermsOfUseArgs = {
  input: InputMaybe<UpdateWebsiteTermsOfUseInput>
}

export type MutationUploadArgs = {
  field: InputMaybe<Scalars['String']>
  file: Scalars['Upload']
  ref: InputMaybe<Scalars['String']>
  refId: InputMaybe<Scalars['ID']>
  source: InputMaybe<Scalars['String']>
}

export type Outcome = {
  __typename?: 'Outcome'
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  id: Scalars['ID']
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type OutcomeAggregator = {
  __typename?: 'OutcomeAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type OutcomeConnection = {
  __typename?: 'OutcomeConnection'
  aggregate: Maybe<OutcomeAggregator>
  groupBy: Maybe<OutcomeGroupBy>
  values: Maybe<Array<Maybe<Outcome>>>
}

export type OutcomeConnectionCreated_At = {
  __typename?: 'OutcomeConnectionCreated_at'
  connection: Maybe<OutcomeConnection>
  key: Maybe<Scalars['DateTime']>
}

export type OutcomeConnectionCreated_By = {
  __typename?: 'OutcomeConnectionCreated_by'
  connection: Maybe<OutcomeConnection>
  key: Maybe<Scalars['ID']>
}

export type OutcomeConnectionId = {
  __typename?: 'OutcomeConnectionId'
  connection: Maybe<OutcomeConnection>
  key: Maybe<Scalars['ID']>
}

export type OutcomeConnectionItem = {
  __typename?: 'OutcomeConnectionItem'
  connection: Maybe<OutcomeConnection>
  key: Maybe<Scalars['String']>
}

export type OutcomeConnectionPublished_At = {
  __typename?: 'OutcomeConnectionPublished_at'
  connection: Maybe<OutcomeConnection>
  key: Maybe<Scalars['DateTime']>
}

export type OutcomeConnectionUpdated_At = {
  __typename?: 'OutcomeConnectionUpdated_at'
  connection: Maybe<OutcomeConnection>
  key: Maybe<Scalars['DateTime']>
}

export type OutcomeConnectionUpdated_By = {
  __typename?: 'OutcomeConnectionUpdated_by'
  connection: Maybe<OutcomeConnection>
  key: Maybe<Scalars['ID']>
}

export type OutcomeGroupBy = {
  __typename?: 'OutcomeGroupBy'
  created_at: Maybe<Array<Maybe<OutcomeConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<OutcomeConnectionCreated_By>>>
  id: Maybe<Array<Maybe<OutcomeConnectionId>>>
  item: Maybe<Array<Maybe<OutcomeConnectionItem>>>
  published_at: Maybe<Array<Maybe<OutcomeConnectionPublished_At>>>
  updated_at: Maybe<Array<Maybe<OutcomeConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<OutcomeConnectionUpdated_By>>>
}

export type OutcomeInput = {
  created_by: InputMaybe<Scalars['ID']>
  item: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type Panelist = {
  __typename?: 'Panelist'
  company: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  firstName: Maybe<Scalars['String']>
  id: Scalars['ID']
  jobTitle: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  profile_image: Maybe<UploadFile>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type PanelistAggregator = {
  __typename?: 'PanelistAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type PanelistConnection = {
  __typename?: 'PanelistConnection'
  aggregate: Maybe<PanelistAggregator>
  groupBy: Maybe<PanelistGroupBy>
  values: Maybe<Array<Maybe<Panelist>>>
}

export type PanelistConnectionCompany = {
  __typename?: 'PanelistConnectionCompany'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['String']>
}

export type PanelistConnectionCreated_At = {
  __typename?: 'PanelistConnectionCreated_at'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['DateTime']>
}

export type PanelistConnectionCreated_By = {
  __typename?: 'PanelistConnectionCreated_by'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['ID']>
}

export type PanelistConnectionFirstName = {
  __typename?: 'PanelistConnectionFirstName'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['String']>
}

export type PanelistConnectionId = {
  __typename?: 'PanelistConnectionId'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['ID']>
}

export type PanelistConnectionJobTitle = {
  __typename?: 'PanelistConnectionJobTitle'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['String']>
}

export type PanelistConnectionLastName = {
  __typename?: 'PanelistConnectionLastName'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['String']>
}

export type PanelistConnectionProfile_Image = {
  __typename?: 'PanelistConnectionProfile_image'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['ID']>
}

export type PanelistConnectionPublished_At = {
  __typename?: 'PanelistConnectionPublished_at'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['DateTime']>
}

export type PanelistConnectionUpdated_At = {
  __typename?: 'PanelistConnectionUpdated_at'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['DateTime']>
}

export type PanelistConnectionUpdated_By = {
  __typename?: 'PanelistConnectionUpdated_by'
  connection: Maybe<PanelistConnection>
  key: Maybe<Scalars['ID']>
}

export type PanelistGroupBy = {
  __typename?: 'PanelistGroupBy'
  company: Maybe<Array<Maybe<PanelistConnectionCompany>>>
  created_at: Maybe<Array<Maybe<PanelistConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<PanelistConnectionCreated_By>>>
  firstName: Maybe<Array<Maybe<PanelistConnectionFirstName>>>
  id: Maybe<Array<Maybe<PanelistConnectionId>>>
  jobTitle: Maybe<Array<Maybe<PanelistConnectionJobTitle>>>
  lastName: Maybe<Array<Maybe<PanelistConnectionLastName>>>
  profile_image: Maybe<Array<Maybe<PanelistConnectionProfile_Image>>>
  published_at: Maybe<Array<Maybe<PanelistConnectionPublished_At>>>
  updated_at: Maybe<Array<Maybe<PanelistConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<PanelistConnectionUpdated_By>>>
}

export type PanelistInput = {
  company: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  firstName: InputMaybe<Scalars['String']>
  jobTitle: InputMaybe<Scalars['String']>
  lastName: InputMaybe<Scalars['String']>
  profile_image: InputMaybe<Scalars['ID']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type PartnerInput = {
  created_by: InputMaybe<Scalars['ID']>
  features: InputMaybe<Array<InputMaybe<ComponentPageMultiImgListZoneInput>>>
  harnessPlatform: InputMaybe<ComponentPageSimpleTitleZoneInput>
  hero: InputMaybe<ComponentPageSimpleTitleZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type Partners = {
  __typename?: 'Partners'
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  features: Maybe<Array<Maybe<ComponentPageMultiImgListZone>>>
  harnessPlatform: Maybe<ComponentPageSimpleTitleZone>
  hero: Maybe<ComponentPageSimpleTitleZone>
  id: Scalars['ID']
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type PressAndNewInput = {
  created_by: InputMaybe<Scalars['ID']>
  hero: InputMaybe<ComponentPageSimpleTitleZoneInput>
  news: InputMaybe<Array<InputMaybe<ComponentPageNewsZoneInput>>>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type PressAndNews = {
  __typename?: 'PressAndNews'
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  hero: Maybe<ComponentPageSimpleTitleZone>
  id: Scalars['ID']
  news: Maybe<Array<Maybe<ComponentPageNewsZone>>>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type Pricing = {
  __typename?: 'Pricing'
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  ccFaq: Maybe<Array<Maybe<ComponentPricingPageFaq>>>
  ccFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  ccFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  ccPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  cdFaq: Maybe<Array<Maybe<ComponentPricingPageFaq>>>
  cdFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  cdFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  cdPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  srmFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  srmFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  srmPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  ciFaq: Maybe<Array<Maybe<ComponentPricingPageFaq>>>
  ciFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  ciFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  ciPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  ciSaasFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  ciSaasFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  ciSaasPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  ffFaq: Maybe<Array<Maybe<ComponentPricingPageFaq>>>
  ffFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  ffFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  ffPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  hero: Maybe<ComponentPageMiniTitleZone>
  id: Scalars['ID']
  openSource: Maybe<ComponentPricingPageCallOut>
  published_at: Maybe<Scalars['DateTime']>
  tooltips: Maybe<Array<Maybe<ComponentPricingPageTooltipsZone>>>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type PricingInput = {
  caseStudies: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  ccFaq: InputMaybe<Array<InputMaybe<ComponentPricingPageFaqInput>>>
  ccFeatureCaption: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureCaptionInput>>>
  ccFeatureGroup: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureGroupInput>>>
  ccPlans: InputMaybe<Array<InputMaybe<ComponentPricingPagePlansZoneInput>>>
  cdFaq: InputMaybe<Array<InputMaybe<ComponentPricingPageFaqInput>>>
  cdFeatureCaption: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureCaptionInput>>>
  cdFeatureGroup: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureGroupInput>>>
  cdPlans: InputMaybe<Array<InputMaybe<ComponentPricingPagePlansZoneInput>>>
  srmFeatureCaption: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureCaptionInput>>>
  srmFeatureGroup: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureGroupInput>>>
  srmPlans: InputMaybe<Array<InputMaybe<ComponentPricingPagePlansZoneInput>>>
  ciFaq: InputMaybe<Array<InputMaybe<ComponentPricingPageFaqInput>>>
  ciFeatureCaption: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureCaptionInput>>>
  ciFeatureGroup: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureGroupInput>>>
  ciPlans: InputMaybe<Array<InputMaybe<ComponentPricingPagePlansZoneInput>>>
  ciSaasFeatureCaption: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureCaptionInput>>>
  ciSaasFeatureGroup: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureGroupInput>>>
  ciSaasPlans: InputMaybe<Array<InputMaybe<ComponentPricingPagePlansZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  ffFaq: InputMaybe<Array<InputMaybe<ComponentPricingPageFaqInput>>>
  ffFeatureCaption: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureCaptionInput>>>
  ffFeatureGroup: InputMaybe<Array<InputMaybe<ComponentPricingPageFeatureGroupInput>>>
  ffPlans: InputMaybe<Array<InputMaybe<ComponentPricingPagePlansZoneInput>>>
  hero: InputMaybe<ComponentPageMiniTitleZoneInput>
  openSource: InputMaybe<ComponentPricingPageCallOutInput>
  published_at: InputMaybe<Scalars['DateTime']>
  tooltips: InputMaybe<Array<InputMaybe<ComponentPricingPageTooltipsZoneInput>>>
  updated_by: InputMaybe<Scalars['ID']>
}

export type Privacy = {
  __typename?: 'Privacy'
  content: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  date: Maybe<Scalars['String']>
  id: Scalars['ID']
  published_at: Maybe<Scalars['DateTime']>
  title: Maybe<Scalars['String']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type PrivacyInput = {
  content: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  date: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type ProductCd = {
  __typename?: 'ProductCd'
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  features: Maybe<Array<Maybe<ComponentPageModules>>>
  featuresTitle: Maybe<Scalars['String']>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZone>
  hero: Maybe<ComponentPageProductTitleZone>
  id: Scalars['ID']
  integrations: Maybe<ComponentProductPageIntegrationsZone>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type ProductCdInput = {
  caseStudies: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<ComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: InputMaybe<Array<InputMaybe<ComponentPageOptionZoneInput>>>
  features: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  harnessPlatform: InputMaybe<ComponentPageProductIntroLogoZoneInput>
  hero: InputMaybe<ComponentPageProductTitleZoneInput>
  integrations: InputMaybe<ComponentProductPageIntegrationsZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type ProductChangeIntelligence = {
  __typename?: 'ProductChangeIntelligence'
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  features: Maybe<Array<Maybe<ComponentPageModules>>>
  featuresTitle: Maybe<Scalars['String']>
  hero: Maybe<ComponentPageProductTitleZone>
  id: Scalars['ID']
  integrations: Maybe<ComponentProductPageIntegrationsZone>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type ProductChangeIntelligenceInput = {
  caseStudies: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<ComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: InputMaybe<Array<InputMaybe<ComponentPageOptionZoneInput>>>
  features: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  hero: InputMaybe<ComponentPageProductTitleZoneInput>
  integrations: InputMaybe<ComponentProductPageIntegrationsZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type ProductCi = {
  __typename?: 'ProductCi'
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  features: Maybe<Array<Maybe<ComponentPageModules>>>
  featuresTitle: Maybe<Scalars['String']>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZone>
  hero: Maybe<ComponentPageProductTitleZone>
  id: Scalars['ID']
  integrations: Maybe<ComponentProductPageIntegrationsZone>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type ProductCiInput = {
  caseStudies: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<ComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: InputMaybe<Array<InputMaybe<ComponentPageOptionZoneInput>>>
  features: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  harnessPlatform: InputMaybe<ComponentPageProductIntroLogoZoneInput>
  hero: InputMaybe<ComponentPageProductTitleZoneInput>
  integrations: InputMaybe<ComponentProductPageIntegrationsZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type ProductCloudCost = {
  __typename?: 'ProductCloudCost'
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  costTransparency: Maybe<Array<Maybe<ComponentPageModules>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  featuresTitle: Maybe<Scalars['String']>
  governance: Maybe<Array<Maybe<ComponentPageModules>>>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZone>
  hero: Maybe<ComponentPageProductTitleZone>
  id: Scalars['ID']
  integrations: Maybe<ComponentProductPageIntegrationsZone>
  optimization: Maybe<Array<Maybe<ComponentPageModules>>>
  published_at: Maybe<Scalars['DateTime']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type ProductCloudCostInput = {
  caseStudies: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  costTransparency: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<ComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: InputMaybe<Array<InputMaybe<ComponentPageOptionZoneInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  governance: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  harnessPlatform: InputMaybe<ComponentPageProductIntroLogoZoneInput>
  hero: InputMaybe<ComponentPageProductTitleZoneInput>
  integrations: InputMaybe<ComponentProductPageIntegrationsZoneInput>
  optimization: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type ProductFeatureFlagInput = {
  caseStudies: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<ComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: InputMaybe<Array<InputMaybe<ComponentPageOptionZoneInput>>>
  features: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  features2: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  featuresTitle2: InputMaybe<Scalars['String']>
  harnessPlatform: InputMaybe<ComponentPageProductIntroLogoZoneInput>
  hero: InputMaybe<ComponentPageProductTitleZoneInput>
  integrations: InputMaybe<ComponentProductPageIntegrationZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  sectionOptions: InputMaybe<ComponentPageSectionOptionInput>
  updated_by: InputMaybe<Scalars['ID']>
}

export type ProductFeatureFlags = {
  __typename?: 'ProductFeatureFlags'
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  features: Maybe<Array<Maybe<ComponentPageModules>>>
  features2: Maybe<Array<Maybe<ComponentPageModules>>>
  featuresTitle: Maybe<Scalars['String']>
  featuresTitle2: Maybe<Scalars['String']>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZone>
  hero: Maybe<ComponentPageProductTitleZone>
  id: Scalars['ID']
  integrations: Maybe<ComponentProductPageIntegrationZone>
  published_at: Maybe<Scalars['DateTime']>
  sectionOptions: Maybe<ComponentPageSectionOptions>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type ProductPlatform = {
  __typename?: 'ProductPlatform'
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  features: Maybe<Array<Maybe<ComponentPageModules>>>
  featuresTitle: Maybe<Scalars['String']>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZone>
  hero: Maybe<ComponentPageProductTitleZone>
  hostingOptions: Maybe<ComponentPageOptionZone>
  id: Scalars['ID']
  integrations: Maybe<ComponentProductPageIntegrationsZone>
  modules: Maybe<Array<Maybe<ComponentPageModules>>>
  platformModules: Maybe<ComponentPageTitleZone>
  published_at: Maybe<Scalars['DateTime']>
  sectionOptions: Maybe<ComponentPageSectionOptions>
  sectionSecurity: Maybe<ComponentPageSectionSecurity>
  supportedPlatforms: Maybe<ComponentProductPageIntegrationsZone>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
  workflow: Maybe<ComponentPageWorkflow>
}

export type ProductPlatformInput = {
  caseStudies: InputMaybe<Array<InputMaybe<ComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  features: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  harnessPlatform: InputMaybe<ComponentPageProductIntroLogoZoneInput>
  hero: InputMaybe<ComponentPageProductTitleZoneInput>
  hostingOptions: InputMaybe<ComponentPageOptionZoneInput>
  integrations: InputMaybe<ComponentProductPageIntegrationsZoneInput>
  modules: InputMaybe<Array<InputMaybe<ComponentPageModuleInput>>>
  platformModules: InputMaybe<ComponentPageTitleZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  sectionOptions: InputMaybe<ComponentPageSectionOptionInput>
  sectionSecurity: InputMaybe<ComponentPageSectionSecurityInput>
  supportedPlatforms: InputMaybe<ComponentProductPageIntegrationsZoneInput>
  updated_by: InputMaybe<Scalars['ID']>
  workflow: InputMaybe<ComponentPageWorkflowInput>
}

export enum PublicationState {
  Live = 'LIVE',
  Preview = 'PREVIEW'
}

export type Query = {
  __typename?: 'Query'
  aboutUs: Maybe<AboutUs>
  backgroundColor: Maybe<BackgroundColor>
  backgroundColors: Maybe<Array<Maybe<BackgroundColor>>>
  backgroundColorsConnection: Maybe<BackgroundColorConnection>
  career: Maybe<Careers>
  caseStudies: Maybe<Array<Maybe<CaseStudy>>>
  caseStudiesConnection: Maybe<CaseStudyConnection>
  caseStudy: Maybe<CaseStudy>
  companySize: Maybe<CompanySize>
  companySizes: Maybe<Array<Maybe<CompanySize>>>
  companySizesConnection: Maybe<CompanySizeConnection>
  competitorComparison: Maybe<CompetitorComparison>
  competitorComparisons: Maybe<Array<Maybe<CompetitorComparison>>>
  competitorComparisonsConnection: Maybe<CompetitorComparisonConnection>
  contactSale: Maybe<ContactSale>
  contactSales: Maybe<Array<Maybe<ContactSale>>>
  contactSalesConnection: Maybe<ContactSaleConnection>
  contactUs: Maybe<ContactUs>
  contactuses: Maybe<Array<Maybe<ContactUs>>>
  contactusesConnection: Maybe<ContactUsConnection>
  customer: Maybe<Customer>
  devOpsTool: Maybe<DevOpsTools>
  eBook: Maybe<EBook>
  eBooks: Maybe<Array<Maybe<EBook>>>
  eBooksConnection: Maybe<EBookConnection>
  event: Maybe<Event>
  events: Maybe<Array<Maybe<Event>>>
  eventsConnection: Maybe<EventConnection>
  files: Maybe<Array<Maybe<UploadFile>>>
  filesConnection: Maybe<UploadFileConnection>
  harnessModule: Maybe<HarnessModule>
  harnessModules: Maybe<Array<Maybe<HarnessModule>>>
  harnessModulesConnection: Maybe<HarnessModuleConnection>
  harnessSubscription: Maybe<HarnessSubscription>
  home: Maybe<Home>
  industries: Maybe<Array<Maybe<Industry>>>
  industriesConnection: Maybe<IndustryConnection>
  industry: Maybe<Industry>
  integration: Maybe<Integration>
  integrations: Maybe<Array<Maybe<Integration>>>
  integrationsConnection: Maybe<IntegrationConnection>
  marketingSite: Maybe<MarketingSite>
  marketingSites: Maybe<Array<Maybe<MarketingSite>>>
  marketingSitesConnection: Maybe<MarketingSiteConnection>
  me: Maybe<UsersPermissionsMe>
  outcome: Maybe<Outcome>
  outcomes: Maybe<Array<Maybe<Outcome>>>
  outcomesConnection: Maybe<OutcomeConnection>
  panelist: Maybe<Panelist>
  panelists: Maybe<Array<Maybe<Panelist>>>
  panelistsConnection: Maybe<PanelistConnection>
  partner: Maybe<Partners>
  pressAndNew: Maybe<PressAndNews>
  pricing: Maybe<Pricing>
  privacy: Maybe<Privacy>
  productCd: Maybe<ProductCd>
  productChangeIntelligence: Maybe<ProductChangeIntelligence>
  productCi: Maybe<ProductCi>
  productCloudCost: Maybe<ProductCloudCost>
  productFeatureFlag: Maybe<ProductFeatureFlags>
  productPlatform: Maybe<ProductPlatform>
  role: Maybe<UsersPermissionsRole>
  /** Retrieve all the existing roles. You can't apply filters on this query. */
  roles: Maybe<Array<Maybe<UsersPermissionsRole>>>
  rolesConnection: Maybe<UsersPermissionsRoleConnection>
  user: Maybe<UsersPermissionsUser>
  users: Maybe<Array<Maybe<UsersPermissionsUser>>>
  usersConnection: Maybe<UsersPermissionsUserConnection>
  video: Maybe<Video>
  videos: Maybe<Array<Maybe<Video>>>
  videosConnection: Maybe<VideoConnection>
  webinar: Maybe<Webinars>
  webinars: Maybe<Array<Maybe<Webinars>>>
  webinarsConnection: Maybe<WebinarsConnection>
  websiteTermsOfUse: Maybe<WebsiteTermsOfUse>
}

export type QueryAboutUsArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryBackgroundColorArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryBackgroundColorsArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryBackgroundColorsConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryCareerArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryCaseStudiesArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryCaseStudiesConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryCaseStudyArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryCompanySizeArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryCompanySizesArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryCompanySizesConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryCompetitorComparisonArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryCompetitorComparisonsArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryCompetitorComparisonsConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryContactSaleArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryContactSalesArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryContactSalesConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryContactUsArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryContactusesArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryContactusesConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryCustomerArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryDevOpsToolArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryEBookArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryEBooksArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryEBooksConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryEventArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryEventsArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryEventsConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryFilesArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryFilesConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryHarnessModuleArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryHarnessModulesArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryHarnessModulesConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryHarnessSubscriptionArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryHomeArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryIndustriesArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryIndustriesConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryIndustryArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryIntegrationArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryIntegrationsArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryIntegrationsConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryMarketingSiteArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryMarketingSitesArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryMarketingSitesConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryOutcomeArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryOutcomesArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryOutcomesConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryPanelistArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryPanelistsArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryPanelistsConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryPartnerArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryPressAndNewArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryPricingArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryPrivacyArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryProductCdArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryProductChangeIntelligenceArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryProductCiArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryProductCloudCostArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryProductFeatureFlagArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryProductPlatformArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type QueryRoleArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryRolesArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryRolesConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryUserArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryUsersArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryUsersConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryVideoArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryVideosArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryVideosConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryWebinarArgs = {
  id: Scalars['ID']
  publicationState: InputMaybe<PublicationState>
}

export type QueryWebinarsArgs = {
  limit: InputMaybe<Scalars['Int']>
  publicationState: InputMaybe<PublicationState>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryWebinarsConnectionArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type QueryWebsiteTermsOfUseArgs = {
  publicationState: InputMaybe<PublicationState>
}

export type RoleInput = {
  created_by: InputMaybe<Scalars['ID']>
  description: InputMaybe<Scalars['String']>
  name: Scalars['String']
  permissions: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  type: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
  users: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
}

export type UploadFile = {
  __typename?: 'UploadFile'
  alternativeText: Maybe<Scalars['String']>
  caption: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  ext: Maybe<Scalars['String']>
  formats: Maybe<Scalars['JSON']>
  hash: Scalars['String']
  height: Maybe<Scalars['Int']>
  id: Scalars['ID']
  mime: Scalars['String']
  name: Scalars['String']
  previewUrl: Maybe<Scalars['String']>
  provider: Scalars['String']
  provider_metadata: Maybe<Scalars['JSON']>
  related: Maybe<Array<Maybe<Morph>>>
  size: Scalars['Float']
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
  url: Scalars['String']
  width: Maybe<Scalars['Int']>
}

export type UploadFileRelatedArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type UploadFileAggregator = {
  __typename?: 'UploadFileAggregator'
  avg: Maybe<UploadFileAggregatorAvg>
  count: Maybe<Scalars['Int']>
  max: Maybe<UploadFileAggregatorMax>
  min: Maybe<UploadFileAggregatorMin>
  sum: Maybe<UploadFileAggregatorSum>
  totalCount: Maybe<Scalars['Int']>
}

export type UploadFileAggregatorAvg = {
  __typename?: 'UploadFileAggregatorAvg'
  height: Maybe<Scalars['Float']>
  size: Maybe<Scalars['Float']>
  width: Maybe<Scalars['Float']>
}

export type UploadFileAggregatorMax = {
  __typename?: 'UploadFileAggregatorMax'
  height: Maybe<Scalars['Float']>
  size: Maybe<Scalars['Float']>
  width: Maybe<Scalars['Float']>
}

export type UploadFileAggregatorMin = {
  __typename?: 'UploadFileAggregatorMin'
  height: Maybe<Scalars['Float']>
  size: Maybe<Scalars['Float']>
  width: Maybe<Scalars['Float']>
}

export type UploadFileAggregatorSum = {
  __typename?: 'UploadFileAggregatorSum'
  height: Maybe<Scalars['Float']>
  size: Maybe<Scalars['Float']>
  width: Maybe<Scalars['Float']>
}

export type UploadFileConnection = {
  __typename?: 'UploadFileConnection'
  aggregate: Maybe<UploadFileAggregator>
  groupBy: Maybe<UploadFileGroupBy>
  values: Maybe<Array<Maybe<UploadFile>>>
}

export type UploadFileConnectionAlternativeText = {
  __typename?: 'UploadFileConnectionAlternativeText'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['String']>
}

export type UploadFileConnectionCaption = {
  __typename?: 'UploadFileConnectionCaption'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['String']>
}

export type UploadFileConnectionCreated_At = {
  __typename?: 'UploadFileConnectionCreated_at'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['DateTime']>
}

export type UploadFileConnectionCreated_By = {
  __typename?: 'UploadFileConnectionCreated_by'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['ID']>
}

export type UploadFileConnectionExt = {
  __typename?: 'UploadFileConnectionExt'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['String']>
}

export type UploadFileConnectionFormats = {
  __typename?: 'UploadFileConnectionFormats'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['JSON']>
}

export type UploadFileConnectionHash = {
  __typename?: 'UploadFileConnectionHash'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['String']>
}

export type UploadFileConnectionHeight = {
  __typename?: 'UploadFileConnectionHeight'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['Int']>
}

export type UploadFileConnectionId = {
  __typename?: 'UploadFileConnectionId'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['ID']>
}

export type UploadFileConnectionMime = {
  __typename?: 'UploadFileConnectionMime'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['String']>
}

export type UploadFileConnectionName = {
  __typename?: 'UploadFileConnectionName'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['String']>
}

export type UploadFileConnectionPreviewUrl = {
  __typename?: 'UploadFileConnectionPreviewUrl'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['String']>
}

export type UploadFileConnectionProvider = {
  __typename?: 'UploadFileConnectionProvider'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['String']>
}

export type UploadFileConnectionProvider_Metadata = {
  __typename?: 'UploadFileConnectionProvider_metadata'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['JSON']>
}

export type UploadFileConnectionSize = {
  __typename?: 'UploadFileConnectionSize'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['Float']>
}

export type UploadFileConnectionUpdated_At = {
  __typename?: 'UploadFileConnectionUpdated_at'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['DateTime']>
}

export type UploadFileConnectionUpdated_By = {
  __typename?: 'UploadFileConnectionUpdated_by'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['ID']>
}

export type UploadFileConnectionUrl = {
  __typename?: 'UploadFileConnectionUrl'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['String']>
}

export type UploadFileConnectionWidth = {
  __typename?: 'UploadFileConnectionWidth'
  connection: Maybe<UploadFileConnection>
  key: Maybe<Scalars['Int']>
}

export type UploadFileGroupBy = {
  __typename?: 'UploadFileGroupBy'
  alternativeText: Maybe<Array<Maybe<UploadFileConnectionAlternativeText>>>
  caption: Maybe<Array<Maybe<UploadFileConnectionCaption>>>
  created_at: Maybe<Array<Maybe<UploadFileConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<UploadFileConnectionCreated_By>>>
  ext: Maybe<Array<Maybe<UploadFileConnectionExt>>>
  formats: Maybe<Array<Maybe<UploadFileConnectionFormats>>>
  hash: Maybe<Array<Maybe<UploadFileConnectionHash>>>
  height: Maybe<Array<Maybe<UploadFileConnectionHeight>>>
  id: Maybe<Array<Maybe<UploadFileConnectionId>>>
  mime: Maybe<Array<Maybe<UploadFileConnectionMime>>>
  name: Maybe<Array<Maybe<UploadFileConnectionName>>>
  previewUrl: Maybe<Array<Maybe<UploadFileConnectionPreviewUrl>>>
  provider: Maybe<Array<Maybe<UploadFileConnectionProvider>>>
  provider_metadata: Maybe<Array<Maybe<UploadFileConnectionProvider_Metadata>>>
  size: Maybe<Array<Maybe<UploadFileConnectionSize>>>
  updated_at: Maybe<Array<Maybe<UploadFileConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<UploadFileConnectionUpdated_By>>>
  url: Maybe<Array<Maybe<UploadFileConnectionUrl>>>
  width: Maybe<Array<Maybe<UploadFileConnectionWidth>>>
}

export type UserInput = {
  blocked: InputMaybe<Scalars['Boolean']>
  company: InputMaybe<Scalars['String']>
  confirmationToken: InputMaybe<Scalars['String']>
  confirmed: InputMaybe<Scalars['Boolean']>
  created_by: InputMaybe<Scalars['ID']>
  email: Scalars['String']
  interest: InputMaybe<Enum_Userspermissionsuser_Interest>
  occupation: InputMaybe<Enum_Userspermissionsuser_Occupation>
  password: InputMaybe<Scalars['String']>
  provider: InputMaybe<Scalars['String']>
  resetPasswordToken: InputMaybe<Scalars['String']>
  role: InputMaybe<Scalars['ID']>
  updated_by: InputMaybe<Scalars['ID']>
  username: Scalars['String']
}

export type UserPermissionsPasswordPayload = {
  __typename?: 'UserPermissionsPasswordPayload'
  ok: Scalars['Boolean']
}

export type UsersPermissionsLoginInput = {
  identifier: Scalars['String']
  password: Scalars['String']
  provider: InputMaybe<Scalars['String']>
}

export type UsersPermissionsLoginPayload = {
  __typename?: 'UsersPermissionsLoginPayload'
  jwt: Maybe<Scalars['String']>
  user: UsersPermissionsMe
}

export type UsersPermissionsMe = {
  __typename?: 'UsersPermissionsMe'
  blocked: Maybe<Scalars['Boolean']>
  confirmed: Maybe<Scalars['Boolean']>
  email: Scalars['String']
  id: Scalars['ID']
  role: Maybe<UsersPermissionsMeRole>
  username: Scalars['String']
}

export type UsersPermissionsMeRole = {
  __typename?: 'UsersPermissionsMeRole'
  description: Maybe<Scalars['String']>
  id: Scalars['ID']
  name: Scalars['String']
  type: Maybe<Scalars['String']>
}

export type UsersPermissionsPermission = {
  __typename?: 'UsersPermissionsPermission'
  action: Scalars['String']
  controller: Scalars['String']
  created_by: Maybe<AdminUser>
  enabled: Scalars['Boolean']
  id: Scalars['ID']
  policy: Maybe<Scalars['String']>
  role: Maybe<UsersPermissionsRole>
  type: Scalars['String']
  updated_by: Maybe<AdminUser>
}

export type UsersPermissionsRegisterInput = {
  email: Scalars['String']
  password: Scalars['String']
  username: Scalars['String']
}

export type UsersPermissionsRole = {
  __typename?: 'UsersPermissionsRole'
  created_by: Maybe<AdminUser>
  description: Maybe<Scalars['String']>
  id: Scalars['ID']
  name: Scalars['String']
  permissions: Maybe<Array<Maybe<UsersPermissionsPermission>>>
  type: Maybe<Scalars['String']>
  updated_by: Maybe<AdminUser>
  users: Maybe<Array<Maybe<UsersPermissionsUser>>>
}

export type UsersPermissionsRolePermissionsArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type UsersPermissionsRoleUsersArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type UsersPermissionsRoleAggregator = {
  __typename?: 'UsersPermissionsRoleAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type UsersPermissionsRoleConnection = {
  __typename?: 'UsersPermissionsRoleConnection'
  aggregate: Maybe<UsersPermissionsRoleAggregator>
  groupBy: Maybe<UsersPermissionsRoleGroupBy>
  values: Maybe<Array<Maybe<UsersPermissionsRole>>>
}

export type UsersPermissionsRoleConnectionCreated_By = {
  __typename?: 'UsersPermissionsRoleConnectionCreated_by'
  connection: Maybe<UsersPermissionsRoleConnection>
  key: Maybe<Scalars['ID']>
}

export type UsersPermissionsRoleConnectionDescription = {
  __typename?: 'UsersPermissionsRoleConnectionDescription'
  connection: Maybe<UsersPermissionsRoleConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsRoleConnectionId = {
  __typename?: 'UsersPermissionsRoleConnectionId'
  connection: Maybe<UsersPermissionsRoleConnection>
  key: Maybe<Scalars['ID']>
}

export type UsersPermissionsRoleConnectionName = {
  __typename?: 'UsersPermissionsRoleConnectionName'
  connection: Maybe<UsersPermissionsRoleConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsRoleConnectionType = {
  __typename?: 'UsersPermissionsRoleConnectionType'
  connection: Maybe<UsersPermissionsRoleConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsRoleConnectionUpdated_By = {
  __typename?: 'UsersPermissionsRoleConnectionUpdated_by'
  connection: Maybe<UsersPermissionsRoleConnection>
  key: Maybe<Scalars['ID']>
}

export type UsersPermissionsRoleGroupBy = {
  __typename?: 'UsersPermissionsRoleGroupBy'
  created_by: Maybe<Array<Maybe<UsersPermissionsRoleConnectionCreated_By>>>
  description: Maybe<Array<Maybe<UsersPermissionsRoleConnectionDescription>>>
  id: Maybe<Array<Maybe<UsersPermissionsRoleConnectionId>>>
  name: Maybe<Array<Maybe<UsersPermissionsRoleConnectionName>>>
  type: Maybe<Array<Maybe<UsersPermissionsRoleConnectionType>>>
  updated_by: Maybe<Array<Maybe<UsersPermissionsRoleConnectionUpdated_By>>>
}

export type UsersPermissionsUser = {
  __typename?: 'UsersPermissionsUser'
  blocked: Maybe<Scalars['Boolean']>
  company: Maybe<Scalars['String']>
  confirmationToken: Maybe<Scalars['String']>
  confirmed: Maybe<Scalars['Boolean']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  email: Scalars['String']
  id: Scalars['ID']
  interest: Maybe<Enum_Userspermissionsuser_Interest>
  occupation: Maybe<Enum_Userspermissionsuser_Occupation>
  password: Maybe<Scalars['String']>
  provider: Maybe<Scalars['String']>
  resetPasswordToken: Maybe<Scalars['String']>
  role: Maybe<UsersPermissionsRole>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
  username: Scalars['String']
}

export type UsersPermissionsUserAggregator = {
  __typename?: 'UsersPermissionsUserAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type UsersPermissionsUserConnection = {
  __typename?: 'UsersPermissionsUserConnection'
  aggregate: Maybe<UsersPermissionsUserAggregator>
  groupBy: Maybe<UsersPermissionsUserGroupBy>
  values: Maybe<Array<Maybe<UsersPermissionsUser>>>
}

export type UsersPermissionsUserConnectionBlocked = {
  __typename?: 'UsersPermissionsUserConnectionBlocked'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['Boolean']>
}

export type UsersPermissionsUserConnectionCompany = {
  __typename?: 'UsersPermissionsUserConnectionCompany'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsUserConnectionConfirmationToken = {
  __typename?: 'UsersPermissionsUserConnectionConfirmationToken'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsUserConnectionConfirmed = {
  __typename?: 'UsersPermissionsUserConnectionConfirmed'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['Boolean']>
}

export type UsersPermissionsUserConnectionCreated_At = {
  __typename?: 'UsersPermissionsUserConnectionCreated_at'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['DateTime']>
}

export type UsersPermissionsUserConnectionCreated_By = {
  __typename?: 'UsersPermissionsUserConnectionCreated_by'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['ID']>
}

export type UsersPermissionsUserConnectionEmail = {
  __typename?: 'UsersPermissionsUserConnectionEmail'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsUserConnectionId = {
  __typename?: 'UsersPermissionsUserConnectionId'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['ID']>
}

export type UsersPermissionsUserConnectionInterest = {
  __typename?: 'UsersPermissionsUserConnectionInterest'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsUserConnectionOccupation = {
  __typename?: 'UsersPermissionsUserConnectionOccupation'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsUserConnectionPassword = {
  __typename?: 'UsersPermissionsUserConnectionPassword'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsUserConnectionProvider = {
  __typename?: 'UsersPermissionsUserConnectionProvider'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsUserConnectionResetPasswordToken = {
  __typename?: 'UsersPermissionsUserConnectionResetPasswordToken'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsUserConnectionRole = {
  __typename?: 'UsersPermissionsUserConnectionRole'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['ID']>
}

export type UsersPermissionsUserConnectionUpdated_At = {
  __typename?: 'UsersPermissionsUserConnectionUpdated_at'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['DateTime']>
}

export type UsersPermissionsUserConnectionUpdated_By = {
  __typename?: 'UsersPermissionsUserConnectionUpdated_by'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['ID']>
}

export type UsersPermissionsUserConnectionUsername = {
  __typename?: 'UsersPermissionsUserConnectionUsername'
  connection: Maybe<UsersPermissionsUserConnection>
  key: Maybe<Scalars['String']>
}

export type UsersPermissionsUserGroupBy = {
  __typename?: 'UsersPermissionsUserGroupBy'
  blocked: Maybe<Array<Maybe<UsersPermissionsUserConnectionBlocked>>>
  company: Maybe<Array<Maybe<UsersPermissionsUserConnectionCompany>>>
  confirmationToken: Maybe<Array<Maybe<UsersPermissionsUserConnectionConfirmationToken>>>
  confirmed: Maybe<Array<Maybe<UsersPermissionsUserConnectionConfirmed>>>
  created_at: Maybe<Array<Maybe<UsersPermissionsUserConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<UsersPermissionsUserConnectionCreated_By>>>
  email: Maybe<Array<Maybe<UsersPermissionsUserConnectionEmail>>>
  id: Maybe<Array<Maybe<UsersPermissionsUserConnectionId>>>
  interest: Maybe<Array<Maybe<UsersPermissionsUserConnectionInterest>>>
  occupation: Maybe<Array<Maybe<UsersPermissionsUserConnectionOccupation>>>
  password: Maybe<Array<Maybe<UsersPermissionsUserConnectionPassword>>>
  provider: Maybe<Array<Maybe<UsersPermissionsUserConnectionProvider>>>
  resetPasswordToken: Maybe<Array<Maybe<UsersPermissionsUserConnectionResetPasswordToken>>>
  role: Maybe<Array<Maybe<UsersPermissionsUserConnectionRole>>>
  updated_at: Maybe<Array<Maybe<UsersPermissionsUserConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<UsersPermissionsUserConnectionUpdated_By>>>
  username: Maybe<Array<Maybe<UsersPermissionsUserConnectionUsername>>>
}

export type Video = {
  __typename?: 'Video'
  content: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  duration: Maybe<Scalars['String']>
  id: Scalars['ID']
  mkto_form_id: Maybe<Scalars['Int']>
  panelists: Maybe<Array<Maybe<Panelist>>>
  preview_image: Maybe<UploadFile>
  published: Maybe<Scalars['DateTime']>
  published_at: Maybe<Scalars['DateTime']>
  registration: Maybe<Scalars['Boolean']>
  slug: Scalars['String']
  title: Scalars['String']
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
  videoType: Maybe<Scalars['String']>
}

export type VideoPanelistsArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type VideoAggregator = {
  __typename?: 'VideoAggregator'
  avg: Maybe<VideoAggregatorAvg>
  count: Maybe<Scalars['Int']>
  max: Maybe<VideoAggregatorMax>
  min: Maybe<VideoAggregatorMin>
  sum: Maybe<VideoAggregatorSum>
  totalCount: Maybe<Scalars['Int']>
}

export type VideoAggregatorAvg = {
  __typename?: 'VideoAggregatorAvg'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type VideoAggregatorMax = {
  __typename?: 'VideoAggregatorMax'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type VideoAggregatorMin = {
  __typename?: 'VideoAggregatorMin'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type VideoAggregatorSum = {
  __typename?: 'VideoAggregatorSum'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type VideoConnection = {
  __typename?: 'VideoConnection'
  aggregate: Maybe<VideoAggregator>
  groupBy: Maybe<VideoGroupBy>
  values: Maybe<Array<Maybe<Video>>>
}

export type VideoConnectionContent = {
  __typename?: 'VideoConnectionContent'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['String']>
}

export type VideoConnectionCreated_At = {
  __typename?: 'VideoConnectionCreated_at'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['DateTime']>
}

export type VideoConnectionCreated_By = {
  __typename?: 'VideoConnectionCreated_by'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['ID']>
}

export type VideoConnectionDuration = {
  __typename?: 'VideoConnectionDuration'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['String']>
}

export type VideoConnectionId = {
  __typename?: 'VideoConnectionId'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['ID']>
}

export type VideoConnectionMkto_Form_Id = {
  __typename?: 'VideoConnectionMkto_form_id'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['Int']>
}

export type VideoConnectionPreview_Image = {
  __typename?: 'VideoConnectionPreview_image'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['ID']>
}

export type VideoConnectionPublished = {
  __typename?: 'VideoConnectionPublished'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['DateTime']>
}

export type VideoConnectionPublished_At = {
  __typename?: 'VideoConnectionPublished_at'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['DateTime']>
}

export type VideoConnectionRegistration = {
  __typename?: 'VideoConnectionRegistration'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['Boolean']>
}

export type VideoConnectionSlug = {
  __typename?: 'VideoConnectionSlug'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['String']>
}

export type VideoConnectionTitle = {
  __typename?: 'VideoConnectionTitle'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['String']>
}

export type VideoConnectionUpdated_At = {
  __typename?: 'VideoConnectionUpdated_at'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['DateTime']>
}

export type VideoConnectionUpdated_By = {
  __typename?: 'VideoConnectionUpdated_by'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['ID']>
}

export type VideoConnectionVideoType = {
  __typename?: 'VideoConnectionVideoType'
  connection: Maybe<VideoConnection>
  key: Maybe<Scalars['String']>
}

export type VideoGroupBy = {
  __typename?: 'VideoGroupBy'
  content: Maybe<Array<Maybe<VideoConnectionContent>>>
  created_at: Maybe<Array<Maybe<VideoConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<VideoConnectionCreated_By>>>
  duration: Maybe<Array<Maybe<VideoConnectionDuration>>>
  id: Maybe<Array<Maybe<VideoConnectionId>>>
  mkto_form_id: Maybe<Array<Maybe<VideoConnectionMkto_Form_Id>>>
  preview_image: Maybe<Array<Maybe<VideoConnectionPreview_Image>>>
  published: Maybe<Array<Maybe<VideoConnectionPublished>>>
  published_at: Maybe<Array<Maybe<VideoConnectionPublished_At>>>
  registration: Maybe<Array<Maybe<VideoConnectionRegistration>>>
  slug: Maybe<Array<Maybe<VideoConnectionSlug>>>
  title: Maybe<Array<Maybe<VideoConnectionTitle>>>
  updated_at: Maybe<Array<Maybe<VideoConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<VideoConnectionUpdated_By>>>
  videoType: Maybe<Array<Maybe<VideoConnectionVideoType>>>
}

export type VideoInput = {
  content: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  duration: InputMaybe<Scalars['String']>
  mkto_form_id: InputMaybe<Scalars['Int']>
  panelists: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  preview_image: InputMaybe<Scalars['ID']>
  published: InputMaybe<Scalars['DateTime']>
  published_at: InputMaybe<Scalars['DateTime']>
  registration: InputMaybe<Scalars['Boolean']>
  slug: Scalars['String']
  title: Scalars['String']
  updated_by: InputMaybe<Scalars['ID']>
  videoType: InputMaybe<Scalars['String']>
}

export type WebinarInput = {
  content: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  eventDateTime: InputMaybe<Scalars['String']>
  eventType: InputMaybe<Scalars['String']>
  mkto_form_id: InputMaybe<Scalars['Int']>
  panelists: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  preview_image: InputMaybe<Scalars['ID']>
  published: InputMaybe<Scalars['DateTime']>
  published_at: InputMaybe<Scalars['DateTime']>
  slug: Scalars['String']
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type Webinars = {
  __typename?: 'Webinars'
  content: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  eventDateTime: Maybe<Scalars['String']>
  eventType: Maybe<Scalars['String']>
  id: Scalars['ID']
  mkto_form_id: Maybe<Scalars['Int']>
  panelists: Maybe<Array<Maybe<Panelist>>>
  preview_image: Maybe<UploadFile>
  published: Maybe<Scalars['DateTime']>
  published_at: Maybe<Scalars['DateTime']>
  slug: Scalars['String']
  title: Maybe<Scalars['String']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type WebinarsPanelistsArgs = {
  limit: InputMaybe<Scalars['Int']>
  sort: InputMaybe<Scalars['String']>
  start: InputMaybe<Scalars['Int']>
  where: InputMaybe<Scalars['JSON']>
}

export type WebinarsAggregator = {
  __typename?: 'WebinarsAggregator'
  avg: Maybe<WebinarsAggregatorAvg>
  count: Maybe<Scalars['Int']>
  max: Maybe<WebinarsAggregatorMax>
  min: Maybe<WebinarsAggregatorMin>
  sum: Maybe<WebinarsAggregatorSum>
  totalCount: Maybe<Scalars['Int']>
}

export type WebinarsAggregatorAvg = {
  __typename?: 'WebinarsAggregatorAvg'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type WebinarsAggregatorMax = {
  __typename?: 'WebinarsAggregatorMax'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type WebinarsAggregatorMin = {
  __typename?: 'WebinarsAggregatorMin'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type WebinarsAggregatorSum = {
  __typename?: 'WebinarsAggregatorSum'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type WebinarsConnection = {
  __typename?: 'WebinarsConnection'
  aggregate: Maybe<WebinarsAggregator>
  groupBy: Maybe<WebinarsGroupBy>
  values: Maybe<Array<Maybe<Webinars>>>
}

export type WebinarsConnectionContent = {
  __typename?: 'WebinarsConnectionContent'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['String']>
}

export type WebinarsConnectionCreated_At = {
  __typename?: 'WebinarsConnectionCreated_at'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['DateTime']>
}

export type WebinarsConnectionCreated_By = {
  __typename?: 'WebinarsConnectionCreated_by'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['ID']>
}

export type WebinarsConnectionEventDateTime = {
  __typename?: 'WebinarsConnectionEventDateTime'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['String']>
}

export type WebinarsConnectionEventType = {
  __typename?: 'WebinarsConnectionEventType'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['String']>
}

export type WebinarsConnectionId = {
  __typename?: 'WebinarsConnectionId'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['ID']>
}

export type WebinarsConnectionMkto_Form_Id = {
  __typename?: 'WebinarsConnectionMkto_form_id'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['Int']>
}

export type WebinarsConnectionPreview_Image = {
  __typename?: 'WebinarsConnectionPreview_image'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['ID']>
}

export type WebinarsConnectionPublished = {
  __typename?: 'WebinarsConnectionPublished'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['DateTime']>
}

export type WebinarsConnectionPublished_At = {
  __typename?: 'WebinarsConnectionPublished_at'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['DateTime']>
}

export type WebinarsConnectionSlug = {
  __typename?: 'WebinarsConnectionSlug'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['String']>
}

export type WebinarsConnectionTitle = {
  __typename?: 'WebinarsConnectionTitle'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['String']>
}

export type WebinarsConnectionUpdated_At = {
  __typename?: 'WebinarsConnectionUpdated_at'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['DateTime']>
}

export type WebinarsConnectionUpdated_By = {
  __typename?: 'WebinarsConnectionUpdated_by'
  connection: Maybe<WebinarsConnection>
  key: Maybe<Scalars['ID']>
}

export type WebinarsGroupBy = {
  __typename?: 'WebinarsGroupBy'
  content: Maybe<Array<Maybe<WebinarsConnectionContent>>>
  created_at: Maybe<Array<Maybe<WebinarsConnectionCreated_At>>>
  created_by: Maybe<Array<Maybe<WebinarsConnectionCreated_By>>>
  eventDateTime: Maybe<Array<Maybe<WebinarsConnectionEventDateTime>>>
  eventType: Maybe<Array<Maybe<WebinarsConnectionEventType>>>
  id: Maybe<Array<Maybe<WebinarsConnectionId>>>
  mkto_form_id: Maybe<Array<Maybe<WebinarsConnectionMkto_Form_Id>>>
  preview_image: Maybe<Array<Maybe<WebinarsConnectionPreview_Image>>>
  published: Maybe<Array<Maybe<WebinarsConnectionPublished>>>
  published_at: Maybe<Array<Maybe<WebinarsConnectionPublished_At>>>
  slug: Maybe<Array<Maybe<WebinarsConnectionSlug>>>
  title: Maybe<Array<Maybe<WebinarsConnectionTitle>>>
  updated_at: Maybe<Array<Maybe<WebinarsConnectionUpdated_At>>>
  updated_by: Maybe<Array<Maybe<WebinarsConnectionUpdated_By>>>
}

export type WebsiteTermsOfUse = {
  __typename?: 'WebsiteTermsOfUse'
  content: Maybe<Scalars['String']>
  created_at: Scalars['DateTime']
  created_by: Maybe<AdminUser>
  date: Maybe<Scalars['String']>
  id: Scalars['ID']
  published_at: Maybe<Scalars['DateTime']>
  title: Maybe<Scalars['String']>
  updated_at: Scalars['DateTime']
  updated_by: Maybe<AdminUser>
}

export type WebsiteTermsOfUseInput = {
  content: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  date: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type CreateBackgroundColorInput = {
  data: InputMaybe<BackgroundColorInput>
}

export type CreateBackgroundColorPayload = {
  __typename?: 'createBackgroundColorPayload'
  backgroundColor: Maybe<BackgroundColor>
}

export type CreateCaseStudyInput = {
  data: InputMaybe<CaseStudyInput>
}

export type CreateCaseStudyPayload = {
  __typename?: 'createCaseStudyPayload'
  caseStudy: Maybe<CaseStudy>
}

export type CreateCompanySizeInput = {
  data: InputMaybe<CompanySizeInput>
}

export type CreateCompanySizePayload = {
  __typename?: 'createCompanySizePayload'
  companySize: Maybe<CompanySize>
}

export type CreateCompetitorComparisonInput = {
  data: InputMaybe<CompetitorComparisonInput>
}

export type CreateCompetitorComparisonPayload = {
  __typename?: 'createCompetitorComparisonPayload'
  competitorComparison: Maybe<CompetitorComparison>
}

export type CreateContactSaleInput = {
  data: InputMaybe<ContactSaleInput>
}

export type CreateContactSalePayload = {
  __typename?: 'createContactSalePayload'
  contactSale: Maybe<ContactSale>
}

export type CreateContactUsInput = {
  data: InputMaybe<ContactUsInput>
}

export type CreateContactUsPayload = {
  __typename?: 'createContactUsPayload'
  contactUs: Maybe<ContactUs>
}

export type CreateEBookInput = {
  data: InputMaybe<EBookInput>
}

export type CreateEBookPayload = {
  __typename?: 'createEBookPayload'
  eBook: Maybe<EBook>
}

export type CreateEventInput = {
  data: InputMaybe<EventInput>
}

export type CreateEventPayload = {
  __typename?: 'createEventPayload'
  event: Maybe<Event>
}

export type CreateHarnessModuleInput = {
  data: InputMaybe<HarnessModuleInput>
}

export type CreateHarnessModulePayload = {
  __typename?: 'createHarnessModulePayload'
  harnessModule: Maybe<HarnessModule>
}

export type CreateIndustryInput = {
  data: InputMaybe<IndustryInput>
}

export type CreateIndustryPayload = {
  __typename?: 'createIndustryPayload'
  industry: Maybe<Industry>
}

export type CreateIntegrationInput = {
  data: InputMaybe<IntegrationInput>
}

export type CreateIntegrationPayload = {
  __typename?: 'createIntegrationPayload'
  integration: Maybe<Integration>
}

export type CreateMarketingSiteInput = {
  data: InputMaybe<MarketingSiteInput>
}

export type CreateMarketingSitePayload = {
  __typename?: 'createMarketingSitePayload'
  marketingSite: Maybe<MarketingSite>
}

export type CreateOutcomeInput = {
  data: InputMaybe<OutcomeInput>
}

export type CreateOutcomePayload = {
  __typename?: 'createOutcomePayload'
  outcome: Maybe<Outcome>
}

export type CreatePanelistInput = {
  data: InputMaybe<PanelistInput>
}

export type CreatePanelistPayload = {
  __typename?: 'createPanelistPayload'
  panelist: Maybe<Panelist>
}

export type CreateRoleInput = {
  data: InputMaybe<RoleInput>
}

export type CreateRolePayload = {
  __typename?: 'createRolePayload'
  role: Maybe<UsersPermissionsRole>
}

export type CreateUserInput = {
  data: InputMaybe<UserInput>
}

export type CreateUserPayload = {
  __typename?: 'createUserPayload'
  user: Maybe<UsersPermissionsUser>
}

export type CreateVideoInput = {
  data: InputMaybe<VideoInput>
}

export type CreateVideoPayload = {
  __typename?: 'createVideoPayload'
  video: Maybe<Video>
}

export type CreateWebinarInput = {
  data: InputMaybe<WebinarInput>
}

export type CreateWebinarPayload = {
  __typename?: 'createWebinarPayload'
  webinar: Maybe<Webinars>
}

export type DeleteAboutUsPayload = {
  __typename?: 'deleteAboutUsPayload'
  aboutUs: Maybe<AboutUs>
}

export type DeleteBackgroundColorInput = {
  where: InputMaybe<InputId>
}

export type DeleteBackgroundColorPayload = {
  __typename?: 'deleteBackgroundColorPayload'
  backgroundColor: Maybe<BackgroundColor>
}

export type DeleteCareerPayload = {
  __typename?: 'deleteCareerPayload'
  career: Maybe<Careers>
}

export type DeleteCaseStudyInput = {
  where: InputMaybe<InputId>
}

export type DeleteCaseStudyPayload = {
  __typename?: 'deleteCaseStudyPayload'
  caseStudy: Maybe<CaseStudy>
}

export type DeleteCompanySizeInput = {
  where: InputMaybe<InputId>
}

export type DeleteCompanySizePayload = {
  __typename?: 'deleteCompanySizePayload'
  companySize: Maybe<CompanySize>
}

export type DeleteCompetitorComparisonInput = {
  where: InputMaybe<InputId>
}

export type DeleteCompetitorComparisonPayload = {
  __typename?: 'deleteCompetitorComparisonPayload'
  competitorComparison: Maybe<CompetitorComparison>
}

export type DeleteContactSaleInput = {
  where: InputMaybe<InputId>
}

export type DeleteContactSalePayload = {
  __typename?: 'deleteContactSalePayload'
  contactSale: Maybe<ContactSale>
}

export type DeleteContactUsInput = {
  where: InputMaybe<InputId>
}

export type DeleteContactUsPayload = {
  __typename?: 'deleteContactUsPayload'
  contactUs: Maybe<ContactUs>
}

export type DeleteCustomerPayload = {
  __typename?: 'deleteCustomerPayload'
  customer: Maybe<Customer>
}

export type DeleteDevOpsToolPayload = {
  __typename?: 'deleteDevOpsToolPayload'
  devOpsTool: Maybe<DevOpsTools>
}

export type DeleteEBookInput = {
  where: InputMaybe<InputId>
}

export type DeleteEBookPayload = {
  __typename?: 'deleteEBookPayload'
  eBook: Maybe<EBook>
}

export type DeleteEventInput = {
  where: InputMaybe<InputId>
}

export type DeleteEventPayload = {
  __typename?: 'deleteEventPayload'
  event: Maybe<Event>
}

export type DeleteFileInput = {
  where: InputMaybe<InputId>
}

export type DeleteFilePayload = {
  __typename?: 'deleteFilePayload'
  file: Maybe<UploadFile>
}

export type DeleteHarnessModuleInput = {
  where: InputMaybe<InputId>
}

export type DeleteHarnessModulePayload = {
  __typename?: 'deleteHarnessModulePayload'
  harnessModule: Maybe<HarnessModule>
}

export type DeleteHarnessSubscriptionPayload = {
  __typename?: 'deleteHarnessSubscriptionPayload'
  harnessSubscription: Maybe<HarnessSubscription>
}

export type DeleteHomePayload = {
  __typename?: 'deleteHomePayload'
  home: Maybe<Home>
}

export type DeleteIndustryInput = {
  where: InputMaybe<InputId>
}

export type DeleteIndustryPayload = {
  __typename?: 'deleteIndustryPayload'
  industry: Maybe<Industry>
}

export type DeleteIntegrationInput = {
  where: InputMaybe<InputId>
}

export type DeleteIntegrationPayload = {
  __typename?: 'deleteIntegrationPayload'
  integration: Maybe<Integration>
}

export type DeleteMarketingSiteInput = {
  where: InputMaybe<InputId>
}

export type DeleteMarketingSitePayload = {
  __typename?: 'deleteMarketingSitePayload'
  marketingSite: Maybe<MarketingSite>
}

export type DeleteOutcomeInput = {
  where: InputMaybe<InputId>
}

export type DeleteOutcomePayload = {
  __typename?: 'deleteOutcomePayload'
  outcome: Maybe<Outcome>
}

export type DeletePanelistInput = {
  where: InputMaybe<InputId>
}

export type DeletePanelistPayload = {
  __typename?: 'deletePanelistPayload'
  panelist: Maybe<Panelist>
}

export type DeletePartnerPayload = {
  __typename?: 'deletePartnerPayload'
  partner: Maybe<Partners>
}

export type DeletePressAndNewPayload = {
  __typename?: 'deletePressAndNewPayload'
  pressAndNew: Maybe<PressAndNews>
}

export type DeletePricingPayload = {
  __typename?: 'deletePricingPayload'
  pricing: Maybe<Pricing>
}

export type DeletePrivacyPayload = {
  __typename?: 'deletePrivacyPayload'
  privacy: Maybe<Privacy>
}

export type DeleteProductCdPayload = {
  __typename?: 'deleteProductCdPayload'
  productCd: Maybe<ProductCd>
}

export type DeleteProductChangeIntelligencePayload = {
  __typename?: 'deleteProductChangeIntelligencePayload'
  productChangeIntelligence: Maybe<ProductChangeIntelligence>
}

export type DeleteProductCiPayload = {
  __typename?: 'deleteProductCiPayload'
  productCi: Maybe<ProductCi>
}

export type DeleteProductCloudCostPayload = {
  __typename?: 'deleteProductCloudCostPayload'
  productCloudCost: Maybe<ProductCloudCost>
}

export type DeleteProductFeatureFlagPayload = {
  __typename?: 'deleteProductFeatureFlagPayload'
  productFeatureFlag: Maybe<ProductFeatureFlags>
}

export type DeleteProductPlatformPayload = {
  __typename?: 'deleteProductPlatformPayload'
  productPlatform: Maybe<ProductPlatform>
}

export type DeleteRoleInput = {
  where: InputMaybe<InputId>
}

export type DeleteRolePayload = {
  __typename?: 'deleteRolePayload'
  role: Maybe<UsersPermissionsRole>
}

export type DeleteUserInput = {
  where: InputMaybe<InputId>
}

export type DeleteUserPayload = {
  __typename?: 'deleteUserPayload'
  user: Maybe<UsersPermissionsUser>
}

export type DeleteVideoInput = {
  where: InputMaybe<InputId>
}

export type DeleteVideoPayload = {
  __typename?: 'deleteVideoPayload'
  video: Maybe<Video>
}

export type DeleteWebinarInput = {
  where: InputMaybe<InputId>
}

export type DeleteWebinarPayload = {
  __typename?: 'deleteWebinarPayload'
  webinar: Maybe<Webinars>
}

export type DeleteWebsiteTermsOfUsePayload = {
  __typename?: 'deleteWebsiteTermsOfUsePayload'
  websiteTermsOfUse: Maybe<WebsiteTermsOfUse>
}

export type EditAboutUsInput = {
  awards: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  coreValues: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  created_by: InputMaybe<Scalars['ID']>
  executiveTeam: InputMaybe<Array<InputMaybe<EditComponentPageExecutiveZoneInput>>>
  harnessOffices: InputMaybe<EditComponentCompanyPageOfficesZoneInput>
  hero: InputMaybe<EditComponentPageTitleZoneInput>
  investors: InputMaybe<EditComponentPageSimpleZoneInput>
  joinTeam: InputMaybe<EditComponentPageTeamZoneInput>
  offices: InputMaybe<Array<InputMaybe<EditComponentCompanyPageAdressZoneInput>>>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditBackgroundColorInput = {
  colorCode: InputMaybe<Scalars['String']>
  colorName: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditCareerInput = {
  benefits: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  caseStudies: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  events: InputMaybe<Array<InputMaybe<EditComponentPageTextImageZoneInput>>>
  harnessIs: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  joinTeam: InputMaybe<EditComponentPageTeamZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditCaseStudyInput = {
  background_color: InputMaybe<Scalars['ID']>
  companyLogo: InputMaybe<Scalars['ID']>
  company_size: InputMaybe<Scalars['ID']>
  created_by: InputMaybe<Scalars['ID']>
  description: InputMaybe<Scalars['String']>
  harness_modules: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  industry: InputMaybe<Scalars['ID']>
  integrations: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  outcomes: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
  videoLink: InputMaybe<Scalars['String']>
}

export type EditCompanySizeInput = {
  created_by: InputMaybe<Scalars['ID']>
  item: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditCompetitorComparisonInput = {
  caseStudy: InputMaybe<EditComponentCompetitorComparisonPageComparisonCaseStudyInput>
  competitor: InputMaybe<Scalars['String']>
  competitorLogo: InputMaybe<Scalars['ID']>
  competitorSummary: InputMaybe<EditComponentCompetitorComparisonPageProductSummaryZoneInput>
  created_by: InputMaybe<Scalars['ID']>
  detailedFeatureComparison: InputMaybe<EditComponentCompetitorComparisonPageDetailedFeatureComparisonInput>
  featureComparison: InputMaybe<EditComponentCompetitorComparisonPageFeatureComparisonInput>
  harnessLogo: InputMaybe<Scalars['ID']>
  harnessModule: InputMaybe<Enum_Competitorcomparison_Harnessmodule>
  harnessSummary: InputMaybe<EditComponentCompetitorComparisonPageProductSummaryZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  recommended: InputMaybe<EditComponentPageScreenshotZoneInput>
  screenshot: InputMaybe<EditComponentPageScreenshotZoneInput>
  slug: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditComponentCompanyPageAdressZoneInput = {
  address: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  name: InputMaybe<Scalars['String']>
}

export type EditComponentCompanyPageOfficesZoneInput = {
  addresses: InputMaybe<Array<InputMaybe<EditComponentCompanyPageAdressZoneInput>>>
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentCompetitorComparisonPageComparisonCaseStudyInput = {
  caseStudy: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentCompetitorComparisonPageDetailedFeatureComparisonInput = {
  detailedFeature: InputMaybe<Array<InputMaybe<EditComponentCompetitorComparisonPageProductDetailedFeatureInput>>>
  id: InputMaybe<Scalars['ID']>
  note: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentCompetitorComparisonPageFeatureComparisonInput = {
  id: InputMaybe<Scalars['ID']>
  productFeature: InputMaybe<Array<InputMaybe<EditComponentCompetitorComparisonPageProductFeatureInput>>>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentCompetitorComparisonPageProductDetailedFeatureInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentCompetitorComparisonPageProductFeatureInput = {
  competitorText: InputMaybe<Scalars['String']>
  competitorValue: InputMaybe<Enum_Componentcompetitorcomparisonpageproductfeature_Competitorvalue>
  id: InputMaybe<Scalars['ID']>
  label: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  text: InputMaybe<Scalars['String']>
  value: InputMaybe<Enum_Componentcompetitorcomparisonpageproductfeature_Value>
}

export type EditComponentCompetitorComparisonPageProductSummaryZoneInput = {
  categorized: InputMaybe<Scalars['String']>
  companySize: InputMaybe<Scalars['String']>
  desc: InputMaybe<Scalars['String']>
  founded: InputMaybe<Scalars['String']>
  funding: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  logo: InputMaybe<Scalars['ID']>
  name: InputMaybe<Scalars['String']>
}

export type EditComponentPageCaseListZoneInput = {
  caseDescription: InputMaybe<Scalars['String']>
  caseTitle: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  moduleColor: InputMaybe<Enum_Componentpagecaselistzone_Modulecolor>
  videoLink: InputMaybe<Scalars['String']>
}

export type EditComponentPageCaseStudyZoneInput = {
  background_color: InputMaybe<Scalars['ID']>
  btnText: InputMaybe<Scalars['String']>
  client: InputMaybe<Scalars['String']>
  clientPic: InputMaybe<Scalars['ID']>
  harness_modules: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  quote: InputMaybe<Scalars['String']>
}

export type EditComponentPageCustomerLogoZoneInput = {
  customerName: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  logo: InputMaybe<Scalars['ID']>
}

export type EditComponentPageExecutiveZoneInput = {
  bio: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  name: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageFeatureLIstZoneInput = {
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageHarnessModuleInput = {
  harness_modules: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  id: InputMaybe<Scalars['ID']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageImagePlusInput = {
  comingSoon: InputMaybe<Scalars['Boolean']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  name: InputMaybe<Scalars['String']>
}

export type EditComponentPageImageZoneInput = {
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  name: InputMaybe<Scalars['String']>
}

export type EditComponentPageMiniTitleZoneInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageModuleInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageMultiImgListZoneInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Array<InputMaybe<EditComponentPageImageZoneInput>>>
  list: InputMaybe<Array<InputMaybe<EditComponentPageFeatureLIstZoneInput>>>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageMultiImgZoneInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  link: InputMaybe<Scalars['String']>
  secondaryLink: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageNewsZoneInput = {
  featured: InputMaybe<Scalars['Boolean']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  logo: InputMaybe<Scalars['ID']>
  media: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  year: InputMaybe<Scalars['Int']>
}

export type EditComponentPageOptionZoneInput = {
  id: InputMaybe<Scalars['ID']>
  optionDescription: InputMaybe<Scalars['String']>
  optionSubTitle: InputMaybe<Scalars['String']>
  optionTitle: InputMaybe<Scalars['String']>
  screenshot: InputMaybe<Scalars['ID']>
}

export type EditComponentPageProductIntroLogoZoneInput = {
  ProdIntroDesc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  prodIntroScreenshot: InputMaybe<Scalars['ID']>
  prodIntroTitle: InputMaybe<Scalars['String']>
  prodLogo: InputMaybe<Scalars['ID']>
}

export type EditComponentPageProductTitleZoneInput = {
  backgroundImg: InputMaybe<Scalars['ID']>
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  video: InputMaybe<Scalars['String']>
}

export type EditComponentPageQuoteZoneInput = {
  id: InputMaybe<Scalars['ID']>
  quoteName: InputMaybe<Scalars['String']>
  quoteText: InputMaybe<Scalars['String']>
}

export type EditComponentPageRichTextZoneInput = {
  bodyText: InputMaybe<Scalars['String']>
  dateText: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  pageTitle: InputMaybe<Scalars['String']>
}

export type EditComponentPageScreenshotZoneInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Array<InputMaybe<EditComponentPageImageZoneInput>>>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageSectionOptionInput = {
  id: InputMaybe<Scalars['ID']>
  optionDesc: InputMaybe<Scalars['String']>
  optionImg: InputMaybe<Scalars['ID']>
  optionTitle: InputMaybe<Scalars['String']>
  richTextDesc: InputMaybe<Scalars['String']>
}

export type EditComponentPageSectionSecurityInput = {
  id: InputMaybe<Scalars['ID']>
  securityDesc: InputMaybe<Scalars['String']>
  securityImg: InputMaybe<Scalars['ID']>
  securityTitle: InputMaybe<Scalars['String']>
}

export type EditComponentPageSimpleTitleZoneInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  secondaryLink: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageSimpleZoneInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  investorList: InputMaybe<Array<InputMaybe<EditComponentPageCustomerLogoZoneInput>>>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageTeamZoneInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  secondaryLink: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  teamPics: InputMaybe<Array<InputMaybe<EditComponentPageImageZoneInput>>>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageTextImageZoneInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageTextZoneInput = {
  FeatureIntro: InputMaybe<Scalars['String']>
  featureTitle: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  imageName: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
}

export type EditComponentPageTitleImgZoneInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageTitleZoneInput = {
  description: InputMaybe<Scalars['String']>
  desktopHeroAnimation: InputMaybe<Scalars['ID']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  mobileHeroAnimation: InputMaybe<Scalars['ID']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPageWorkflowCardInput = {
  cardDesc: InputMaybe<Scalars['String']>
  cardImg: InputMaybe<Scalars['ID']>
  cardTitle: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
}

export type EditComponentPageWorkflowInput = {
  id: InputMaybe<Scalars['ID']>
  workflowCard: InputMaybe<Array<InputMaybe<EditComponentPageWorkflowCardInput>>>
  workflowDesc: InputMaybe<Scalars['String']>
  workflowImg: InputMaybe<Scalars['ID']>
  workflowTitle: InputMaybe<Scalars['String']>
}

export type EditComponentPricingPageCallOutInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPricingPageDetailedFeatureInput = {
  communityText: InputMaybe<Scalars['String']>
  communityValue: InputMaybe<Enum_Componentpricingpagedetailedfeature_Communityvalue>
  enterpriseText: InputMaybe<Scalars['String']>
  enterpriseValue: InputMaybe<Enum_Componentpricingpagedetailedfeature_Enterprisevalue>
  freeText: InputMaybe<Scalars['String']>
  freeValue: InputMaybe<Enum_Componentpricingpagedetailedfeature_Freevalue>
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  teamText: InputMaybe<Scalars['String']>
  teamValue: InputMaybe<Enum_Componentpricingpagedetailedfeature_Teamvalue>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPricingPageFaqInput = {
  anchor: InputMaybe<Scalars['String']>
  faqAnswer: InputMaybe<Scalars['String']>
  faqTitle: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
}

export type EditComponentPricingPageFeatureCaptionInput = {
  btnLink: InputMaybe<Scalars['String']>
  btnText: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  primaryButton: InputMaybe<Scalars['Boolean']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPricingPageFeatureGroupInput = {
  detailedFeature: InputMaybe<Array<InputMaybe<EditComponentPricingPageDetailedFeatureInput>>>
  id: InputMaybe<Scalars['ID']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentPricingPageMorePlansZoneInput = {
  buttonText: InputMaybe<Scalars['String']>
  deploymentVerification: InputMaybe<Scalars['Boolean']>
  deplymentPerDay: InputMaybe<Scalars['String']>
  deplymentUnits: InputMaybe<Scalars['String']>
  enterpriseGovernance: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  managementAtScale: InputMaybe<Scalars['String']>
  primaryButton: InputMaybe<Scalars['Boolean']>
  security: InputMaybe<Scalars['String']>
  servicesSupported: InputMaybe<Scalars['String']>
  support: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  users: InputMaybe<Scalars['String']>
}

export type EditComponentPricingPagePlansZoneInput = {
  buttonText: InputMaybe<Scalars['String']>
  comingSoon: InputMaybe<Scalars['Boolean']>
  desc: InputMaybe<Scalars['String']>
  featureListZone: InputMaybe<Array<InputMaybe<EditComponentPageFeatureLIstZoneInput>>>
  featureTitle: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  price: InputMaybe<Scalars['String']>
  priceTerm: InputMaybe<Scalars['String']>
  priceTermTips: InputMaybe<Scalars['String']>
  priceTips: InputMaybe<Scalars['String']>
  primaryButton: InputMaybe<Scalars['Boolean']>
  support: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  unit: InputMaybe<Scalars['String']>
  unitTips: InputMaybe<Scalars['String']>
  yearlyPrice: InputMaybe<Scalars['String']>
  yearlyPriceTerm: InputMaybe<Scalars['String']>
  yearlyPriceTermTips: InputMaybe<Scalars['String']>
  yearlyPriceTips: InputMaybe<Scalars['String']>
}

export type EditComponentPricingPageTooltipsZoneInput = {
  id: InputMaybe<Scalars['ID']>
  keyword: InputMaybe<Scalars['String']>
  tooltip: InputMaybe<Scalars['String']>
}

export type EditComponentProductPageIntegrationZoneInput = {
  clientSide: InputMaybe<Array<InputMaybe<EditComponentPageImagePlusInput>>>
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  link: InputMaybe<Scalars['String']>
  secondaryLink: InputMaybe<Scalars['String']>
  serverSide: InputMaybe<Array<InputMaybe<EditComponentPageImagePlusInput>>>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditComponentProductPageIntegrationsZoneInput = {
  desc: InputMaybe<Scalars['String']>
  id: InputMaybe<Scalars['ID']>
  img: InputMaybe<Array<InputMaybe<EditComponentPageImagePlusInput>>>
  link: InputMaybe<Scalars['String']>
  secondaryLink: InputMaybe<Scalars['String']>
  subTitle: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
}

export type EditContactSaleInput = {
  company: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  email: InputMaybe<Scalars['String']>
  firstName: InputMaybe<Scalars['String']>
  lastName: InputMaybe<Scalars['String']>
  phone: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditContactUsInput = {
  company: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  email: InputMaybe<Scalars['String']>
  firstName: InputMaybe<Scalars['String']>
  lastName: InputMaybe<Scalars['String']>
  phone: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditCustomerInput = {
  caseStudy: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  feature: InputMaybe<Array<InputMaybe<EditComponentPageHarnessModuleInput>>>
  logoRow1: InputMaybe<Array<InputMaybe<EditComponentPageCustomerLogoZoneInput>>>
  logoRow2: InputMaybe<Array<InputMaybe<EditComponentPageCustomerLogoZoneInput>>>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<EditComponentPageTitleZoneInput>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditDevOpsToolInput = {
  created_by: InputMaybe<Scalars['ID']>
  hero: InputMaybe<EditComponentPageTitleImgZoneInput>
  introDesc: InputMaybe<Scalars['String']>
  introTitle: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditEBookInput = {
  content: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  detail_image: InputMaybe<Scalars['ID']>
  mkto_form_id: InputMaybe<Scalars['Int']>
  pdf: InputMaybe<Scalars['ID']>
  preview_image: InputMaybe<Scalars['ID']>
  published: InputMaybe<Scalars['DateTime']>
  published_at: InputMaybe<Scalars['DateTime']>
  slug: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditEventInput = {
  created_by: InputMaybe<Scalars['ID']>
  detailsLeftColumn: InputMaybe<Scalars['String']>
  detailsRightColumn: InputMaybe<Scalars['String']>
  mktoFormTitle: InputMaybe<Scalars['String']>
  mkto_form_id: InputMaybe<Scalars['String']>
  panelists: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  profilesHeading: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  registerImage: InputMaybe<Scalars['ID']>
  registration: InputMaybe<Scalars['Boolean']>
  slug: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  topBannerImg: InputMaybe<Scalars['ID']>
  topBannerText: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditFileInput = {
  alternativeText: InputMaybe<Scalars['String']>
  caption: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  ext: InputMaybe<Scalars['String']>
  formats: InputMaybe<Scalars['JSON']>
  hash: InputMaybe<Scalars['String']>
  height: InputMaybe<Scalars['Int']>
  mime: InputMaybe<Scalars['String']>
  name: InputMaybe<Scalars['String']>
  previewUrl: InputMaybe<Scalars['String']>
  provider: InputMaybe<Scalars['String']>
  provider_metadata: InputMaybe<Scalars['JSON']>
  related: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  size: InputMaybe<Scalars['Float']>
  updated_by: InputMaybe<Scalars['ID']>
  url: InputMaybe<Scalars['String']>
  width: InputMaybe<Scalars['Int']>
}

export type EditHarnessModuleInput = {
  created_by: InputMaybe<Scalars['ID']>
  item: InputMaybe<Scalars['String']>
  link: InputMaybe<Scalars['String']>
  moduleDesc: InputMaybe<Scalars['String']>
  moduleLogo: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  moduleName: InputMaybe<Scalars['String']>
  moduleStyle: InputMaybe<Enum_Harnessmodule_Modulestyle>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditHarnessSubscriptionInput = {
  created_by: InputMaybe<Scalars['ID']>
  mainBody: InputMaybe<EditComponentPageRichTextZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditHomeInput = {
  caseStudies: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<EditComponentPageCustomerLogoZoneInput>>>
  explore: InputMaybe<Array<InputMaybe<EditComponentPageOptionZoneInput>>>
  feature: InputMaybe<Array<InputMaybe<EditComponentPageTextZoneInput>>>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<EditComponentPageTitleZoneInput>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditIndustryInput = {
  created_by: InputMaybe<Scalars['ID']>
  item: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditIntegrationInput = {
  created_by: InputMaybe<Scalars['ID']>
  item: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditMarketingSiteInput = {
  aiDesc: InputMaybe<Scalars['String']>
  aiTitle: InputMaybe<Scalars['String']>
  caseStudy1: InputMaybe<Scalars['String']>
  caseStudy1Client: InputMaybe<Scalars['String']>
  caseStudy2: InputMaybe<Scalars['String']>
  caseStudy2Client: InputMaybe<Scalars['String']>
  cdDesc: InputMaybe<Scalars['String']>
  cdSubTitle: InputMaybe<Scalars['String']>
  cdTitle: InputMaybe<Scalars['String']>
  chIntelDesc: InputMaybe<Scalars['String']>
  chIntelSubTitle: InputMaybe<Scalars['String']>
  chIntelTitle: InputMaybe<Scalars['String']>
  ciDesc: InputMaybe<Scalars['String']>
  ciSubTitle: InputMaybe<Scalars['String']>
  ciTitle: InputMaybe<Scalars['String']>
  cloudCostDesc: InputMaybe<Scalars['String']>
  cloudCostSubTitle: InputMaybe<Scalars['String']>
  cloudCostTitle: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  developerDesc: InputMaybe<Scalars['String']>
  developerTitle: InputMaybe<Scalars['String']>
  featureFlagsDesc: InputMaybe<Scalars['String']>
  featureFlagsSubTitle: InputMaybe<Scalars['String']>
  featureFlagsTitle: InputMaybe<Scalars['String']>
  governaceDesc: InputMaybe<Scalars['String']>
  governaceTitle: InputMaybe<Scalars['String']>
  heroSubTitle: InputMaybe<Scalars['String']>
  heroTitle: InputMaybe<Scalars['String']>
  name: InputMaybe<Scalars['String']>
  pipelineDesc: InputMaybe<Scalars['String']>
  piplineTitle: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditOutcomeInput = {
  created_by: InputMaybe<Scalars['ID']>
  item: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditPanelistInput = {
  company: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  firstName: InputMaybe<Scalars['String']>
  jobTitle: InputMaybe<Scalars['String']>
  lastName: InputMaybe<Scalars['String']>
  profile_image: InputMaybe<Scalars['ID']>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditPartnerInput = {
  created_by: InputMaybe<Scalars['ID']>
  features: InputMaybe<Array<InputMaybe<EditComponentPageMultiImgListZoneInput>>>
  harnessPlatform: InputMaybe<EditComponentPageSimpleTitleZoneInput>
  hero: InputMaybe<EditComponentPageSimpleTitleZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditPressAndNewInput = {
  created_by: InputMaybe<Scalars['ID']>
  hero: InputMaybe<EditComponentPageSimpleTitleZoneInput>
  news: InputMaybe<Array<InputMaybe<EditComponentPageNewsZoneInput>>>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditPricingInput = {
  caseStudies: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  ccFaq: InputMaybe<Array<InputMaybe<EditComponentPricingPageFaqInput>>>
  ccFeatureCaption: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureCaptionInput>>>
  ccFeatureGroup: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureGroupInput>>>
  ccPlans: InputMaybe<Array<InputMaybe<EditComponentPricingPagePlansZoneInput>>>
  cdFaq: InputMaybe<Array<InputMaybe<EditComponentPricingPageFaqInput>>>
  cdFeatureCaption: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureCaptionInput>>>
  cdFeatureGroup: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureGroupInput>>>
  cdPlans: InputMaybe<Array<InputMaybe<EditComponentPricingPagePlansZoneInput>>>
  srmFeatureCaption: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureCaptionInput>>>
  srmFeatureGroup: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureGroupInput>>>
  srmPlans: InputMaybe<Array<InputMaybe<EditComponentPricingPagePlansZoneInput>>>
  ciFaq: InputMaybe<Array<InputMaybe<EditComponentPricingPageFaqInput>>>
  ciFeatureCaption: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureCaptionInput>>>
  ciFeatureGroup: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureGroupInput>>>
  ciPlans: InputMaybe<Array<InputMaybe<EditComponentPricingPagePlansZoneInput>>>
  ciSaasFeatureCaption: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureCaptionInput>>>
  ciSaasFeatureGroup: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureGroupInput>>>
  ciSaasPlans: InputMaybe<Array<InputMaybe<EditComponentPricingPagePlansZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  ffFaq: InputMaybe<Array<InputMaybe<EditComponentPricingPageFaqInput>>>
  ffFeatureCaption: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureCaptionInput>>>
  ffFeatureGroup: InputMaybe<Array<InputMaybe<EditComponentPricingPageFeatureGroupInput>>>
  ffPlans: InputMaybe<Array<InputMaybe<EditComponentPricingPagePlansZoneInput>>>
  hero: InputMaybe<EditComponentPageMiniTitleZoneInput>
  openSource: InputMaybe<EditComponentPricingPageCallOutInput>
  published_at: InputMaybe<Scalars['DateTime']>
  tooltips: InputMaybe<Array<InputMaybe<EditComponentPricingPageTooltipsZoneInput>>>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditPrivacyInput = {
  content: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  date: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditProductCdInput = {
  caseStudies: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<EditComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: InputMaybe<Array<InputMaybe<EditComponentPageOptionZoneInput>>>
  features: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  harnessPlatform: InputMaybe<EditComponentPageProductIntroLogoZoneInput>
  hero: InputMaybe<EditComponentPageProductTitleZoneInput>
  integrations: InputMaybe<EditComponentProductPageIntegrationsZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditProductChangeIntelligenceInput = {
  caseStudies: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<EditComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: InputMaybe<Array<InputMaybe<EditComponentPageOptionZoneInput>>>
  features: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  hero: InputMaybe<EditComponentPageProductTitleZoneInput>
  integrations: InputMaybe<EditComponentProductPageIntegrationsZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditProductCiInput = {
  caseStudies: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<EditComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: InputMaybe<Array<InputMaybe<EditComponentPageOptionZoneInput>>>
  features: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  harnessPlatform: InputMaybe<EditComponentPageProductIntroLogoZoneInput>
  hero: InputMaybe<EditComponentPageProductTitleZoneInput>
  integrations: InputMaybe<EditComponentProductPageIntegrationsZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditProductCloudCostInput = {
  caseStudies: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  costTransparency: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<EditComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: InputMaybe<Array<InputMaybe<EditComponentPageOptionZoneInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  governance: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  harnessPlatform: InputMaybe<EditComponentPageProductIntroLogoZoneInput>
  hero: InputMaybe<EditComponentPageProductTitleZoneInput>
  integrations: InputMaybe<EditComponentProductPageIntegrationsZoneInput>
  optimization: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  published_at: InputMaybe<Scalars['DateTime']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditProductFeatureFlagInput = {
  caseStudies: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  customerLogos: InputMaybe<Array<InputMaybe<EditComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: InputMaybe<Array<InputMaybe<EditComponentPageOptionZoneInput>>>
  features: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  features2: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  featuresTitle2: InputMaybe<Scalars['String']>
  harnessPlatform: InputMaybe<EditComponentPageProductIntroLogoZoneInput>
  hero: InputMaybe<EditComponentPageProductTitleZoneInput>
  integrations: InputMaybe<EditComponentProductPageIntegrationZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  sectionOptions: InputMaybe<EditComponentPageSectionOptionInput>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditProductPlatformInput = {
  caseStudies: InputMaybe<Array<InputMaybe<EditComponentPageCaseStudyZoneInput>>>
  created_by: InputMaybe<Scalars['ID']>
  features: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  featuresTitle: InputMaybe<Scalars['String']>
  harnessPlatform: InputMaybe<EditComponentPageProductIntroLogoZoneInput>
  hero: InputMaybe<EditComponentPageProductTitleZoneInput>
  hostingOptions: InputMaybe<EditComponentPageOptionZoneInput>
  integrations: InputMaybe<EditComponentProductPageIntegrationsZoneInput>
  modules: InputMaybe<Array<InputMaybe<EditComponentPageModuleInput>>>
  platformModules: InputMaybe<EditComponentPageTitleZoneInput>
  published_at: InputMaybe<Scalars['DateTime']>
  sectionOptions: InputMaybe<EditComponentPageSectionOptionInput>
  sectionSecurity: InputMaybe<EditComponentPageSectionSecurityInput>
  supportedPlatforms: InputMaybe<EditComponentProductPageIntegrationsZoneInput>
  updated_by: InputMaybe<Scalars['ID']>
  workflow: InputMaybe<EditComponentPageWorkflowInput>
}

export type EditRoleInput = {
  created_by: InputMaybe<Scalars['ID']>
  description: InputMaybe<Scalars['String']>
  name: InputMaybe<Scalars['String']>
  permissions: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  type: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
  users: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
}

export type EditUserInput = {
  blocked: InputMaybe<Scalars['Boolean']>
  company: InputMaybe<Scalars['String']>
  confirmationToken: InputMaybe<Scalars['String']>
  confirmed: InputMaybe<Scalars['Boolean']>
  created_by: InputMaybe<Scalars['ID']>
  email: InputMaybe<Scalars['String']>
  interest: InputMaybe<Enum_Userspermissionsuser_Interest>
  occupation: InputMaybe<Enum_Userspermissionsuser_Occupation>
  password: InputMaybe<Scalars['String']>
  provider: InputMaybe<Scalars['String']>
  resetPasswordToken: InputMaybe<Scalars['String']>
  role: InputMaybe<Scalars['ID']>
  updated_by: InputMaybe<Scalars['ID']>
  username: InputMaybe<Scalars['String']>
}

export type EditVideoInput = {
  content: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  duration: InputMaybe<Scalars['String']>
  mkto_form_id: InputMaybe<Scalars['Int']>
  panelists: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  preview_image: InputMaybe<Scalars['ID']>
  published: InputMaybe<Scalars['DateTime']>
  published_at: InputMaybe<Scalars['DateTime']>
  registration: InputMaybe<Scalars['Boolean']>
  slug: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
  videoType: InputMaybe<Scalars['String']>
}

export type EditWebinarInput = {
  content: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  eventDateTime: InputMaybe<Scalars['String']>
  eventType: InputMaybe<Scalars['String']>
  mkto_form_id: InputMaybe<Scalars['Int']>
  panelists: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  preview_image: InputMaybe<Scalars['ID']>
  published: InputMaybe<Scalars['DateTime']>
  published_at: InputMaybe<Scalars['DateTime']>
  slug: InputMaybe<Scalars['String']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type EditWebsiteTermsOfUseInput = {
  content: InputMaybe<Scalars['String']>
  created_by: InputMaybe<Scalars['ID']>
  date: InputMaybe<Scalars['String']>
  published_at: InputMaybe<Scalars['DateTime']>
  title: InputMaybe<Scalars['String']>
  updated_by: InputMaybe<Scalars['ID']>
}

export type UpdateAboutUsInput = {
  data: InputMaybe<EditAboutUsInput>
}

export type UpdateAboutUsPayload = {
  __typename?: 'updateAboutUsPayload'
  aboutUs: Maybe<AboutUs>
}

export type UpdateBackgroundColorInput = {
  data: InputMaybe<EditBackgroundColorInput>
  where: InputMaybe<InputId>
}

export type UpdateBackgroundColorPayload = {
  __typename?: 'updateBackgroundColorPayload'
  backgroundColor: Maybe<BackgroundColor>
}

export type UpdateCareerInput = {
  data: InputMaybe<EditCareerInput>
}

export type UpdateCareerPayload = {
  __typename?: 'updateCareerPayload'
  career: Maybe<Careers>
}

export type UpdateCaseStudyInput = {
  data: InputMaybe<EditCaseStudyInput>
  where: InputMaybe<InputId>
}

export type UpdateCaseStudyPayload = {
  __typename?: 'updateCaseStudyPayload'
  caseStudy: Maybe<CaseStudy>
}

export type UpdateCompanySizeInput = {
  data: InputMaybe<EditCompanySizeInput>
  where: InputMaybe<InputId>
}

export type UpdateCompanySizePayload = {
  __typename?: 'updateCompanySizePayload'
  companySize: Maybe<CompanySize>
}

export type UpdateCompetitorComparisonInput = {
  data: InputMaybe<EditCompetitorComparisonInput>
  where: InputMaybe<InputId>
}

export type UpdateCompetitorComparisonPayload = {
  __typename?: 'updateCompetitorComparisonPayload'
  competitorComparison: Maybe<CompetitorComparison>
}

export type UpdateContactSaleInput = {
  data: InputMaybe<EditContactSaleInput>
  where: InputMaybe<InputId>
}

export type UpdateContactSalePayload = {
  __typename?: 'updateContactSalePayload'
  contactSale: Maybe<ContactSale>
}

export type UpdateContactUsInput = {
  data: InputMaybe<EditContactUsInput>
  where: InputMaybe<InputId>
}

export type UpdateContactUsPayload = {
  __typename?: 'updateContactUsPayload'
  contactUs: Maybe<ContactUs>
}

export type UpdateCustomerInput = {
  data: InputMaybe<EditCustomerInput>
}

export type UpdateCustomerPayload = {
  __typename?: 'updateCustomerPayload'
  customer: Maybe<Customer>
}

export type UpdateDevOpsToolInput = {
  data: InputMaybe<EditDevOpsToolInput>
}

export type UpdateDevOpsToolPayload = {
  __typename?: 'updateDevOpsToolPayload'
  devOpsTool: Maybe<DevOpsTools>
}

export type UpdateEBookInput = {
  data: InputMaybe<EditEBookInput>
  where: InputMaybe<InputId>
}

export type UpdateEBookPayload = {
  __typename?: 'updateEBookPayload'
  eBook: Maybe<EBook>
}

export type UpdateEventInput = {
  data: InputMaybe<EditEventInput>
  where: InputMaybe<InputId>
}

export type UpdateEventPayload = {
  __typename?: 'updateEventPayload'
  event: Maybe<Event>
}

export type UpdateHarnessModuleInput = {
  data: InputMaybe<EditHarnessModuleInput>
  where: InputMaybe<InputId>
}

export type UpdateHarnessModulePayload = {
  __typename?: 'updateHarnessModulePayload'
  harnessModule: Maybe<HarnessModule>
}

export type UpdateHarnessSubscriptionInput = {
  data: InputMaybe<EditHarnessSubscriptionInput>
}

export type UpdateHarnessSubscriptionPayload = {
  __typename?: 'updateHarnessSubscriptionPayload'
  harnessSubscription: Maybe<HarnessSubscription>
}

export type UpdateHomeInput = {
  data: InputMaybe<EditHomeInput>
}

export type UpdateHomePayload = {
  __typename?: 'updateHomePayload'
  home: Maybe<Home>
}

export type UpdateIndustryInput = {
  data: InputMaybe<EditIndustryInput>
  where: InputMaybe<InputId>
}

export type UpdateIndustryPayload = {
  __typename?: 'updateIndustryPayload'
  industry: Maybe<Industry>
}

export type UpdateIntegrationInput = {
  data: InputMaybe<EditIntegrationInput>
  where: InputMaybe<InputId>
}

export type UpdateIntegrationPayload = {
  __typename?: 'updateIntegrationPayload'
  integration: Maybe<Integration>
}

export type UpdateMarketingSiteInput = {
  data: InputMaybe<EditMarketingSiteInput>
  where: InputMaybe<InputId>
}

export type UpdateMarketingSitePayload = {
  __typename?: 'updateMarketingSitePayload'
  marketingSite: Maybe<MarketingSite>
}

export type UpdateOutcomeInput = {
  data: InputMaybe<EditOutcomeInput>
  where: InputMaybe<InputId>
}

export type UpdateOutcomePayload = {
  __typename?: 'updateOutcomePayload'
  outcome: Maybe<Outcome>
}

export type UpdatePanelistInput = {
  data: InputMaybe<EditPanelistInput>
  where: InputMaybe<InputId>
}

export type UpdatePanelistPayload = {
  __typename?: 'updatePanelistPayload'
  panelist: Maybe<Panelist>
}

export type UpdatePartnerInput = {
  data: InputMaybe<EditPartnerInput>
}

export type UpdatePartnerPayload = {
  __typename?: 'updatePartnerPayload'
  partner: Maybe<Partners>
}

export type UpdatePressAndNewInput = {
  data: InputMaybe<EditPressAndNewInput>
}

export type UpdatePressAndNewPayload = {
  __typename?: 'updatePressAndNewPayload'
  pressAndNew: Maybe<PressAndNews>
}

export type UpdatePricingInput = {
  data: InputMaybe<EditPricingInput>
}

export type UpdatePricingPayload = {
  __typename?: 'updatePricingPayload'
  pricing: Maybe<Pricing>
}

export type UpdatePrivacyInput = {
  data: InputMaybe<EditPrivacyInput>
}

export type UpdatePrivacyPayload = {
  __typename?: 'updatePrivacyPayload'
  privacy: Maybe<Privacy>
}

export type UpdateProductCdInput = {
  data: InputMaybe<EditProductCdInput>
}

export type UpdateProductCdPayload = {
  __typename?: 'updateProductCdPayload'
  productCd: Maybe<ProductCd>
}

export type UpdateProductChangeIntelligenceInput = {
  data: InputMaybe<EditProductChangeIntelligenceInput>
}

export type UpdateProductChangeIntelligencePayload = {
  __typename?: 'updateProductChangeIntelligencePayload'
  productChangeIntelligence: Maybe<ProductChangeIntelligence>
}

export type UpdateProductCiInput = {
  data: InputMaybe<EditProductCiInput>
}

export type UpdateProductCiPayload = {
  __typename?: 'updateProductCiPayload'
  productCi: Maybe<ProductCi>
}

export type UpdateProductCloudCostInput = {
  data: InputMaybe<EditProductCloudCostInput>
}

export type UpdateProductCloudCostPayload = {
  __typename?: 'updateProductCloudCostPayload'
  productCloudCost: Maybe<ProductCloudCost>
}

export type UpdateProductFeatureFlagInput = {
  data: InputMaybe<EditProductFeatureFlagInput>
}

export type UpdateProductFeatureFlagPayload = {
  __typename?: 'updateProductFeatureFlagPayload'
  productFeatureFlag: Maybe<ProductFeatureFlags>
}

export type UpdateProductPlatformInput = {
  data: InputMaybe<EditProductPlatformInput>
}

export type UpdateProductPlatformPayload = {
  __typename?: 'updateProductPlatformPayload'
  productPlatform: Maybe<ProductPlatform>
}

export type UpdateRoleInput = {
  data: InputMaybe<EditRoleInput>
  where: InputMaybe<InputId>
}

export type UpdateRolePayload = {
  __typename?: 'updateRolePayload'
  role: Maybe<UsersPermissionsRole>
}

export type UpdateUserInput = {
  data: InputMaybe<EditUserInput>
  where: InputMaybe<InputId>
}

export type UpdateUserPayload = {
  __typename?: 'updateUserPayload'
  user: Maybe<UsersPermissionsUser>
}

export type UpdateVideoInput = {
  data: InputMaybe<EditVideoInput>
  where: InputMaybe<InputId>
}

export type UpdateVideoPayload = {
  __typename?: 'updateVideoPayload'
  video: Maybe<Video>
}

export type UpdateWebinarInput = {
  data: InputMaybe<EditWebinarInput>
  where: InputMaybe<InputId>
}

export type UpdateWebinarPayload = {
  __typename?: 'updateWebinarPayload'
  webinar: Maybe<Webinars>
}

export type UpdateWebsiteTermsOfUseInput = {
  data: InputMaybe<EditWebsiteTermsOfUseInput>
}

export type UpdateWebsiteTermsOfUsePayload = {
  __typename?: 'updateWebsiteTermsOfUsePayload'
  websiteTermsOfUse: Maybe<WebsiteTermsOfUse>
}
