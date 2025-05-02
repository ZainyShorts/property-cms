import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { 
  setmasterDevelopment,
  setsubDevelopment,
  setPropertyType,
  setProjectName,
  setProjectQuality,
  setConstructionStatus,
  setFacilitiesCategories,
  setAmentiesCategories,
  setLaunchDate,
  setCompletionDate,
  setSaleStatus,
  setpercentOfConstruction
} from "@/lib/store/slices/projectSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

enum PropertyType {
  Apartment = 'Apartment',
  Shops = 'Shops',
  Offices = 'Offices',
  Hotel = 'Hotel',
  Townhouse = 'Townhouse',
  Villas = 'Villas',
  Mansions = 'Mansions',
  Showroom = 'Showroom',
  Warehouse = 'Warehouse',
  LabourCamp = 'Labour Camp',
  Hospital = 'Hospital',
  School = 'School',
  Bungalow = 'Bungalow',
}

enum SaleStatus {
  PRIMARY = 'Primary',
  OFF_PLANN_RESALE = 'Off Plan Resale',
  RESALE = 'Resale',
}

const facilitiesCategoriesOptions = [
  "Shops",
  "School",
  "Petrol Pump",
  "Hospitals",
  "Clinics",
  "Malls",
  "Public Transport"
];

const amenitiesCategoriesOptions = [
  "Gym",
  "Swimming Pool",
  "Sauna",
  "Steam Room",
  "Yoga Room",
  "Aerobics Studio",
  "Jogging / walking tracks",
  "Tennis Court",
  "Badminton Court",
  "Basketball Court",
  "Cricket Ground",
  "Table Tennis",
  "Billiards",
  "Clubhouse",
  "Dance Studio",
  "Mini Golf",
  "Padel Tennis",
  "Landscaped Garden",
  "Park",
  "Playground",
  "Picnic Area",
  "Barbecue / grill stations",
  "Pet Park",
  "Water Park",
  "Roof gardens, Sky Decks",
  "Community farming, Garden plots",
  "Children Play Area",
  "Daycare / Nursery",
  "Kids Pool",
  "Teen lounge / Game zone",
  "Education center / Library",
  "Grocery",
  "ATM / Bank Kios",
  "Café / Restaurant/ Food Court",
  "Laundry",
  "Business Center",
  "Lockers",
  "Concierge / Help Desk",
  "Covered Parking",
  "Visitor Parking",
  "EV Charging Station",
  "Bicycle racks / storage",
  "Shuttle Service / Transport access",
  "24/7 Security",
  "CCTV Surveillance",
  "Gated Access",
  "Intercom system",
  "Fire Safety Systems",
  "Rainwater Harvesting",
  "Solar Panels",
  "Smart Home Features",
  "Banquet Hall",
  "Private theater / Mini cinema",
  "Amphitheater",
  "Music Room / Jamming studio",
  "Karaoke Room",
  "Lounge / Rooftop Bar",
  "Hobby Room",
  "Community Kitchen",
  "Book café or Reading Lounge",
  "On-call medical services / Nurse station",
  "Prayer Hall",
  "Handyman on-call services",
  "Pest control & Fumigation Support",
  "Green Building Certification",
  "Community Recycling Points"
];

const projectQualityOptions = ["A", "B", "C"];

