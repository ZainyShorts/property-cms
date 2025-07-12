"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-toastify"
import axios from "axios"
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Customer enums
enum CustomerSegment {
  Supplier = "Supplier",
  Customer = "Customer",
}

enum CustomerCategory {
  Individual = "Individual",
  Organisation = "Organisation",
}

enum CustomerSubCategory {
  Investor = "Investor",
  EndUser = "End User",
}

enum CustomerType {
  Seller = "Seller",
  TenantLongTerm = "Tenant-Long Term",
  TenantShortTerm = "Tenant-Short Term",
  Buyer = "Buyer",
  ProspectBuyer = "Prospect Buyer",
  PropertyOwner = "Property Owner",
  SubLease = "Sub-Lease",
  Landlord = "Landlord",
  Underwriter = "Underwriter",
  ShortTermTrader = "Short Term Trader",
}

enum CustomerSubType {
  MasterDeveloper = "Master Developer",
  SubDeveloper = "Sub-Developer",
  RealEstateInvestor = "Real Estate Investor",
  RealEstateBroker = "Real Estate Broker",
  PropertyManagement = "Property Management",
  Banks = "Banks",
  Auction = "Auction",
  Contractor = "Contractor",
  ArchitectConsultant = "Architect-Consultant",
  REIT = "REIT",
  PrivateInvestor = "Private Investor",
}

