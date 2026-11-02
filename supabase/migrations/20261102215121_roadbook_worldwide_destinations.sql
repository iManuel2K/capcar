-- Public venue metadata only. No schema, account, visit or existing venue changes.
-- Coordinates: Wikidata CC0; source URLs: individually reviewed operator pages.
-- Generated from data/roadbook/worldwide-2026-11-02.json; see docs/roadbook-worldwide.md.
begin;

with incoming as (
  select * from jsonb_to_recordset($roadbook_places$
[
  {
    "wikidataId": "Q588356",
    "name": "Dubai Autodrome",
    "slug": "world-q588356",
    "category": "track_day",
    "description": "Dubai Autodrome is a motorsport circuit in United Arab Emirates. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 25.050633,
    "longitude": 55.239129,
    "country_code": "AE",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://dubaiautodrome.ae/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q588356",
        "region": "Middle East",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q588356",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Dubaiautodrome - Home - Dubai Autodrome"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q172869",
    "name": "Yas Marina Circuit",
    "slug": "world-q172869",
    "category": "track_day",
    "description": "Yas Marina Circuit is a motorsport circuit in United Arab Emirates. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 24.470244444,
    "longitude": 54.606075,
    "country_code": "AE",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.yasmarinacircuit.com/en/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q172869",
        "region": "Middle East",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q172869",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Yas Marina Circuit | Sports Entertainment Venue in Abu Dhabi"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q4827242",
    "name": "Autódromo Termas de Río Hondo",
    "slug": "world-q4827242",
    "category": "track_day",
    "description": "Autódromo Termas de Río Hondo is a motorsport circuit in Argentina. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -27.50586111,
    "longitude": -64.91447222,
    "country_code": "AR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://autodromotermas.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q4827242",
        "region": "South America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q4827242",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autódromo Internacional - Termas de Río Hondo"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q173116",
    "name": "Oscar and Juan Gálvez Race Track",
    "slug": "world-q173116",
    "category": "track_day",
    "description": "Oscar and Juan Gálvez Race Track is a motorsport circuit in Argentina. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -34.694272222,
    "longitude": -58.459347222,
    "country_code": "AR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.ciudadautodromo.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q173116",
        "region": "South America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q173116",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "#AutodromoBA | Autódromo de la Ciudad de Buenos Aires | Argentina"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q700121",
    "name": "Salzburgring",
    "slug": "world-q700121",
    "category": "track_day",
    "description": "Salzburgring is a motorsport circuit in Austria. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 47.8227,
    "longitude": 13.1664,
    "country_code": "AT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://salzburgring.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q700121",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q700121",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Salzburgring | Home"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q2973977",
    "name": "Adelaide International Raceway",
    "slug": "world-q2973977",
    "category": "drag_acceleration",
    "description": "Adelaide International Raceway is a drag-racing venue in Australia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -34.6992,
    "longitude": 138.565,
    "country_code": "AU",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.adelaideinternationalraceway.com.au/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q2973977",
        "region": "Oceania",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q2973977",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Adelaide International Raceway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q571271",
    "name": "Phillip Island Grand Prix Circuit",
    "slug": "world-q571271",
    "category": "track_day",
    "description": "Phillip Island Grand Prix Circuit is a motorsport circuit in Australia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -38.5031,
    "longitude": 145.236,
    "country_code": "AU",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.phillipislandcircuit.com.au/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q571271",
        "region": "Oceania",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q571271",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Phillip Island Circuit"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q7988364",
    "name": "Sydney Dragway",
    "slug": "world-q7988364",
    "category": "drag_acceleration",
    "description": "Sydney Dragway is a drag-racing venue in Australia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -33.8139,
    "longitude": 150.871,
    "country_code": "AU",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.sydneydragway.com.au/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q7988364",
        "region": "Oceania",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q7988364",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Home | Sydney Dragway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1278165",
    "name": "Sydney Motorsport Park",
    "slug": "world-q1278165",
    "category": "track_day",
    "description": "Sydney Motorsport Park is a motorsport circuit in Australia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -33.804167,
    "longitude": 150.870556,
    "country_code": "AU",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.sydneymotorsportpark.com.au/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1278165",
        "region": "Oceania",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1278165",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Sydney Motorsport Park powered by the Australian Racing Drivers Club Sydney Motorsport Park Events and Online Shop"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q172868",
    "name": "Circuit Zolder",
    "slug": "world-q172868",
    "category": "track_day",
    "description": "Circuit Zolder is a motorsport circuit in Belgium. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 50.988888888,
    "longitude": 5.255555555,
    "country_code": "BE",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.circuit-zolder.be/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q172868",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q172868",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Welkom op Circuit Zolder - Circuit Zolder"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q171332",
    "name": "Bahrain International Circuit",
    "slug": "world-q171332",
    "category": "track_day",
    "description": "Bahrain International Circuit is a motorsport circuit in Bahrain. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 26.0325,
    "longitude": 50.510555555,
    "country_code": "BH",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.bahraingp.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q171332",
        "region": "Middle East",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q171332",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Homepage - Bahrain International Circuit"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q789413",
    "name": "Autódromo Internacional de Guaporé",
    "slug": "world-q789413",
    "category": "track_day",
    "description": "Autódromo Internacional de Guaporé is a motorsport circuit in Brazil. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -28.84472222,
    "longitude": -51.85388889,
    "country_code": "BR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://autodromodeguapore.com.br/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q789413",
        "region": "South America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q789413",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autódromo de Guaporé"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q4827228",
    "name": "Autódromo Internacional de Santa Cruz do Sul",
    "slug": "world-q4827228",
    "category": "track_day",
    "description": "Autódromo Internacional de Santa Cruz do Sul is a motorsport circuit in Brazil. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -29.8,
    "longitude": -52.43666667,
    "country_code": "BR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.santacruz.rs.gov.br/municipio/autodromo",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q4827228",
        "region": "South America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q4827228",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Prefeitura Municipal de Santa Cruz do Sul, RS, Brasil"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q16495395",
    "name": "Autódromo Velo Città",
    "slug": "world-q16495395",
    "category": "track_day",
    "description": "Autódromo Velo Città is a motorsport circuit in Brazil. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -22.28944444,
    "longitude": -46.84777778,
    "country_code": "BR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.autodromovelocitta.com.br/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q16495395",
        "region": "South America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q16495395",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autódromo Velocitta"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q4816494",
    "name": "Atlantic Motorsport Park",
    "slug": "world-q4816494",
    "category": "track_day",
    "description": "Atlantic Motorsport Park is a motorsport circuit in Canada. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 45.145,
    "longitude": -63.4486,
    "country_code": "CA",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://atlanticmotorsportpark.ca/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q4816494",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q4816494",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Atlantic Motorsport Park"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q14875114",
    "name": "Calabogie Motorsports Park",
    "slug": "world-q14875114",
    "category": "track_day",
    "description": "Calabogie Motorsports Park is a motorsport circuit in Canada. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 45.3028,
    "longitude": -76.6722,
    "country_code": "CA",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://calabogiemotorsports.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q14875114",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q14875114",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Calabogie Motorsports Park North America’s Premier Driving Experience"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q171570",
    "name": "Canadian Tire Motorsport Park",
    "slug": "world-q171570",
    "category": "track_day",
    "description": "Canadian Tire Motorsport Park is a motorsport circuit in Canada. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 44.05,
    "longitude": -78.677777777,
    "country_code": "CA",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://canadiantiremotorsportpark.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q171570",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q171570",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Canadian Tire Motorsport Park - Official Site"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q5253353",
    "name": "Delaware Speedway",
    "slug": "world-q5253353",
    "category": "track_day",
    "description": "Delaware Speedway is a motorsport circuit in Canada. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 42.9303,
    "longitude": -81.4177,
    "country_code": "CA",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://delawarespeedway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q5253353",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q5253353",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Page | Delaware Speedway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q14252496",
    "name": "RAD Torque Raceway",
    "slug": "world-q14252496",
    "category": "drag_acceleration",
    "description": "RAD Torque Raceway is a drag-racing venue in Canada. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 53.3339,
    "longitude": -113.599,
    "country_code": "CA",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://radraceway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q14252496",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q14252496",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Home - RAD Torque Raceway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q786418",
    "name": "Autodrom Most",
    "slug": "world-q786418",
    "category": "track_day",
    "description": "Autodrom Most is a motorsport circuit in Czechia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 50.51805556,
    "longitude": 13.59,
    "country_code": "CZ",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.autodrom-most.cz/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q786418",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q786418",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autodrom Most - závody, akce pro veřejnost, polygon, kurzy řízení a škola smyku"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q222686",
    "name": "Masaryk Circuit",
    "slug": "world-q222686",
    "category": "track_day",
    "description": "Masaryk Circuit is a motorsport circuit in Czechia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 49.204722222,
    "longitude": 16.450555555,
    "country_code": "CZ",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.automotodrombrno.cz/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q222686",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q222686",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "CREDITAS Autodrom Brno"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q567770",
    "name": "Sachsenring",
    "slug": "world-q567770",
    "category": "track_day",
    "description": "Sachsenring is a motorsport circuit in Germany. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 50.7906,
    "longitude": 12.6878,
    "country_code": "DE",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.sachsenring-circuit.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q567770",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q567770",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Sachsenring - Motorsport und mehr - Home"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q194201",
    "name": "Padborg Park",
    "slug": "world-q194201",
    "category": "track_day",
    "description": "Padborg Park is a motorsport circuit in Denmark. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 54.868611,
    "longitude": 9.274722,
    "country_code": "DK",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://padborgpark.dk/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q194201",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q194201",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Padborg Park har bilerne og en motorbane på 2150 meter -"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q280374",
    "name": "Audru Ring",
    "slug": "world-q280374",
    "category": "track_day",
    "description": "Audru Ring is a motorsport circuit in Estonia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 58.40186701,
    "longitude": 24.45369454,
    "country_code": "EE",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.audruring.ee/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q280374",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q280374",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Porsche Ring | Probably the best racetrack in the Nordics!"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q171404",
    "name": "Circuit de Barcelona-Catalunya",
    "slug": "world-q171404",
    "category": "track_day",
    "description": "Circuit de Barcelona-Catalunya is a motorsport circuit in Spain. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 41.57,
    "longitude": 2.261111111,
    "country_code": "ES",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.circuitcat.com/es/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q171404",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q171404",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Circuit de Barcelona-Catalunya | Web oficial, entradas y eventos"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q786577",
    "name": "Circuit Ricardo Tormo",
    "slug": "world-q786577",
    "category": "track_day",
    "description": "Circuit Ricardo Tormo is a motorsport circuit in Spain. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 39.485833,
    "longitude": -0.628056,
    "country_code": "ES",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.circuitricardotormo.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q786577",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q786577",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Home - Circuit Ricardo Tormo"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1092902",
    "name": "Circuito de Navarra",
    "slug": "world-q1092902",
    "category": "track_day",
    "description": "Circuito de Navarra is a motorsport circuit in Spain. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 42.56105833,
    "longitude": -2.16361389,
    "country_code": "ES",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.circuitodenavarra.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1092902",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1092902",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Circuito de Navarra | Home"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q172897",
    "name": "Jarama Circuit",
    "slug": "world-q172897",
    "category": "track_day",
    "description": "Jarama Circuit is a motorsport circuit in Spain. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 40.617111111,
    "longitude": -3.585583333,
    "country_code": "ES",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.jarama.org/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q172897",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q172897",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Circuito de Madrid Jarama - RACE | Experiencias inolvidables para particulares y empresas en Madrid"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q172884",
    "name": "Jerez-Ángel Nieto Circuit",
    "slug": "world-q172884",
    "category": "track_day",
    "description": "Jerez-Ángel Nieto Circuit is a motorsport circuit in Spain. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 36.708333333,
    "longitude": -6.034166666,
    "country_code": "ES",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://circuitodejerez.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q172884",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q172884",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Inicio - Circuito de Jerez Ángel Nieto"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1321650",
    "name": "MotorLand Aragón",
    "slug": "world-q1321650",
    "category": "track_day",
    "description": "MotorLand Aragón is a motorsport circuit in Spain. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 41.07968,
    "longitude": -0.18724,
    "country_code": "ES",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.motorlandaragon.com/es",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1321650",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1321650",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Inicio | Motorland Aragón"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q5859642",
    "name": "Parcmotor Castellolí",
    "slug": "world-q5859642",
    "category": "track_day",
    "description": "Parcmotor Castellolí is a motorsport circuit in Spain. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 41.591944444,
    "longitude": 1.688611111,
    "country_code": "ES",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://kinimotorpark.com/es/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q5859642",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q5859642",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Kini MotorPark - El circuito más innovador y natural"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q2623403",
    "name": "Alastaro Circuit",
    "slug": "world-q2623403",
    "category": "track_day",
    "description": "Alastaro Circuit is a motorsport circuit in Finland. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 60.977402777,
    "longitude": 22.658572222,
    "country_code": "FI",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.alastarocircuit.fi/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q2623403",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q2623403",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Alastaro Circuit | Moottoriratakeskus"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1738522",
    "name": "Kemora Circuit",
    "slug": "world-q1738522",
    "category": "track_day",
    "description": "Kemora Circuit is a motorsport circuit in Finland. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 63.418297222,
    "longitude": 23.984913888,
    "country_code": "FI",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://kemora.fi/en/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1738522",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1738522",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Kemoran moottorirata – Suosittu kohde ajoharjoitteluun ja kisoille"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q6918074",
    "name": "Motopark Raceway",
    "slug": "world-q6918074",
    "category": "track_day",
    "description": "Motopark Raceway is a motorsport circuit in Finland. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 62.05513,
    "longitude": 27.55529,
    "country_code": "FI",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.motopark.fi/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q6918074",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q6918074",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": ""
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q735277",
    "name": "Autodrome de Linas-Montlhéry",
    "slug": "world-q735277",
    "category": "proving_ground",
    "description": "Autodrome de Linas-Montlhéry is a automotive proving ground in France. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 48.62219,
    "longitude": 2.23555,
    "country_code": "FR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.utac.com/our-sites/linas-montlhery",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q735277",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q735277",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Linas-Montlhéry - UTAC | Connected Autonomous Vehicle Testing"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q928721",
    "name": "Bugatti Circuit",
    "slug": "world-q928721",
    "category": "track_day",
    "description": "Bugatti Circuit is a motorsport circuit in France. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 47.953719802,
    "longitude": 0.210778691,
    "country_code": "FR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.lemans.org/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q928721",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q928721",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Accueil | ACO - Automobile Club de l Ouest"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q172879",
    "name": "Charade Circuit",
    "slug": "world-q172879",
    "category": "track_day",
    "description": "Charade Circuit is a motorsport circuit in France. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 45.7424969,
    "longitude": 3.028937,
    "country_code": "FR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.charade.fr/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q172879",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q172879",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Accueil - Charade"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q609448",
    "name": "Circuit Pau-Arnos",
    "slug": "world-q609448",
    "category": "track_day",
    "description": "Circuit Pau-Arnos is a motorsport circuit in France. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 43.446122749,
    "longitude": -0.532424716,
    "country_code": "FR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://circuit-pau-arnos.fr/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q609448",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q609448",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Site officiel - Circuit Européen Auto Moto PAU ARNOS"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q867548",
    "name": "Circuit Paul Armagnac",
    "slug": "world-q867548",
    "category": "track_day",
    "description": "Circuit Paul Armagnac is a motorsport circuit in France. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 43.770266,
    "longitude": -0.039728,
    "country_code": "FR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.circuit-nogaro.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q867548",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q867548",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Le Circuit - Circuit Nogaro"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q171424",
    "name": "Circuit Paul Ricard",
    "slug": "world-q171424",
    "category": "track_day",
    "description": "Circuit Paul Ricard is a motorsport circuit in France. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 43.250555555,
    "longitude": 5.791666666,
    "country_code": "FR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.circuitpaulricard.com/fr/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q171424",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q171424",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Accueil - Circuit Paul Ricard"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q4763391",
    "name": "Anglesey Circuit",
    "slug": "world-q4763391",
    "category": "track_day",
    "description": "Anglesey Circuit is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 53.19004167,
    "longitude": -4.49766111,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.angleseycircuit.co.uk/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q4763391",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q4763391",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Anglesey Circuit Trac Môn | Motor racing circuit based on the west coast of Anglesey, UK"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q172880",
    "name": "Brands Hatch",
    "slug": "world-q172880",
    "category": "track_day",
    "description": "Brands Hatch is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 51.356666666,
    "longitude": 0.2625,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.brandshatch.co.uk/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q172880",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q172880",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Brands Hatch - MSV"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1025346",
    "name": "Cadwell Park",
    "slug": "world-q1025346",
    "category": "track_day",
    "description": "Cadwell Park is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 53.3089,
    "longitude": -0.0630556,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.cadwellpark.co.uk/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1025346",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1025346",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Cadwell Park - MSV"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q173202",
    "name": "Donington Park",
    "slug": "world-q173202",
    "category": "track_day",
    "description": "Donington Park is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 52.829166666,
    "longitude": -1.375,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.donington-park.co.uk/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q173202",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q173202",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Donington Park - Home Page"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q953716",
    "name": "Goodwood Circuit",
    "slug": "world-q953716",
    "category": "track_day",
    "description": "Goodwood Circuit is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 50.8594,
    "longitude": -0.759167,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.goodwood.com/motorsport/motor-circuit/track-hire/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q953716",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q953716",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Private Track Hire | Goodwood Motor Circuit, West Sussex"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q524404",
    "name": "Knockhill Racing Circuit",
    "slug": "world-q524404",
    "category": "track_day",
    "description": "Knockhill Racing Circuit is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 56.12886111,
    "longitude": -3.50350833,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.knockhill.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q524404",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q524404",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Knockhill Racing Circuit"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1583363",
    "name": "Mallory Park",
    "slug": "world-q1583363",
    "category": "track_day",
    "description": "Mallory Park is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 52.5986,
    "longitude": -1.33778,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.malloryparkcircuit.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1583363",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1583363",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Car and Bike Race Days | Supercar Experiences | The Friendly Circuit | Mallory Park Circuit"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q997133",
    "name": "Oulton Park",
    "slug": "world-q997133",
    "category": "track_day",
    "description": "Oulton Park is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 53.177583,
    "longitude": -2.614361,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.oultonpark.co.uk/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q997133",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q997133",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Oulton Park - MSV"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q171402",
    "name": "Silverstone Circuit",
    "slug": "world-q171402",
    "category": "track_day",
    "description": "Silverstone Circuit is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 52.075,
    "longitude": -1.016666666,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.silverstone.co.uk/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q171402",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q171402",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Silverstone Home Page | Home to the British Grand Prix"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1585125",
    "name": "Snetterton Motor Racing Circuit",
    "slug": "world-q1585125",
    "category": "track_day",
    "description": "Snetterton Motor Racing Circuit is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 52.4665,
    "longitude": 0.948222,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.snetterton.co.uk/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1585125",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1585125",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Snetterton - Home Page"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q2465788",
    "name": "Thruxton Circuit",
    "slug": "world-q2465788",
    "category": "track_day",
    "description": "Thruxton Circuit is a motorsport circuit in United Kingdom. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 51.210278,
    "longitude": -1.600556,
    "country_code": "GB",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://thruxtonracing.co.uk/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q2465788",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q2465788",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Thruxton Circuit - UK s Fastest Race Circuit"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q16830288",
    "name": "Serres Racing Circuit",
    "slug": "world-q16830288",
    "category": "track_day",
    "description": "Serres Racing Circuit is a motorsport circuit in Greece. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 41.072177,
    "longitude": 23.516373,
    "country_code": "GR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://serrescircuit.gr/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q16830288",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q16830288",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Serres Circuit Αυτοκινητοδρόμιο Serres Circuit Αυτοκινητοδρόμιο Σερρών"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q787936",
    "name": "Automotodrom Grobnik",
    "slug": "world-q787936",
    "category": "track_day",
    "description": "Automotodrom Grobnik is a motorsport circuit in Croatia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 45.38258333,
    "longitude": 14.50866667,
    "country_code": "HR",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://grobnik.hr/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q787936",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q787936",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Grobnik Circuit Motorsport race track in Rijeka, Croatia"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q118511681",
    "name": "Balaton Park Circuit",
    "slug": "world-q118511681",
    "category": "track_day",
    "description": "Balaton Park Circuit is a motorsport circuit in Hungary. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 47.008055555,
    "longitude": 18.198888888,
    "country_code": "HU",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.balatonparkcircuit.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q118511681",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q118511681",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Home | Balaton Park Circuit | Hungary"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q171356",
    "name": "Hungaroring",
    "slug": "world-q171356",
    "category": "track_day",
    "description": "Hungaroring is a motorsport circuit in Hungary. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 47.582222222,
    "longitude": 19.251111111,
    "country_code": "HU",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://hungaroring.hu/site/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q171356",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q171356",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Hungaroring Sport ZRt."
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q105061873",
    "name": "Mandalika International Street Circuit",
    "slug": "world-q105061873",
    "category": "track_day",
    "description": "Mandalika International Street Circuit is a motorsport circuit in Indonesia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -8.895423,
    "longitude": 116.304182,
    "country_code": "ID",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.themandalikagp.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q105061873",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q105061873",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "MGPA"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q6370393",
    "name": "Kari Motor Speedway",
    "slug": "world-q6370393",
    "category": "track_day",
    "description": "Kari Motor Speedway is a motorsport circuit in India. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 10.90138889,
    "longitude": 77.05083333,
    "country_code": "IN",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://lgsports.co.in/about-us/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q6370393",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q6370393",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "About Us Kari Motor Speedway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q786432",
    "name": "ACI Vallelunga Circuit",
    "slug": "world-q786432",
    "category": "track_day",
    "description": "ACI Vallelunga Circuit is a motorsport circuit in Italy. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 42.15944444,
    "longitude": 12.36916667,
    "country_code": "IT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://motorsport.vallelunga.it/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q786432",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q786432",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Motorsport Motorsport Vallelunga.it"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q786167",
    "name": "Autodromo di Pergusa",
    "slug": "world-q786167",
    "category": "track_day",
    "description": "Autodromo di Pergusa is a motorsport circuit in Italy. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 37.51444,
    "longitude": 14.30639,
    "country_code": "IT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.autodromopergusa.it/it-it/home",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q786167",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q786167",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autodromo di Pergusa"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q2250260",
    "name": "Autodromo Riccardo Paletti",
    "slug": "world-q2250260",
    "category": "track_day",
    "description": "Autodromo Riccardo Paletti is a motorsport circuit in Italy. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 44.68111111,
    "longitude": 10.0225,
    "country_code": "IT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.autodromovarano.it/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q2250260",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q2250260",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autodromo di Varano de Melegari"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q123411911",
    "name": "Cremona Circuit",
    "slug": "world-q123411911",
    "category": "track_day",
    "description": "Cremona Circuit is a motorsport circuit in Italy. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 45.085433333,
    "longitude": 10.312013888,
    "country_code": "IT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://cremonacircuit.it/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q123411911",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q123411911",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Home - Cremona Circuit"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q171313",
    "name": "Imola Circuit",
    "slug": "world-q171313",
    "category": "track_day",
    "description": "Imola Circuit is a motorsport circuit in Italy. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 44.341111111,
    "longitude": 11.713333333,
    "country_code": "IT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.autodromoimola.it/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q171313",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q171313",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autodromo di Imola Enzo e Dino Ferrari | Homepage"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1347804",
    "name": "Misano World Circuit Marco Simoncelli",
    "slug": "world-q1347804",
    "category": "track_day",
    "description": "Misano World Circuit Marco Simoncelli is a motorsport circuit in Italy. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 43.961375,
    "longitude": 12.685958,
    "country_code": "IT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.misanocircuit.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1347804",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1347804",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Misano World Circuit"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q171417",
    "name": "Monza Circuit",
    "slug": "world-q171417",
    "category": "track_day",
    "description": "Monza Circuit is a motorsport circuit in Italy. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 45.620555555,
    "longitude": 9.289444444,
    "country_code": "IT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.monzanet.it/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q171417",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q171417",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autodromo Nazionale Monza | The Temple of Speed"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q782455",
    "name": "Mugello Circuit",
    "slug": "world-q782455",
    "category": "track_day",
    "description": "Mugello Circuit is a motorsport circuit in Italy. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 43.9975,
    "longitude": 11.37194,
    "country_code": "IT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.mugellocircuit.it/it/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q782455",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q782455",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Mugello Circuit - L'autodromo del Mugello"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q48780398",
    "name": "Tazio Nuvolari Circuit",
    "slug": "world-q48780398",
    "category": "track_day",
    "description": "Tazio Nuvolari Circuit is a motorsport circuit in Italy. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 45.0723472,
    "longitude": 8.9918543,
    "country_code": "IT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.circuitotazionuvolari.it/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q48780398",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q48780398",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Circuito Tazio Nuvolari Autodromo Nuvolari"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1748785",
    "name": "Autopolis",
    "slug": "world-q1748785",
    "category": "track_day",
    "description": "Autopolis is a motorsport circuit in Japan. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 33.036944444,
    "longitude": 130.973027777,
    "country_code": "JP",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://autopolis.jp/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1748785",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1748785",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "株式会社オートポリス"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q5331869",
    "name": "Ebisu Circuit",
    "slug": "world-q5331869",
    "category": "drift_circuit",
    "description": "Ebisu Circuit is a drift-circuit venue in Japan. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 37.644224,
    "longitude": 140.372278,
    "country_code": "JP",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.ebisu-circuit.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q5331869",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q5331869",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "EBISU CIRCUIT"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q171399",
    "name": "Fuji Speedway",
    "slug": "world-q171399",
    "category": "track_day",
    "description": "Fuji Speedway is a motorsport circuit in Japan. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 35.371666666,
    "longitude": 138.926666666,
    "country_code": "JP",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.fsw.tv/en/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q171399",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q171399",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "FSW GUIDE | FUJI INTERNATIONAL SPEEDWAY CO., LTD."
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q6798405",
    "name": "Maze Sea Circuit",
    "slug": "world-q6798405",
    "category": "track_day",
    "description": "Maze Sea Circuit is a motorsport circuit in Japan. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 37.745,
    "longitude": 138.8,
    "country_code": "JP",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://mazecircuit.jp/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q6798405",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q6798405",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "日本海間瀬サーキット"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q173185",
    "name": "Okayama International Circuit",
    "slug": "world-q173185",
    "category": "track_day",
    "description": "Okayama International Circuit is a motorsport circuit in Japan. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 34.915,
    "longitude": 134.221111111,
    "country_code": "JP",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.okayama-international-circuit.jp/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q173185",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q173185",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "���R���ۃT�[�L�b�g"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q11626575",
    "name": "Sodegaura Forest Raceway",
    "slug": "world-q11626575",
    "category": "track_day",
    "description": "Sodegaura Forest Raceway is a motorsport circuit in Japan. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 35.39494722,
    "longitude": 140.08800833,
    "country_code": "JP",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.sodegaura-forest-raceway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q11626575",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q11626575",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "袖ヶ浦フォレストレースウェイ 公式サイト"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q917398",
    "name": "Sportsland SUGO",
    "slug": "world-q917398",
    "category": "track_day",
    "description": "Sportsland SUGO is a motorsport circuit in Japan. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 38.14055556,
    "longitude": 140.77638889,
    "country_code": "JP",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://sportsland-sugo.co.jp/en/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q917398",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q917398",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Sports Land SUGO"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q174170",
    "name": "Suzuka Circuit",
    "slug": "world-q174170",
    "category": "track_day",
    "description": "Suzuka Circuit is a motorsport circuit in Japan. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 34.841666666,
    "longitude": 136.538888888,
    "country_code": "JP",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.suzukacircuit.jp/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q174170",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q174170",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "鈴鹿サーキット"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q16353023",
    "name": "Biķernieki Complex Sports Base",
    "slug": "world-q16353023",
    "category": "track_day",
    "description": "Biķernieki Complex Sports Base is a motorsport circuit in Latvia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 56.9664,
    "longitude": 24.2215,
    "country_code": "LV",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.bksb.lv/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q16353023",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q16353023",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Galvenā"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q4827241",
    "name": "Autódromo de León",
    "slug": "world-q4827241",
    "category": "track_day",
    "description": "Autódromo de León is a motorsport circuit in Mexico. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 21.03583333,
    "longitude": -101.57527778,
    "country_code": "MX",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.autodromodeleon.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q4827241",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q4827241",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Go Karts | Autódromo De León | León"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q173099",
    "name": "Autódromo Hermanos Rodríguez",
    "slug": "world-q173099",
    "category": "track_day",
    "description": "Autódromo Hermanos Rodríguez is a motorsport circuit in Mexico. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 19.404197222,
    "longitude": -99.088747222,
    "country_code": "MX",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://ahr.mx/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q173099",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q173099",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autódromo Hermanos Rodríguez"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q789428",
    "name": "Autódromo Miguel E. Abed",
    "slug": "world-q789428",
    "category": "track_day",
    "description": "Autódromo Miguel E. Abed is a motorsport circuit in Mexico. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 19.03,
    "longitude": -97.98806,
    "country_code": "MX",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://autodromomabed.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q789428",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q789428",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autodromo Mabed"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q172738",
    "name": "Sepang International Circuit",
    "slug": "world-q172738",
    "category": "track_day",
    "description": "Sepang International Circuit is a motorsport circuit in Malaysia. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 2.760555555,
    "longitude": 101.7375,
    "country_code": "MY",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.sepangcircuit.com/home",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q172738",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q172738",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Sepang International Circuit Official Website"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q2487357",
    "name": "Hampton Downs Motorsport Park",
    "slug": "world-q2487357",
    "category": "track_day",
    "description": "Hampton Downs Motorsport Park is a motorsport circuit in New Zealand. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -37.353889,
    "longitude": 175.075278,
    "country_code": "NZ",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.hamptondowns.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q2487357",
        "region": "Oceania",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q2487357",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Things to Do in Waikato | World Class Racing | Hampton Downs"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q16252707",
    "name": "Highlands Motorsport Park",
    "slug": "world-q16252707",
    "category": "track_day",
    "description": "Highlands Motorsport Park is a motorsport circuit in New Zealand. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -45.0591,
    "longitude": 169.17,
    "country_code": "NZ",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.highlands.co.nz/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q16252707",
        "region": "Oceania",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q16252707",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Queenstown Activities | Highlands Cromwell | Highlands"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q2333555",
    "name": "Taupō International Motorsport Park",
    "slug": "world-q2333555",
    "category": "track_day",
    "description": "Taupō International Motorsport Park is a motorsport circuit in New Zealand. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -38.665556,
    "longitude": 176.144167,
    "country_code": "NZ",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.taupomp.co.nz/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q2333555",
        "region": "Oceania",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q2333555",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Things To Do in Taupo | Motorsport NZ | Taupo Motorsport Park"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q96311112",
    "name": "Autodrom Jastrząb",
    "slug": "world-q96311112",
    "category": "track_day",
    "description": "Autodrom Jastrząb is a motorsport circuit in Poland. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 51.2638498,
    "longitude": 20.9282493,
    "country_code": "PL",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://torjastrzab.pl/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q96311112",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q96311112",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Tor Jastrząb - Autodrom Jastrząb"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q9360123",
    "name": "Tor Poznań",
    "slug": "world-q9360123",
    "category": "track_day",
    "description": "Tor Poznań is a motorsport circuit in Poland. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 52.4178,
    "longitude": 16.8058,
    "country_code": "PL",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.aw.poznan.pl/tor-poznan-1",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q9360123",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q9360123",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Automobilklub Wielkopolski :: Tor Poznań"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q789427",
    "name": "Autódromo Internacional do Algarve",
    "slug": "world-q789427",
    "category": "track_day",
    "description": "Autódromo Internacional do Algarve is a motorsport circuit in Portugal. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 37.2294,
    "longitude": -8.63053,
    "country_code": "PT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://autodromodoalgarve.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q789427",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q789427",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Autodromo do Algarve - Official Site - Tickets"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q172890",
    "name": "Circuito do Estoril",
    "slug": "world-q172890",
    "category": "track_day",
    "description": "Circuito do Estoril is a motorsport circuit in Portugal. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 38.750833333,
    "longitude": -9.394166666,
    "country_code": "PT",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.circuito-estoril.pt/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q172890",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q172890",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Circuito Estoril"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q547535",
    "name": "Lusail International Circuit",
    "slug": "world-q547535",
    "category": "track_day",
    "description": "Lusail International Circuit is a motorsport circuit in Qatar. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 25.49,
    "longitude": 51.45417,
    "country_code": "QA",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.lcsc.qa/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q547535",
        "region": "Middle East",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q547535",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Home | Lusail International Circuit"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q96410650",
    "name": "Transilvania Motor Ring",
    "slug": "world-q96410650",
    "category": "track_day",
    "description": "Transilvania Motor Ring is a motorsport circuit in Romania. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 46.435277777,
    "longitude": 24.426944444,
    "country_code": "RO",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://transilvaniamotorring.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q96410650",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q96410650",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Transilvania Motor Ring - Transilvania Motor Ring"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q172894",
    "name": "Anderstorp Raceway",
    "slug": "world-q172894",
    "category": "track_day",
    "description": "Anderstorp Raceway is a motorsport circuit in Sweden. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 57.264166666,
    "longitude": 13.601388888,
    "country_code": "SE",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.srwanderstorp.se/en/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q172894",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q172894",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Start"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q6372583",
    "name": "Karlskoga Motorstadion",
    "slug": "world-q6372583",
    "category": "track_day",
    "description": "Karlskoga Motorstadion is a motorsport circuit in Sweden. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 59.38333333,
    "longitude": 14.51611111,
    "country_code": "SE",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://gellerasen.se/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q6372583",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q6372583",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Start Gelleråsen"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1434982",
    "name": "Mantorp Park",
    "slug": "world-q1434982",
    "category": "track_day",
    "description": "Mantorp Park is a motorsport circuit in Sweden. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 58.371944444,
    "longitude": 15.282777777,
    "country_code": "SE",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.mantorppark.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1434982",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1434982",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Mantorp Park - Sveriges nationalarena för motorsport"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q3544738",
    "name": "Ring Knutstorp",
    "slug": "world-q3544738",
    "category": "track_day",
    "description": "Ring Knutstorp is a motorsport circuit in Sweden. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 55.9875,
    "longitude": 13.11472222,
    "country_code": "SE",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://ringknutstorp.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q3544738",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q3544738",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Ring Knutstorp – Racing förarutbildning i Skåne"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q2359418",
    "name": "Sturup Raceway",
    "slug": "world-q2359418",
    "category": "track_day",
    "description": "Sturup Raceway is a motorsport circuit in Sweden. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 55.53055556,
    "longitude": 13.35555556,
    "country_code": "SE",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://sturupraceway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q2359418",
        "region": "Europe",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q2359418",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Startsida - Sturup Raceway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q5121598",
    "name": "Circuit de Dakar Baobabs",
    "slug": "world-q5121598",
    "category": "track_day",
    "description": "Circuit de Dakar Baobabs is a motorsport circuit in Senegal. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 14.59238889,
    "longitude": -17.02262778,
    "country_code": "SN",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://circuitdedakar.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q5121598",
        "region": "Africa",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q5121598",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Circuit de Dakar Baobabs"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q16307503",
    "name": "Chang International Circuit",
    "slug": "world-q16307503",
    "category": "track_day",
    "description": "Chang International Circuit is a motorsport circuit in Thailand. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 14.962844,
    "longitude": 103.084998,
    "country_code": "TH",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://bric.co.th/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q16307503",
        "region": "Asia",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q16307503",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "bric Chang International Circuit"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q897426",
    "name": "Brainerd International Raceway",
    "slug": "world-q897426",
    "category": "track_day",
    "description": "Brainerd International Raceway is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 46.4171,
    "longitude": -94.2731,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.birmn.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q897426",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q897426",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Brainerd International Raceway Resort"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q59626",
    "name": "Circuit of the Americas",
    "slug": "world-q59626",
    "category": "track_day",
    "description": "Circuit of the Americas is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 30.1328,
    "longitude": -97.6411,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://circuitoftheamericas.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q59626",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q59626",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Home of the World Championships | Circuit of The Americas"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q116619972",
    "name": "Eagles Canyon Raceway",
    "slug": "world-q116619972",
    "category": "track_day",
    "description": "Eagles Canyon Raceway is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 33.366921,
    "longitude": -97.427176,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://eaglescanyon.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q116619972",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q116619972",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Eagles Canyon Raceway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q5517263",
    "name": "Gainesville Raceway",
    "slug": "world-q5517263",
    "category": "drag_acceleration",
    "description": "Gainesville Raceway is a drag-racing venue in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 29.7581,
    "longitude": -82.2747,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://gainesvilleraceway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q5517263",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q5517263",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Home - Gainesville Raceway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q115046013",
    "name": "Harris Hill Raceway",
    "slug": "world-q115046013",
    "category": "track_day",
    "description": "Harris Hill Raceway is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 29.918,
    "longitude": -97.87243,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://harrishillroad.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q115046013",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q115046013",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Harris Hill Raceway (H2R)"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q172732",
    "name": "Indianapolis Motor Speedway",
    "slug": "world-q172732",
    "category": "track_day",
    "description": "Indianapolis Motor Speedway is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 39.794853,
    "longitude": -86.234822,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.indianapolismotorspeedway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q172732",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q172732",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Indianapolis Motor Speedway | Home"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q940069",
    "name": "Lime Rock Park",
    "slug": "world-q940069",
    "category": "track_day",
    "description": "Lime Rock Park is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 41.9277,
    "longitude": -73.3836,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://limerock.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q940069",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q940069",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Home - Lime Rock Park"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q15246008",
    "name": "Maple Grove Raceway",
    "slug": "world-q15246008",
    "category": "drag_acceleration",
    "description": "Maple Grove Raceway is a drag-racing venue in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 40.2127,
    "longitude": -75.9614,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.maplegroveraceway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q15246008",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q15246008",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Home - Maple Grove Raceway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1931770",
    "name": "Mid-Ohio Sports Car Course",
    "slug": "world-q1931770",
    "category": "track_day",
    "description": "Mid-Ohio Sports Car Course is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 40.6893,
    "longitude": -82.6364,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.midohio.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1931770",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1931770",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Mid Ohio Sports Car Course - Home"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q116579634",
    "name": "MotorSport Ranch",
    "slug": "world-q116579634",
    "category": "track_day",
    "description": "MotorSport Ranch is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 32.523841,
    "longitude": -97.616624,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://motorsportranch.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q116579634",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q116579634",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Welcome - MotorSport Ranch"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q6717891",
    "name": "MSR Houston",
    "slug": "world-q6717891",
    "category": "track_day",
    "description": "MSR Houston is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 29.27811,
    "longitude": -95.42244,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://msrhouston.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q6717891",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q6717891",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "MSR Houston"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q14705365",
    "name": "New England Dragway",
    "slug": "world-q14705365",
    "category": "drag_acceleration",
    "description": "New England Dragway is a drag-racing venue in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 43.0208,
    "longitude": -71.0272,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.nedragway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q14705365",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q14705365",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Race Track | New England Dragway | Epping, NH"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q6954900",
    "name": "NOLA Motorsports Park",
    "slug": "world-q6954900",
    "category": "track_day",
    "description": "NOLA Motorsports Park is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 29.8836,
    "longitude": -90.1978,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://nolamotor.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q6954900",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q6954900",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Racing, Karting More in Avondale, LA | NOLA Motorsports Park"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q2662150",
    "name": "Portland International Raceway",
    "slug": "world-q2662150",
    "category": "track_day",
    "description": "Portland International Raceway is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 45.596944,
    "longitude": -122.695833,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://portlandraceway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q2662150",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q2662150",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Portland International Raceway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q648512",
    "name": "Road America",
    "slug": "world-q648512",
    "category": "track_day",
    "description": "Road America is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 43.7975,
    "longitude": -87.9939,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.roadamerica.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q648512",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q648512",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Road America"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q964148",
    "name": "Road Atlanta",
    "slug": "world-q964148",
    "category": "track_day",
    "description": "Road Atlanta is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 34.1467,
    "longitude": -83.8178,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://michelinracewayroadatlanta.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q964148",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q964148",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Michelin Raceway Road Atlanta"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q16919487",
    "name": "Rockingham Dragway",
    "slug": "world-q16919487",
    "category": "drag_acceleration",
    "description": "Rockingham Dragway is a drag-racing venue in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 34.9794,
    "longitude": -79.61475,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://rockinghamdragway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q16919487",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q16919487",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Rockingham Dragway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q7357548",
    "name": "Roebling Road Raceway",
    "slug": "world-q7357548",
    "category": "track_day",
    "description": "Roebling Road Raceway is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 32.1697,
    "longitude": -81.3233,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.roeblingroad.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q7357548",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q7357548",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Roebling Road Raceway Track Located in Bloomingdale Georgia"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q112563",
    "name": "Sonoma Raceway",
    "slug": "world-q112563",
    "category": "track_day",
    "description": "Sonoma Raceway is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 38.160833333,
    "longitude": -122.455,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.sonomaraceway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q112563",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q112563",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Sonoma Raceway: NASCAR Tickets, Events & Schedule"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q7707871",
    "name": "Texas Motorplex",
    "slug": "world-q7707871",
    "category": "drag_acceleration",
    "description": "Texas Motorplex is a drag-racing venue in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 32.3286,
    "longitude": -96.7174,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.texasmotorplex.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q7707871",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q7707871",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Texas Motorplex | Experience the Thrill!"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1423481",
    "name": "WeatherTech Raceway Laguna Seca",
    "slug": "world-q1423481",
    "category": "track_day",
    "description": "WeatherTech Raceway Laguna Seca is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 36.584722222,
    "longitude": -121.752777777,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://weathertechraceway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1423481",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1423481",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "WeatherTech Raceway Laguna Seca"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q1362127",
    "name": "World Wide Technology Raceway at Gateway",
    "slug": "world-q1362127",
    "category": "track_day",
    "description": "World Wide Technology Raceway at Gateway is a motorsport circuit in United States. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": 38.6508,
    "longitude": -90.1354,
    "country_code": "US",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://wwtraceway.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q1362127",
        "region": "North America",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q1362127",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "World Wide Technology Raceway Home Page"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q173766",
    "name": "Killarney Motor Racing Complex",
    "slug": "world-q173766",
    "category": "track_day",
    "description": "Killarney Motor Racing Complex is a motorsport circuit in South Africa. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -33.823713,
    "longitude": 18.529089,
    "country_code": "ZA",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://wpmc.co.za/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q173766",
        "region": "Africa",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q173766",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Western Province Motor Club | Killarney Raceway"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q171667",
    "name": "Kyalami",
    "slug": "world-q171667",
    "category": "track_day",
    "description": "Kyalami is a motorsport circuit in South Africa. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -25.998027777,
    "longitude": 28.068916666,
    "country_code": "ZA",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.kyalamigrandprixcircuit.com/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q171667",
        "region": "Africa",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q171667",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "HOME - Kyalami Grand Prix Circuit"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  },
  {
    "wikidataId": "Q16777468",
    "name": "Zwartkops Raceway",
    "slug": "world-q16777468",
    "category": "track_day",
    "description": "Zwartkops Raceway is a motorsport circuit in South Africa. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.",
    "access_status": "closed_venue",
    "latitude": -25.8101,
    "longitude": 28.1097,
    "country_code": "ZA",
    "city": "",
    "source_label": "Official venue website",
    "source_url": "https://www.zwartkops.co.za/",
    "verification_status": "official_source",
    "verified_at": null,
    "requirements": {
      "catalogImport": {
        "batch": "worldwide-2026-11-02",
        "wikidataId": "Q16777468",
        "region": "Africa",
        "operatorCheckedOn": "2026-11-02",
        "coordinateSource": "https://www.wikidata.org/wiki/Q16777468",
        "coordinateLicense": "CC0-1.0",
        "operatorPageTitle": "Zwartkops Raceway International World of Motoring"
      },
      "disclaimer": "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access."
    }
  }
]
$roadbook_places$::jsonb) as venue(
    "wikidataId" text, name text, slug text, category text, description text,
    access_status text, latitude double precision, longitude double precision,
    country_code text, city text, source_label text, source_url text,
    verification_status text, verified_at timestamptz, requirements jsonb
  )
)
insert into public.roadbook_venues (
  name, slug, category, description, access_status, location, country_code,
  city, source_label, source_url, verification_status, verified_at, requirements, published
)
select i.name, i.slug, i.category, i.description, i.access_status,
  extensions.st_setsrid(extensions.st_makepoint(i.longitude, i.latitude), 4326)::extensions.geography,
  i.country_code, i.city, i.source_label, i.source_url, i.verification_status,
  i.verified_at, i.requirements, true
from incoming i
where not exists (
  select 1 from public.roadbook_venues existing
  where existing.slug = i.slug
    or existing.requirements #>> '{catalogImport,wikidataId}' = i."wikidataId"
    or (
      existing.country_code = i.country_code
      and existing.category in ('track_day','proving_ground','drag_acceleration','drift_circuit')
      and extensions.st_dwithin(existing.location,
        extensions.st_setsrid(extensions.st_makepoint(i.longitude, i.latitude),4326)::extensions.geography, 750)
    )
)
on conflict (slug) do nothing;

do $guard$
begin
  if (select count(*) from public.roadbook_venues
      where requirements #>> '{catalogImport,batch}' = 'worldwide-2026-11-02') <> 120 then
    raise exception 'Worldwide catalog count differs from reviewed batch; no changes committed';
  end if;
end;
$guard$;

commit;
