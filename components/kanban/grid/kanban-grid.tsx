// 'use client'

// export function PropertyGrid({ properties }: { properties: any[] }) {
//   // Group properties by status dynamically
//   const groupedProperties = properties.reduce((acc: any, property: any) => {
//     const status = property.status || "Other"
//     if (!acc[status]) {
//       acc[status] = []
//     }
//     acc[status].push(property)
//     return acc
//   }, {})

//   return (
//     <div className="grid gap-8">
//       {Object.entries(groupedProperties).map(([status, items]: [string, any]) => (
//         <section key={status} className="space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
//               {status}
//             </h2>
//             <span className="text-sm text-muted-foreground">{(items as any[]).length} properties</span>
//           </div>
//           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
//             {(items as any[]).map((property: any, index: number) => (
//               <PropertyCard key={property.id || index} property={property} />
//             ))}
//           </div>
//         </section>
//       ))}
//     </div>
//   )
// }

