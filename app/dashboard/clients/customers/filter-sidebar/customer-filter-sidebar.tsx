"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export enum CustomerSegment {
  Customer = "Customer",
  Supplier = "Supplier",
}

export enum CustomerCategory {
  Organisation = "Organisation",
  Individual = "Individual",
}

export enum CustomerSubCategory {
  EndUser = "End User",
  Investor = "Investor",
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

export interface CustomerFilters {
  customerSegment: string
  customerCategory: string
  customerSubCategory: string
  customerType: string[]
  customerSubType: string[]
  customerBusinessSector: string
  customerNationality: string
  customerName: string
  contactPerson: string
  emailAddress: string
  mobile1: string
  startDate: Date | undefined
  endDate: Date | undefined
}

interface CustomerFilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: CustomerFilters
  onFiltersChange: (filters: CustomerFilters) => void
}

export function CustomerFilterSidebar({ open, onOpenChange, filters, onFiltersChange }: CustomerFilterSidebarProps) {
  const handleInputChange = (field: keyof CustomerFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    })
  }

  const handleCustomerTypeChange = (value: string, checked: boolean) => {
    const currentValues = filters.customerType || []
    const updated = checked ? [...currentValues, value] : currentValues.filter((item) => item !== value)
    handleInputChange("customerType", updated)
  }

  const handleCustomerSubTypeChange = (value: string, checked: boolean) => {
    const currentValues = filters.customerSubType || []
    const updated = checked ? [...currentValues, value] : currentValues.filter((item) => item !== value)
    handleInputChange("customerSubType", updated)
  }

  const handleDateChange = (field: "startDate" | "endDate", date: Date | undefined) => {
    handleInputChange(field, date)
  }

  const clearFilters = () => {
    onFiltersChange({
      customerSegment: "",
      customerCategory: "",
      customerSubCategory: "",
      customerType: [],
      customerSubType: [],
      customerBusinessSector: "",
      customerNationality: "",
      customerName: "",
      contactPerson: "",
      emailAddress: "",
      mobile1: "",
      startDate: undefined,
      endDate: undefined,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-xl">Customer Filter</SheetTitle>
          <SheetDescription>Adjust the filters to find your customers.</SheetDescription>
        </SheetHeader>
        <div className="space-y-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              placeholder="Search customer name..."
              value={filters.customerName}
              onChange={(e) => handleInputChange("customerName", e.target.value)}
            />
          </div>
          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              placeholder="Search contact person..."
              value={filters.contactPerson}
              onChange={(e) => handleInputChange("contactPerson", e.target.value)}
            />
          </div>
          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="emailAddress">Email Address</Label>
            <Input
              id="emailAddress"
              placeholder="Search email address..."
              value={filters.emailAddress}
              onChange={(e) => handleInputChange("emailAddress", e.target.value)}
            />
          </div>
          {/* Mobile */}
          {/* <div className="space-y-2">
            <Label htmlFor="mobile1">Mobile Number</Label>
            <Input
              id="mobile1"
              placeholder="Search mobile number..."
              value={filters.mobile1}
              onChange={(e) => handleInputChange("mobile1", e.target.value)}
            />
          </div> */}
          {/* Customer Segment */}
          <div className="space-y-2">
            <Label>Customer Segment</Label>
            <Select
              value={filters.customerSegment}
              onValueChange={(value) => handleInputChange("customerSegment", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer segment" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CustomerSegment).map((segment) => (
                  <SelectItem key={segment} value={segment}>
                    {segment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Customer Category */}
          <div className="space-y-2">
            <Label>Customer Category</Label>
            <Select
              value={filters.customerCategory}
              onValueChange={(value) => handleInputChange("customerCategory", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CustomerCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Customer Sub Category */}
          <div className="space-y-2">
            <Label>Customer Sub Category</Label>
            <Select
              value={filters.customerSubCategory}
              onValueChange={(value) => handleInputChange("customerSubCategory", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer sub category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CustomerSubCategory).map((subCategory) => (
                  <SelectItem key={subCategory} value={subCategory}>
                    {subCategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Customer Type - Checkboxes */}
          <div className="space-y-3">
            <Label className="text-base">Customer Type</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {Object.values(CustomerType).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.customerType?.includes(type) || false}
                    onCheckedChange={(checked) => handleCustomerTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          {/* Customer Sub Type - Checkboxes */}
          <div className="space-y-3">
            <Label className="text-base">Customer Sub Type</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {Object.values(CustomerSubType).map((subType) => (
                <div key={subType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subtype-${subType}`}
                    checked={filters.customerSubType?.includes(subType) || false}
                    onCheckedChange={(checked) => handleCustomerSubTypeChange(subType, checked as boolean)}
                  />
                  <Label htmlFor={`subtype-${subType}`} className="text-sm font-normal">
                    {subType}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          {/* Customer Business Sector */}
          <div className="space-y-2">
            <Label>Business Sector</Label>
            <Select
              value={filters.customerBusinessSector}
              onValueChange={(value) => handleInputChange("customerBusinessSector", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business sector" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {Object.values(customerBusinessSector).map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Customer Nationality */}
          <div className="space-y-2">
            <Label>Nationality</Label>
            <Select
              value={filters.customerNationality}
              onValueChange={(value) => handleInputChange("customerNationality", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {Object.values(CustomerNationality).map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>
                    {nationality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          {/* Date Filters */}
          <Separator />
          {/* Clear Filters Button */}
          <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