export function FilterSidebar({ open, onOpenChange }: FilterSidebarProps) {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.projectFilter);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "masterDevelopment":
        dispatch(setmasterDevelopment(value));
        break;
      case "subDevelopment":
        dispatch(setsubDevelopment(value));
        break;
      case "projectName":
        dispatch(setProjectName(value));
        break;
      case "constructionStatus":
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
          dispatch(setConstructionStatus(numValue));
        }
        break;
      case "percentOfConstruction":
        const percent = parseInt(value);
        if (!isNaN(percent) && percent >= 0 && percent <= 100) {
          dispatch(setpercentOfConstruction(percent));
        }
        break;
    }
  };

  const handlePropertyTypeChange = (value: PropertyType) => {
    dispatch(setPropertyType(value));
  };

  const handleSaleStatusChange = (value: SaleStatus) => {
    dispatch(setSaleStatus(value));
  };

  const handleProjectQualityChange = (value: string) => {
    dispatch(setProjectQuality(value));
  };

  const handleLaunchDateChange = (date: Date | undefined) => {
    dispatch(setLaunchDate(date ? format(date, 'yyyy-MM-dd') : ''));
  };

  const handleCompletionDateChange = (date: Date | undefined) => {
    dispatch(setCompletionDate(date ? format(date, 'yyyy-MM-dd') : ''));
  };

  const handleCheckboxChange = (
    category: "facilitiesCategories" | "amentiesCategories",
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[category] || [];
    const updated = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);

    if (category === "facilitiesCategories") {
      dispatch(setFacilitiesCategories(updated));
    } else {
      dispatch(setAmentiesCategories(updated));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-xl">Project Filter</SheetTitle>
          <SheetDescription>Adjust the filters to find your perfect project.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Master Development */}
          <div className="space-y-2">
            <Label htmlFor="masterDevelopment">Master Development</Label>
            <Input
              id="masterDevelopment"
              name="masterDevelopment"
              placeholder="Enter master development"
              value={filters.masterDevelopment}
              onChange={handleInputChange}
            />
          </div>

          {/* Sub Development */}
          <div className="space-y-2">
            <Label htmlFor="subDevelopment">Sub Development</Label>
            <Input
              id="subDevelopment"
              name="subDevelopment"
              placeholder="Enter sub development"
              value={filters.subDevelopment}
              onChange={handleInputChange}
            />
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select
              value={filters.propertyType || ""}
              onValueChange={handlePropertyTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PropertyType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sale Status */}
          <div className="space-y-2">
            <Label>Sale Status</Label>
            <Select
              value={filters.saleStatus || ""}
              onValueChange={handleSaleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sale status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SaleStatus).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              name="projectName"
              placeholder="Enter project name"
              value={filters.projectName}
              onChange={handleInputChange}
            />
          </div>

          {/* Project Quality */}
          <div className="space-y-2">
            <Label>Project Quality</Label>
            <Select
              value={filters.projectQuality || ""}
              onValueChange={handleProjectQualityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project quality" />
              </SelectTrigger>
              <SelectContent>
                {projectQualityOptions.map((quality) => (
                  <SelectItem key={quality} value={quality}>
                    {quality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Construction Status */}
          <div className="space-y-2">
            <Label htmlFor="constructionStatus">Construction Status</Label>
            <Input
              id="constructionStatus"
              name="constructionStatus"
              type="number"
              min="0"
              placeholder="Enter construction status"
              value={filters.constructionStatus}
              onChange={handleInputChange}
            />
          </div>

          {/* Percent of Construction */}
          <div className="space-y-2">
            <Label htmlFor="percentOfConstruction">Percent of Construction</Label>
            <Input
              id="percentOfConstruction"
              name="percentOfConstruction"
              type="number"
              min="0"
              max="100"
              placeholder="Enter percent of construction"
              value={filters.percentOfConstruction}
              onChange={handleInputChange}
            />
          </div>

          {/* Launch Date */}
          <div className="space-y-2">
            <Label>Launch Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.launchDate ? format(new Date(filters.launchDate), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.launchDate ? new Date(filters.launchDate) : undefined}
                  onSelect={handleLaunchDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Completion Date */}
          <div className="space-y-2">
            <Label>Completion Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.completionDate ? format(new Date(filters.completionDate), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.completionDate ? new Date(filters.completionDate) : undefined}
                  onSelect={handleCompletionDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          {/* Facilities Categories */}
          <div className="space-y-3">
            <Label className="text-base">Facilities Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {facilitiesCategoriesOptions.map((facility) => (
                <div key={facility} className="flex items-center space-x-2">
                  <Checkbox
                    id={`facility-${facility}`}
                    checked={filters.facilitiesCategories?.includes(facility) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("facilitiesCategories", facility, checked as boolean)
                    }
                  />
                  <Label htmlFor={`facility-${facility}`} className="text-sm font-normal">
                    {facility}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities Categories */}
          <div className="space-y-3">
            <Label className="text-base">Amenities Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesCategoriesOptions.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={filters.amentiesCategories?.includes(amenity) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("amentiesCategories", amenity, checked as boolean)
                    }
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}