enum customerBusinessSector {
  RealEstateInvestmentAndDevelopment = "Real Estate Investment & Development",
  AgricultureForestryAndFishing = "Agriculture, Forestry & Fishing",
  MiningAndExtraction = "Mining & Extraction",
  Manufacturing = "Manufacturing",
  ConstructionAndRealEstate = "Construction & Real Estate",
  WholesaleAndRetailTrade = "Wholesale & Retail Trade",
  TransportationAndLogistics = "Transportation & Logistics",
  InformationTechnologyAndTelecommunications = "Information Technology & Telecommunications",
  FinancialServices = "Financial Services",
  ProfessionalScientificAndTechnicalServices = "Professional, Scientific & Technical Services",
  HealthcareAndSocialAssistance = "Healthcare & Social Assistance",
  Education = "Education",
  ArtsEntertainmentAndRecreation = "Arts, Entertainment & Recreation",
  AccommodationAndFoodServices = "Accommodation & Food Services",
  PublicAdministrationAndDefense = "Public Administration & Defense",
  Utilities = "Utilities",
  PersonalAndOtherServices = "Personal & Other Services",
  EnvironmentalServicesAndRenewableEnergy = "Environmental Services & Renewable Energy",
  MediaAndPublishing = "Media & Publishing",
  ChemicalsAndPetrochemicals = "Chemicals & Petrochemicals",
  AerospaceDefenseManufacturing = "Aerospace & Defense Manufacturing",
  Automotive = "Automotive",
  BiotechnologyLifeSciences = "Biotechnology & Life Sciences",
  EcommerceDigitalTrade = "E-commerce & Digital Trade",
  TelecommunicationsServices = "Telecommunications Services",
  LogisticsTechnologySupplyChain = "Logistics Technology & Supply Chain",
  HospitalityTourism = "Hospitality & Tourism",
  TextileApparel = "Textile & Apparel",
  Pharmaceuticals = "Pharmaceuticals",
  RenewableEnergy = "Renewable Energy",
  AdvertisingMarketing = "Advertising & Marketing",
  AerospaceAviationServices = "Aerospace & Aviation Services",
  AutomotiveServicesRepair = "Automotive Services & Repair",
  BankingFinancialInstitutions = "Banking & Financial Institutions",
  BeautyPersonalCare = "Beauty & Personal Care",
  ChemicalsManufacturing = "Chemicals Manufacturing",
  ConsumerElectronics = "Consumer Electronics",
  DataCentersCloudInfrastructure = "Data Centers & Cloud Infrastructure",
  DefenseSecurity = "Defense & Security",
  DigitalMediaContentCreation = "Digital Media & Content Creation",
  EducationTechnology = "Education Technology (EdTech)",
  EnergyEquipmentServices = "Energy Equipment & Services",
  EnvironmentalTechnologyConsulting = "Environmental Technology & Consulting",
  FilmVideoProduction = "Film & Video Production",
  FoodBeverageProcessing = "Food & Beverage Processing",
  GamblingGaming = "Gambling & Gaming",
  HealthcareEquipmentSupplies = "Healthcare Equipment & Supplies",
  HumanResourcesRecruitment = "Human Resources & Recruitment",
  IndustrialAutomation = "Industrial Automation",
  Insurance = "Insurance",
  LegalServices = "Legal Services",
  MarineOffshoreServices = "Marine & Offshore Services",
  MediaBroadcasting = "Media & Broadcasting",
  MetalsMiningEquipment = "Metals & Mining Equipment",
  NonProfitNGOs = "Non-Profit & NGOs",
  PrintingPublishing = "Printing & Publishing",
  ProfessionalTrainingCoaching = "Professional Training & Coaching",
  PublicRelations = "Public Relations",
  SoftwareDevelopment = "Software Development",
  SportsRecreation = "Sports & Recreation",
  TourismTravelServices = "Tourism & Travel Services",
  TradeExportServices = "Trade & Export Services",
  WasteManagementRecycling = "Waste Management & Recycling",
  WaterSupplyTreatment = "Water Supply & Treatment",
  WholesaleDistribution = "Wholesale Distribution",
  WoodPaperProducts = "Wood & Paper Products",
  SecurityServices = "Security Services",
  ShippingMaritimeServices = "Shipping & Maritime Services",
  SoftwareAsAService = "Software as a Service (SaaS)",
  VentureCapitalPrivateEquity = "Venture Capital & Private Equity",
  VideoGameDevelopment = "Video Game Development",
  VirtualRealityAugmentedReality = "Virtual Reality & Augmented Reality",
  WarehouseInventoryManagement = "Warehouse & Inventory Management",
  WebDevelopmentDesign = "Web Development & Design",
  WindEnergy = "Wind Energy",
  YachtMarineEquipmentManufacturing = "Yacht & Marine Equipment Manufacturing",
  ZoologicalParksAquariums = "Zoological Parks & Aquariums",
  ZeroWasteCircularEconomy = "Zero Waste & Circular Economy",
  ThreeDPrintingServices = "3D Printing Services",
  AcademicResearch = "Academic Research",
  AdventureTourism = "Adventure Tourism",
  AgriculturalEquipmentManufacturing = "Agricultural Equipment Manufacturing",
  AirConditioningHVAC = "Air Conditioning & HVAC",
  AnimalHealthVeterinaryServices = "Animal Health & Veterinary Services",
  ArtDealersGalleries = "Art Dealers & Galleries",
  AuctionHouses = "Auction Houses",
  AutoRepairMaintenance = "Auto Repair & Maintenance",
  AviationServices = "Aviation Services",
  BabyProductsServices = "Baby Products & Services",
  BlockchainServices = "Blockchain Services",
  BoatManufacturingServices = "Boat Manufacturing & Services",
  BookPublishing = "Book Publishing",
  BuildingMaterials = "Building Materials",
  BusinessIntelligenceAnalytics = "Business Intelligence & Analytics",
  CarDealershipsLeasing = "Car Dealerships & Leasing",
  CharityFundraising = "Charity & Fundraising",
  ChildcareServices = "Childcare Services",
  CleaningServices = "Cleaning Services",
  CoachingPersonalDevelopment = "Coaching & Personal Development",
  CommercialCleaningServices = "Commercial Cleaning Services",
  CommercialRealEstate = "Commercial Real Estate",
  ComputerHardwareManufacturing = "Computer Hardware Manufacturing",
  ConsultingServices = "Consulting Services",
  ConsumerGoodsManufacturing = "Consumer Goods Manufacturing",
  CorporateTrainingDevelopment = "Corporate Training & Development",
  CourierDeliveryServices = "Courier & Delivery Services",
  DataAnalyticsBusinessIntelligence = "Data Analytics & Business Intelligence",
  DefenseContracting = "Defense Contracting",
  DigitalContentCreation = "Digital Content Creation",
  EcommercePlatforms = "E-commerce Platforms",
  EducationalSoftwareTools = "Educational Software & Tools",
  ElectricalContracting = "Electrical Contracting",
  ElectronicsManufacturingServices = "Electronics Manufacturing Services",
  EnergyTrading = "Energy Trading",
  EnvironmentalEngineering = "Environmental Engineering",
  EventPlanningManagement = "Event Planning & Management",
  FashionRetail = "Fashion Retail",
  FinancialTechnologyFinTech = "Financial Technology (FinTech)",
  FilmTVProduction = "Film & TV Production",
  FoodProcessingPackaging = "Food Processing & Packaging",
  FreightShippingServices = "Freight & Shipping Services",
  FurnitureManufacturing = "Furniture Manufacturing",
  GamingIndustry = "Gaming Industry",
  GeneralMerchandiseRetail = "General Merchandise Retail",
  GraphicDesignServices = "Graphic Design Services",
  HealthWellnessServices = "Health & Wellness Services",
  HigherEducation = "Higher Education",
  HospitalityEventServices = "Hospitality & Event Services",
  HouseholdAppliancesManufacturing = "Household Appliances Manufacturing",
  HVACServices = "HVAC Services",
  ImportExportServices = "Import & Export Services",
  IndustrialEquipmentManufacturing = "Industrial Equipment Manufacturing",
  InformationServices = "Information Services",
  InsuranceBrokerage = "Insurance Brokerage",
  InteriorDesign = "Interior Design",
  InvestmentServices = "Investment Services",
  ITHardwareNetworking = "IT Hardware & Networking",
  JewelryLuxuryGoods = "Jewelry & Luxury Goods",
  JournalismNewsMedia = "Journalism & News Media",
}

