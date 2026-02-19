export interface City {
  name: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const CITIES: City[] = [
  { name: "Mecca",        country: "Saudi Arabia", flag: "🇸🇦", lat: 21.3891,  lng: 39.8579,  timezone: "Asia/Riyadh"       },
  { name: "Medina",       country: "Saudi Arabia", flag: "🇸🇦", lat: 24.5247,  lng: 39.5692,  timezone: "Asia/Riyadh"       },
  { name: "Jerusalem",    country: "Palestine",    flag: "🇵🇸", lat: 31.7683,  lng: 35.2137,  timezone: "Asia/Jerusalem"    },
  { name: "Cairo",        country: "Egypt",        flag: "🇪🇬", lat: 30.0444,  lng: 31.2357,  timezone: "Africa/Cairo"      },
  { name: "Istanbul",     country: "Türkiye",      flag: "🇹🇷", lat: 41.0082,  lng: 28.9784,  timezone: "Europe/Istanbul"   },
  { name: "Dubai",        country: "UAE",          flag: "🇦🇪", lat: 25.2048,  lng: 55.2708,  timezone: "Asia/Dubai"        },
  { name: "Tehran",       country: "Iran",         flag: "🇮🇷", lat: 35.6892,  lng: 51.3890,  timezone: "Asia/Tehran"       },
  { name: "Karachi",      country: "Pakistan",     flag: "🇵🇰", lat: 24.8607,  lng: 67.0011,  timezone: "Asia/Karachi"      },
  { name: "Islamabad",    country: "Pakistan",     flag: "🇵🇰", lat: 33.7294,  lng: 73.0931,  timezone: "Asia/Karachi"      },
  { name: "Dhaka",        country: "Bangladesh",   flag: "🇧🇩", lat: 23.8103,  lng: 90.4125,  timezone: "Asia/Dhaka"        },
  { name: "Delhi",        country: "India",        flag: "🇮🇳", lat: 28.6139,  lng: 77.2090,  timezone: "Asia/Kolkata"      },
  { name: "Kuala Lumpur", country: "Malaysia",     flag: "🇲🇾", lat: 3.1390,   lng: 101.6869, timezone: "Asia/Kuala_Lumpur" },
  { name: "Jakarta",      country: "Indonesia",    flag: "🇮🇩", lat: -6.2088,  lng: 106.8456, timezone: "Asia/Jakarta"      },
  { name: "Lahore",       country: "Pakistan",     flag: "🇵🇰", lat: 31.5204,  lng: 74.3587,  timezone: "Asia/Karachi"      },
  { name: "Kabul",        country: "Afghanistan",  flag: "🇦🇫", lat: 34.5553,  lng: 69.2075,  timezone: "Asia/Kabul"        },
  { name: "Baghdad",      country: "Iraq",         flag: "🇮🇶", lat: 33.3152,  lng: 44.3661,  timezone: "Asia/Baghdad"      },
  { name: "Amman",        country: "Jordan",       flag: "🇯🇴", lat: 31.9454,  lng: 35.9284,  timezone: "Asia/Amman"        },
  { name: "Beirut",       country: "Lebanon",      flag: "🇱🇧", lat: 33.8938,  lng: 35.5018,  timezone: "Asia/Beirut"       },
  { name: "Casablanca",   country: "Morocco",      flag: "🇲🇦", lat: 33.5731,  lng: -7.5898,  timezone: "Africa/Casablanca" },
  { name: "Tunis",        country: "Tunisia",      flag: "🇹🇳", lat: 36.8189,  lng: 10.1658,  timezone: "Africa/Tunis"      },
  { name: "Algiers",      country: "Algeria",      flag: "🇩🇿", lat: 36.7372,  lng: 3.0865,   timezone: "Africa/Algiers"    },
  { name: "Lagos",        country: "Nigeria",      flag: "🇳🇬", lat: 6.5244,   lng: 3.3792,   timezone: "Africa/Lagos"      },
  { name: "Nairobi",      country: "Kenya",        flag: "🇰🇪", lat: -1.2921,  lng: 36.8219,  timezone: "Africa/Nairobi"    },
  { name: "London",       country: "UK",           flag: "🇬🇧", lat: 51.5074,  lng: -0.1278,  timezone: "Europe/London"     },
  { name: "Paris",        country: "France",       flag: "🇫🇷", lat: 48.8566,  lng: 2.3522,   timezone: "Europe/Paris"      },
  { name: "Berlin",       country: "Germany",      flag: "🇩🇪", lat: 52.5200,  lng: 13.4050,  timezone: "Europe/Berlin"     },
  { name: "New York",     country: "USA",          flag: "🇺🇸", lat: 40.7128,  lng: -74.0060, timezone: "America/New_York"  },
  { name: "Chicago",      country: "USA",          flag: "🇺🇸", lat: 41.8781,  lng: -87.6298, timezone: "America/Chicago"   },
  { name: "Los Angeles",  country: "USA",          flag: "🇺🇸", lat: 34.0522,  lng: -118.2437,timezone: "America/Los_Angeles"},
  { name: "Toronto",      country: "Canada",       flag: "🇨🇦", lat: 43.6532,  lng: -79.3832, timezone: "America/Toronto"   },
  { name: "Sydney",       country: "Australia",    flag: "🇦🇺", lat: -33.8688, lng: 151.2093, timezone: "Australia/Sydney"  },
];
