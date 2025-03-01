"use client"

import { gql, useQuery } from "@apollo/client"
import { useState, useEffect } from "react"
import { ApolloProvider } from "@/lib/ApolloPovider"

const GET_PROPERTIES = gql`
  query getProperties( $sortBy: String, $sortOrder: String,  $limit: String) {
    getProperties( sortBy: $sortBy, sortOrder: $sortOrder, limit: $limit) {
      _id
      roadLocation
      developmentName
      subDevelopmentName
      projectName
      propertyType
      projectLocation
      unitNumber
      bedrooms
      unitLocation
      vacancyStatus
      listed
      primaryPrice
      resalePrice
      Rent
      createdAt
      unitView
    }
  }
`

function PropertyList() {
  const { loading, error, data, refetch } = useQuery(GET_PROPERTIES, {
    variables: {
      sortBy: "createdAt",
      sortOrder: "asc", 
      limit: 10,
    },
  })

  useEffect(() => {
    // Refetch when the page changes
    refetch()
  }, [ data,refetch , loading ])

  

  if (loading) return <p>Loading...</p>
  if (error) {
    console.error("GraphQL Error:", error)
    return <p>Error: {error.message}</p>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Property List</h1>
      {data && data.getProperties ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.getProperties.map((property: any) => (
              <div key={property._id} className="border p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold">{property.projectName}</h2>
                <p>Location: {property.roadLocation}</p>
                <p>Type: {property.propertyType}</p>
                <p>Bedrooms: {property.bedrooms}</p>
                <p>Price: ${property.primaryPrice}</p>
                <p>Status: {property.vacancyStatus}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
      
          </div>
        </>
      ) : (
        <p>No properties found</p>
      )}
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <ApolloProvider>
      <PropertyList />
    </ApolloProvider>
  )
}

