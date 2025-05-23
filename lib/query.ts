import { gql } from "@apollo/client"

export const GET_PROPERTIES = gql`
  query getProperties( 
    $filter: PropertyFilterInput
    $sortBy: String
    $sortOrder: String      
    $limit : String 
    $page : String
  ) {
    getProperties( 
      filter: $filter
      sortBy: $sortBy
      sortOrder: $sortOrder  
      limit : $limit 
      page : $page
    ) { 
    data {
    _id 
    roadLocation
    developmentName
    subDevelopmentName
    projectName
    propertyType
    propertyHeight
    projectLocation
    unitNumber
    bedrooms
    unitLandSize
    unitBua
    unitLocation
    unitView
    propertyImages
    Purpose
    vacancyStatus
    primaryPrice
    resalePrice
    premiumAndLoss
    Rent
    noOfCheques
    listed
    createdAt  
    }
    totalPages 
    pageNumber 
    totalCount
    } 

  }
`


export const GET_PROPERTY = gql`
  query getProperty($docId: String!){
    getProperty(docId:$docId){
      _id 
    roadLocation
    developmentName
    subDevelopmentName
    projectName
    propertyType
    propertyHeight
    projectLocation
    unitNumber
    bedrooms
    unitLandSize
    unitBua
    unitLocation
    unitView
    propertyImages
    Purpose
    vacancyStatus
    primaryPrice
    resalePrice
    premiumAndLoss
    Rent
    noOfCheques
    listed
    createdAt
    }
  }
`