enum CustomerNationality {
  Afghanistan = "Afghanistan",
  Albania = "Albania",
  Algeria = "Algeria",
  Andorra = "Andorra",
  Angola = "Angola",
  AntiguaAndBarbuda = "Antigua and Barbuda",
  Argentina = "Argentina",
  Armenia = "Armenia",
  Australia = "Australia",
  Austria = "Austria",
  Azerbaijan = "Azerbaijan",
  Bahamas = "Bahamas",
  Bahrain = "Bahrain",
  Bangladesh = "Bangladesh",
  Barbados = "Barbados",
  Belarus = "Belarus",
  Belgium = "Belgium",
  Belize = "Belize",
  Benin = "Benin",
  Bhutan = "Bhutan",
  Bolivia = "Bolivia",
  BosniaAndHerzegovina = "Bosnia and Herzegovina",
  Botswana = "Botswana",
  Brazil = "Brazil",
  Brunei = "Brunei",
  Bulgaria = "Bulgaria",
  BurkinaFaso = "Burkina Faso",
  Burundi = "Burundi",
  CaboVerde = "Cabo Verde",
  Cambodia = "Cambodia",
  Cameroon = "Cameroon",
  Canada = "Canada",
  CentralAfricanRepublic = "Central African Republic",
  Chad = "Chad",
  Chile = "Chile",
  China = "China",
  Colombia = "Colombia",
  Comoros = "Comoros",
  CongoBrazzaville = "Congo (Congo-Brazzaville)",
  CostaRica = "Costa Rica",
  Croatia = "Croatia",
  Cuba = "Cuba",
  Cyprus = "Cyprus",
  Czechia = "Czechia (Czech Republic)",
  DRofCongo = "Democratic Republic of the Congo",
  Denmark = "Denmark",
  Djibouti = "Djibouti",
  Dominica = "Dominica",
  DominicanRepublic = "Dominican Republic",
  EastTimor = "East Timor (Timor-Leste)",
  Ecuador = "Ecuador",
  Egypt = "Egypt",
  ElSalvador = "El Salvador",
  EquatorialGuinea = "Equatorial Guinea",
  Eritrea = "Eritrea",
  Estonia = "Estonia",
  Eswatini = "Eswatini",
  Ethiopia = "Ethiopia",
  Fiji = "Fiji",
  Finland = "Finland",
  France = "France",
  Gabon = "Gabon",
  Gambia = "Gambia",
  Georgia = "Georgia",
  Germany = "Germany",
  Ghana = "Ghana",
  Greece = "Greece",
  Grenada = "Grenada",
  Guatemala = "Guatemala",
  Guinea = "Guinea",
  GuineaBissau = "Guinea-Bissau",
  Guyana = "Guyana",
  Haiti = "Haiti",
  Honduras = "Honduras",
  Hungary = "Hungary",
  Iceland = "Iceland",
  India = "India",
  Indonesia = "Indonesia",
  Iran = "Iran",
  Iraq = "Iraq",
  Ireland = "Ireland",
  Israel = "Israel",
  Italy = "Italy",
  IvoryCoast = "Ivory Coast",
  Jamaica = "Jamaica",
  Japan = "Japan",
  Jordan = "Jordan",
  Kazakhstan = "Kazakhstan",
  Kenya = "Kenya",
  Kiribati = "Kiribati",
  KoreaNorth = "Korea, North",
  KoreaSouth = "Korea, South",
  Kosovo = "Kosovo",
  Kuwait = "Kuwait",
  Kyrgyzstan = "Kyrgyzstan",
  Laos = "Laos",
  Latvia = "Latvia",
  Lebanon = "Lebanon",
  Lesotho = "Lesotho",
  Liberia = "Liberia",
  Libya = "Libya",
  Liechtenstein = "Liechtenstein",
  Lithuania = "Lithuania",
  Luxembourg = "Luxembourg",
  Madagascar = "Madagascar",
  Malawi = "Malawi",
  Malaysia = "Malaysia",
  Maldives = "Maldives",
  Mali = "Mali",
  MarshallIslands = "Marshall Islands",
  Mauritania = "Mauritania",
  Mauritius = "Mauritius",
  Mexico = "Mexico",
  Micronesia = "Micronesia",
  Moldova = "Moldova",
  Monaco = "Monaco",
  Mongolia = "Mongolia",
  Montenegro = "Montenegro",
  Morocco = "Morocco",
  Mozambique = "Mozambique",
  Myanmar = "Myanmar (Burma)",
  Namibia = "Namibia",
  Nauru = "Nauru",
  Nepal = "Nepal",
  Netherlands = "Netherlands",
  NewZealand = "New Zealand",
  Nicaragua = "Nicaragua",
  Niger = "Niger",
  Nigeria = "Nigeria",
  NorthMacedonia = "North Macedonia",
  Norway = "Norway",
  Oman = "Oman",
  Pakistan = "Pakistan",
  Palau = "Palau",
  Panama = "Panama",
  PapuaNewGuinea = "Papua New Guinea",
  Paraguay = "Paraguay",
  Peru = "Peru",
  Philippines = "Philippines",
  Poland = "Poland",
  Portugal = "Portugal",
  Qatar = "Qatar",
  Romania = "Romania",
  Russia = "Russia",
  Rwanda = "Rwanda",
  SaintKittsAndNevis = "Saint Kitts and Nevis",
  SaintLucia = "Saint Lucia",
  SaintVincentAndTheGrenadines = "Saint Vincent and the Grenadines",
  Samoa = "Samoa",
  SanMarino = "San Marino",
  SaoTomeAndPrincipe = "Sao Tome and Principe",
  SaudiArabia = "Saudi Arabia",
  Senegal = "Senegal",
  Serbia = "Serbia",
  Seychelles = "Seychelles",
  SierraLeone = "Sierra Leone",
  Singapore = "Singapore",
  Slovakia = "Slovakia",
  Slovenia = "Slovenia",
  SolomonIslands = "Solomon Islands",
  Somalia = "Somalia",
  SouthAfrica = "South Africa",
  SouthSudan = "South Sudan",
  Spain = "Spain",
  SriLanka = "Sri Lanka",
  Sudan = "Sudan",
  Suriname = "Suriname",
  Sweden = "Sweden",
  Switzerland = "Switzerland",
  Syria = "Syria",
  Taiwan = "Taiwan",
  Tajikistan = "Tajikistan",
  Tanzania = "Tanzania",
  Thailand = "Thailand",
  Togo = "Togo",
  Tonga = "Tonga",
  TrinidadAndTobago = "Trinidad and Tobago",
  Tunisia = "Tunisia",
  Turkey = "Turkey",
  Turkmenistan = "Turkmenistan",
  Tuvalu = "Tuvalu",
  Uganda = "Uganda",
  Ukraine = "Ukraine",
  UnitedArabEmirates = "United Arab Emirates",
  UnitedKingdom = "United Kingdom",
  UnitedStates = "United States",
  Uruguay = "Uruguay",
  Uzbekistan = "Uzbekistan",
  Vanuatu = "Vanuatu",
  VaticanCity = "Vatican City",
  Venezuela = "Venezuela",
  Vietnam = "Vietnam",
  Yemen = "Yemen",
  Zambia = "Zambia",
  Zimbabwe = "Zimbabwe",
}

