export const locationDetails = ["_id","roadLocation", "developmentName" , "locationQuality"] 
export const overview =  ["buaAreaSqFt", "facilitiesAreaSqFt","amentiesAreaSqFt","totalAreaSqFt"] 
export const facilities = ["facilitiesCategories", "amentiesCategories"] 
export interface CountryData {
    id: string;
    name: string;
    cities: CityData[];
  }
  
  export interface CityData {
    id: string;
    name: string;
  }
  
  export const countries: CountryData[] = [
    // Middle East
    {
      id: "ae",
      name: "United Arab Emirates",
      cities: [
        { id: "dxb", name: "Dubai" },
        { id: "auh", name: "Abu Dhabi" },
        { id: "shj", name: "Sharjah" },
        { id: "ajn", name: "Ajman" },
        { id: "rak", name: "Ras Al Khaimah" },
        { id: "fuj", name: "Fujairah" },
        { id: "uaq", name: "Umm Al Quwain" }
      ]
    },
    {
      id: "sa",
      name: "Saudi Arabia",
      cities: [
        { id: "ruh", name: "Riyadh" },
        { id: "jed", name: "Jeddah" },
        { id: "mak", name: "Makkah" },
        { id: "med", name: "Madinah" },
        { id: "dam", name: "Dammam" },
        { id: "tab", name: "Tabuk" },
        { id: "abha", name: "Abha" }
      ]
    },
    {
      id: "qa",
      name: "Qatar",
      cities: [
        { id: "doh", name: "Doha" },
        { id: "lus", name: "Lusail" },
        { id: "alkhor", name: "Al Khor" },
        { id: "wakra", name: "Al Wakra" },
        { id: "shamal", name: "Madinat ash Shamal" }
      ]
    },
    {
      id: "kw",
      name: "Kuwait",
      cities: [
        { id: "kwc", name: "Kuwait City" },
        { id: "hawalli", name: "Hawalli" },
        { id: "salmiya", name: "Salmiya" },
        { id: "ahmadi", name: "Ahmadi" }
      ]
    },
    {
      id: "bh",
      name: "Bahrain",
      cities: [
        { id: "man", name: "Manama" },
        { id: "muharraq", name: "Muharraq" },
        { id: "riffa", name: "Riffa" },
        { id: "hamad", name: "Hamad Town" }
      ]
    },
    {
      id: "om",
      name: "Oman",
      cities: [
        { id: "mus", name: "Muscat" },
        { id: "salalah", name: "Salalah" },
        { id: "sohar", name: "Sohar" },
        { id: "nizwa", name: "Nizwa" }
      ]
    },
    {
      id: "jo",
      name: "Jordan",
      cities: [
        { id: "amm", name: "Amman" },
        { id: "zarqa", name: "Zarqa" },
        { id: "irbid", name: "Irbid" },
        { id: "aqaba", name: "Aqaba" }
      ]
    },
    {
      id: "lb",
      name: "Lebanon",
      cities: [
        { id: "bey", name: "Beirut" },
        { id: "tripoli", name: "Tripoli" },
        { id: "sidon", name: "Sidon" },
        { id: "tyre", name: "Tyre" }
      ]
    },
    {
      id: "il",
      name: "Israel",
      cities: [
        { id: "tlv", name: "Tel Aviv" },
        { id: "jer", name: "Jerusalem" },
        { id: "hfa", name: "Haifa" },
        { id: "beersheba", name: "Beersheba" }
      ]
    },
    {
      id: "ir",
      name: "Iran",
      cities: [
        { id: "teh", name: "Tehran" },
        { id: "mashhad", name: "Mashhad" },
        { id: "isfahan", name: "Isfahan" },
        { id: "tabriz", name: "Tabriz" },
        { id: "shiraz", name: "Shiraz" }
      ]
    },
    {
      id: "iq",
      name: "Iraq",
      cities: [
        { id: "bgw", name: "Baghdad" },
        { id: "basra", name: "Basra" },
        { id: "mosul", name: "Mosul" },
        { id: "erbil", name: "Erbil" }
      ]
    },
    {
      id: "eg",
      name: "Egypt",
      cities: [
        { id: "cai", name: "Cairo" },
        { id: "alexandria", name: "Alexandria" },
        { id: "giza", name: "Giza" },
        { id: "luxor", name: "Luxor" },
        { id: "aswan", name: "Aswan" },
        { id: "sharm", name: "Sharm El Sheikh" }
      ]
    },
  
    // Asia
    {
      id: "cn",
      name: "China",
      cities: [
        { id: "bjs", name: "Beijing" },
        { id: "sha", name: "Shanghai" },
        { id: "can", name: "Guangzhou" },
        { id: "szx", name: "Shenzhen" },
        { id: "chongqing", name: "Chongqing" },
        { id: "hkg", name: "Hong Kong" }
      ]
    },
    {
      id: "jp",
      name: "Japan",
      cities: [
        { id: "tyo", name: "Tokyo" },
        { id: "osa", name: "Osaka" },
        { id: "ngo", name: "Nagoya" },
        { id: "fukuoka", name: "Fukuoka" },
        { id: "sapporo", name: "Sapporo" },
        { id: "kyoto", name: "Kyoto" }
      ]
    },
    {
      id: "kr",
      name: "South Korea",
      cities: [
        { id: "sel", name: "Seoul" },
        { id: "busan", name: "Busan" },
        { id: "incheon", name: "Incheon" },
        { id: "daegu", name: "Daegu" }
      ]
    },
    {
      id: "in",
      name: "India",
      cities: [
        { id: "del", name: "New Delhi" },
        { id: "bom", name: "Mumbai" },
        { id: "maa", name: "Chennai" },
        { id: "blr", name: "Bangalore" },
        { id: "hyd", name: "Hyderabad" },
        { id: "ccu", name: "Kolkata" }
      ]
    },
    {
      id: "sg",
      name: "Singapore",
      cities: [
        { id: "sin", name: "Singapore" }
      ]
    },
    {
      id: "th",
      name: "Thailand",
      cities: [
        { id: "bkk", name: "Bangkok" },
        { id: "chiang_mai", name: "Chiang Mai" },
        { id: "phuket", name: "Phuket" },
        { id: "pattaya", name: "Pattaya" }
      ]
    },
    {
      id: "my",
      name: "Malaysia",
      cities: [
        { id: "kul", name: "Kuala Lumpur" },
        { id: "penang", name: "Penang" },
        { id: "johor", name: "Johor Bahru" },
        { id: "kota_kinabalu", name: "Kota Kinabalu" }
      ]
    },
    {
      id: "vn",
      name: "Vietnam",
      cities: [
        { id: "han", name: "Hanoi" },
        { id: "sgn", name: "Ho Chi Minh City" },
        { id: "danang", name: "Da Nang" },
        { id: "hue", name: "Hue" }
      ]
    },
    {
      id: "pk",
      name: "Pakistan",
      cities: [
        { id: "isb", name: "Islamabad" },
        { id: "khi", name: "Karachi" },
        { id: "lhe", name: "Lahore" },
        { id: "pew", name: "Peshawar" },
        { id: "quet", name: "Quetta" }
      ]
    },
  
    // Europe
    {
      id: "gb",
      name: "United Kingdom",
      cities: [
        { id: "lon", name: "London" },
        { id: "man", name: "Manchester" },
        { id: "birmingham", name: "Birmingham" },
        { id: "edinburgh", name: "Edinburgh" },
        { id: "glasgow", name: "Glasgow" },
        { id: "liverpool", name: "Liverpool" }
      ]
    },
    {
      id: "fr",
      name: "France",
      cities: [
        { id: "par", name: "Paris" },
        { id: "mrs", name: "Marseille" },
        { id: "lyon", name: "Lyon" },
        { id: "nice", name: "Nice" },
        { id: "toulouse", name: "Toulouse" },
        { id: "bordeaux", name: "Bordeaux" }
      ]
    },
    {
      id: "de",
      name: "Germany",
      cities: [
        { id: "ber", name: "Berlin" },
        { id: "muc", name: "Munich" },
        { id: "fra", name: "Frankfurt" },
        { id: "ham", name: "Hamburg" },
        { id: "cologne", name: "Cologne" },
        { id: "stuttgart", name: "Stuttgart" }
      ]
    },
    {
      id: "it",
      name: "Italy",
      cities: [
        { id: "rom", name: "Rome" },
        { id: "mil", name: "Milan" },
        { id: "venice", name: "Venice" },
        { id: "florence", name: "Florence" },
        { id: "naples", name: "Naples" },
        { id: "turin", name: "Turin" }
      ]
    },
    {
      id: "es",
      name: "Spain",
      cities: [
        { id: "mad", name: "Madrid" },
        { id: "bcn", name: "Barcelona" },
        { id: "valencia", name: "Valencia" },
        { id: "seville", name: "Seville" },
        { id: "malaga", name: "Malaga" }
      ]
    },
    {
      id: "nl",
      name: "Netherlands",
      cities: [
        { id: "ams", name: "Amsterdam" },
        { id: "rotterdam", name: "Rotterdam" },
        { id: "hague", name: "The Hague" },
        { id: "utrecht", name: "Utrecht" }
      ]
    },
    {
      id: "ch",
      name: "Switzerland",
      cities: [
        { id: "zrh", name: "Zurich" },
        { id: "gen", name: "Geneva" },
        { id: "basel", name: "Basel" },
        { id: "bern", name: "Bern" }
      ]
    },
    {
      id: "se",
      name: "Sweden",
      cities: [
        { id: "sto", name: "Stockholm" },
        { id: "got", name: "Gothenburg" },
        { id: "malmo", name: "Malmö" }
      ]
    },
    {
      id: "no",
      name: "Norway",
      cities: [
        { id: "osl", name: "Oslo" },
        { id: "bergen", name: "Bergen" },
        { id: "trondheim", name: "Trondheim" }
      ]
    },
    {
      id: "ru",
      name: "Russia",
      cities: [
        { id: "mow", name: "Moscow" },
        { id: "led", name: "Saint Petersburg" },
        { id: "novo", name: "Novosibirsk" },
        { id: "yekaterinburg", name: "Yekaterinburg" }
      ]
    },
  
    // North America
    {
      id: "us",
      name: "United States",
      cities: [
        { id: "nyc", name: "New York" },
        { id: "lax", name: "Los Angeles" },
        { id: "chi", name: "Chicago" },
        { id: "mia", name: "Miami" },
        { id: "sfo", name: "San Francisco" },
        { id: "was", name: "Washington DC" },
        { id: "bos", name: "Boston" },
        { id: "sea", name: "Seattle" },
        { id: "dal", name: "Dallas" },
        { id: "den", name: "Denver" },
        { id: "las", name: "Las Vegas" },
        { id: "hou", name: "Houston" }
      ]
    },
    {
      id: "ca",
      name: "Canada",
      cities: [
        { id: "yto", name: "Toronto" },
        { id: "yvr", name: "Vancouver" },
        { id: "yul", name: "Montreal" },
        { id: "yyc", name: "Calgary" },
        { id: "yeg", name: "Edmonton" },
        { id: "yow", name: "Ottawa" }
      ]
    },
    {
      id: "mx",
      name: "Mexico",
      cities: [
        { id: "mex", name: "Mexico City" },
        { id: "cancun", name: "Cancún" },
        { id: "guadalajara", name: "Guadalajara" },
        { id: "monterrey", name: "Monterrey" }
      ]
    },
  
    // South America
    {
      id: "br",
      name: "Brazil",
      cities: [
        { id: "sao", name: "São Paulo" },
        { id: "rio", name: "Rio de Janeiro" },
        { id: "bsb", name: "Brasília" },
        { id: "salvador", name: "Salvador" },
        { id: "fortaleza", name: "Fortaleza" }
      ]
    },
    {
      id: "ar",
      name: "Argentina",
      cities: [
        { id: "bue", name: "Buenos Aires" },
        { id: "cordoba", name: "Córdoba" },
        { id: "rosario", name: "Rosario" },
        { id: "mendoza", name: "Mendoza" }
      ]
    },
    {
      id: "co",
      name: "Colombia",
      cities: [
        { id: "bog", name: "Bogotá" },
        { id: "mde", name: "Medellín" },
        { id: "clo", name: "Cali" },
        { id: "barranquilla", name: "Barranquilla" }
      ]
    },
    {
      id: "cl",
      name: "Chile",
      cities: [
        { id: "scl", name: "Santiago" },
        { id: "valparaiso", name: "Valparaíso" },
        { id: "concepcion", name: "Concepción" }
      ]
    },
    {
      id: "pe",
      name: "Peru",
      cities: [
        { id: "lim", name: "Lima" },
        { id: "arequipa", name: "Arequipa" },
        { id: "cusco", name: "Cusco" }
      ]
    },
  
    // Oceania
    {
      id: "au",
      name: "Australia",
      cities: [
        { id: "syd", name: "Sydney" },
        { id: "mel", name: "Melbourne" },
        { id: "bne", name: "Brisbane" },
        { id: "per", name: "Perth" },
        { id: "adl", name: "Adelaide" }
      ]
    },
    {
      id: "nz",
      name: "New Zealand",
      cities: [
        { id: "akl", name: "Auckland" },
        { id: "wlg", name: "Wellington" },
        { id: "chc", name: "Christchurch" },
        { id: "queenstown", name: "Queenstown" }
      ]
    },
  
    // Africa
    {
      id: "za",
      name: "South Africa",
      cities: [
        { id: "jnb", name: "Johannesburg" },
        { id: "cpt", name: "Cape Town" },
        { id: "dbn", name: "Durban" },
        { id: "pretoria", name: "Pretoria" }
      ]
    },
    {
      id: "ng",
      name: "Nigeria",
      cities: [
        { id: "lag", name: "Lagos" },
        { id: "abuja", name: "Abuja" },
        { id: "ibadan", name: "Ibadan" },
        { id: "kano", name: "Kano" }
      ]
    },
    {
      id: "ma",
      name: "Morocco",
      cities: [
        { id: "cmn", name: "Casablanca" },
        { id: "rak", name: "Marrakech" },
        { id: "fez", name: "Fez" },
        { id: "rabat", name: "Rabat" }
      ]
    },
    {
      id: "ke",
      name: "Kenya",
      cities: [
        { id: "nbo", name: "Nairobi" },
        { id: "mombasa", name: "Mombasa" },
        { id: "kisumu", name: "Kisumu" }
      ]
    }
  ];
  
  // Helper function to get cities by country ID
  export const getCitiesByCountry = (countryId: string) => {
    const country = countries.find(c => c.name === countryId);
    return country ? country.cities : [];
  };