// Define Customer interface
interface Customer {
  _id?: string
  customerSegment: string
  customerCategory: string
  customerSubCategory: string
  customerType: string
  customerSubType: string
  customerBusinessSector: string
  customerNationality: string
  customerName: string
  contactPerson: string
  customerDepartment?: string
  customerDesignation?: string
  tellDirect?: string 
  telOffice? :string
  mobile1?: string
  mobile2?: string
  webAddress?: string
  officeLocation?: string
}

const formSchema = z.object({
  customerSegment: z.string().min(1, "Customer segment is required"),
  customerCategory: z.string().min(1, "Customer category is required"),
  customerSubCategory: z.string().min(1, "Customer sub-category is required"),
  customerType: z.string().min(1, "Customer type is required"),
  customerSubType: z.string().min(1, "Customer sub-type is required"),
  customerBusinessSector: z.string().min(1, "Customer Business Sector  is required"),
  customerNationality:z.string().min(1, "Customer Nationality is required"),
  customerName: z.string().min(1, "Customer Name is required"),
  contactPerson: z.string().min(1, "Contact Person Name is required"),
  customerDepartment: z.string().optional(),
  customerDesignation: z.string().optional(),
  tellDirect: z.string().optional(), 
  telOffice: z.string().optional(),
  mobile1: z.string().optional(),
  mobile2: z.string().optional(),
  webAddress: z.string().optional(),
  officeLocation: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddCustomerModalProps {
  setIsModalOpen: (open: boolean) => void
  editRecord?: Customer | null
  onRecordSaved?: () => void
}

// Define empty form values
const emptyFormValues: FormValues = {
  customerSegment: "",
  customerCategory: "",
  customerSubCategory: "",
  customerType: "",
  customerSubType: "",
  customerBusinessSector: "",
  customerNationality: "",
  customerName: "",
  contactPerson: "",
  customerDepartment: "",
  customerDesignation: "",
  tellDirect: "", 
  telOffice: "",
  mobile1: "",
  mobile2: "",
  webAddress: "",
  officeLocation: "",
}

export function AddCustomerModal({ setIsModalOpen, editRecord = null, onRecordSaved }: AddCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!editRecord
  const { data: authData } = useSWR("/api/me", fetcher)

  // Initialize form with empty values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyFormValues,
  })

  // Reset form when edit mode changes
  useEffect(() => {
    if (isEditMode && editRecord) {
      form.reset({
        customerSegment: editRecord.customerSegment || "",
        customerCategory: editRecord.customerCategory || "",
        customerSubCategory: editRecord.customerSubCategory || "",
        customerType: editRecord.customerType || "",
        customerSubType: editRecord.customerSubType || "",
        customerBusinessSector: editRecord.customerBusinessSector || "",
        customerNationality: editRecord.customerNationality || "",
        customerName: editRecord.customerName || "",
        contactPerson: editRecord.contactPerson || "",
        customerDepartment: editRecord.customerDepartment || "",
        customerDesignation: editRecord.customerDesignation || "",
        tellDirect: editRecord.tellDirect || "", 
        telOffice : editRecord.telOffice || "",
        mobile1: editRecord.mobile1 || "",
        mobile2: editRecord.mobile2 || "",
        webAddress: editRecord.webAddress || "",
        officeLocation: editRecord.officeLocation || "",
      })
    } else {
      // Reset to empty values for add mode
      form.reset(emptyFormValues)
    }
  }, [editRecord, form, isEditMode])

  // Cleanup effect to reset form when component unmounts
  useEffect(() => {
    return () => {
      // Reset form to empty values
      form.reset(emptyFormValues)
    }
  }, [form])

  const handleCheckChangedFields = () => {
    const currentValues = form.getValues()
    const changedFields: Record<string, any> = {}
    Object.entries(currentValues).forEach(([key, value]) => {
      const editValue = editRecord?.[key as keyof typeof editRecord]
      if (value !== editValue) {
        changedFields[key] = value
      }
    })
    return changedFields
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditMode && editRecord) {
        const changedFields = handleCheckChangedFields()
        if (Object.keys(changedFields).length === 0) {
          toast.info("No changes detected")
        } else {
          const response = await axios.put(
            `${process.env.NEXT_PUBLIC_CMS_SERVER}/customer/${editRecord._id}`,
            changedFields,
            {
              headers: {
                Authorization: `Bearer ${authData?.token}`,
              },
            },
          )
          toast.success("Customer record has been updated successfully")
        }
      } else {
        console.log(data)
        const response = await axios.post(`${process.env.NEXT_PUBLIC_CMS_SERVER}/customer`, data, {
          headers: {
            Authorization: `Bearer ${authData?.token}`,
          },
        })
        console.log('response added',response)
        toast.success("Customer record has been added successfully")
      }
      // Reset form after successful submission
      if (!isEditMode) {
        form.reset(emptyFormValues)
      }
      if (onRecordSaved) {
        onRecordSaved()
      }
      setIsModalOpen(false)
    } catch (error: any) {
      console.error("Error submitting form:", error)
      // Show specific error message from server response
      const errorMessage = error?.response?.data?.message || error?.response?.message || error?.message
      if (error.response?.status === 400) {
        toast.error(errorMessage || "Bad Request: Please check your input data")
      } else if (error.response?.status === 504) {
        toast.error(errorMessage || "Request timed out. Please try again.")
      } else {
        toast.error(errorMessage || `Failed to ${isEditMode ? "update" : "add"} record. Please try again.`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">{isEditMode ? "Edit Customer" : "Add Customer"}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Required Dropdown Fields */}
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Required Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customerSegment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Segment *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerSegment).map((segment) => (
                          <SelectItem key={segment} value={segment}>
                            {segment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerSubCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Sub-Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerSubCategory).map((subCategory) => (
                          <SelectItem key={subCategory} value={subCategory}>
                            {subCategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />   
              <FormField
                control={form.control}
                name="customerSubType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Sub-Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerSubType).map((subType) => (
                          <SelectItem key={subType} value={subType}>
                            {subType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} 
                
              />
              <FormField
                control={form.control}
                name="customerBusinessSector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Sector</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {Object.values(customerBusinessSector).map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerNationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {Object.values(CustomerNationality).map((nationality) => (
                          <SelectItem key={nationality} value={nationality}>
                            {nationality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} 
                /> 
                 <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact person name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
            </div>
          </div>
          {/* Optional Fields */}
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Additional Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
             
              <FormField
                control={form.control}
                name="customerDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sales, Marketing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerDesignation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Manager, Director" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tellDirect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tell Direct</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +971-4-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> 
              <FormField
                control={form.control}
                name="telOffice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tell Office</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +971-4-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile 1</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +971-50-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile 2</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +971-55-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="webAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. www.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="officeLocation"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Office Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full office address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                // Reset form when modal is closed
                if (!isEditMode) {
                  form.reset(emptyFormValues)
                }
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {isSubmitting ? "Submitting..." : isEditMode ? "Update Record" : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
