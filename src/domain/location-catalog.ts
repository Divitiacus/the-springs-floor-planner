import type {
  ArchitectureMeasurementStatus,
  FixedArchitectureElement,
  ReferenceFloorplanAsset,
  VenueFloorRegion,
} from "@/domain/floorplan";
import type { InventoryCatalog, InventoryConfiguration } from "@/domain/inventory";
import { createAuroraGroveConfiguration } from "@/domain/venues/aurora-grove";
import { createHavenstoneReserveConfiguration } from "@/domain/venues/havenstone-reserve";
import { createHeritagePineConfiguration } from "@/domain/venues/heritage-pine";
import { createHiddenMagnoliaConfiguration } from "@/domain/venues/hidden-magnolia";
import { createHiddenSpringsRanchConfiguration } from "@/domain/venues/hidden-springs-ranch";
import { createMagnoliaManorConfiguration } from "@/domain/venues/magnolia-manor";
import { createOakviewLodgeConfiguration } from "@/domain/venues/oakview-lodge";
import { createParkerManorConfiguration } from "@/domain/venues/parker-manor";
import { createPoetrySpringsConfiguration } from "@/domain/venues/poetry-springs";
import { createRockwallManorConfiguration } from "@/domain/venues/rockwall-manor";
import { createStonebrookConfiguration } from "@/domain/venues/stonebrook";
import { createStonecreekReserveConfiguration } from "@/domain/venues/stonecreek-reserve";
import { createSunsetPointeConfiguration } from "@/domain/venues/sunset-pointe";
import { createSycamoreGroveConfiguration } from "@/domain/venues/sycamore-grove";
import { createTimberviewLodgeConfiguration } from "@/domain/venues/timberview-lodge";
import { createVillaTuscanaConfiguration } from "@/domain/venues/villa-tuscana";
import { createValleyViewConfiguration } from "@/domain/venues/valley-view";
import { createWestwoodRanchConfiguration } from "@/domain/venues/westwood-ranch";
import { createWillowbrookReserveConfiguration } from "@/domain/venues/willowbrook-reserve";
import { createFarmhouseWallisvilleConfiguration } from "@/domain/venues/farmhouse-wallisville";
import { createTheChateauCypressConfiguration } from "@/domain/venues/the-chateau-cypress";
import { createTuscanyHillConfiguration } from "@/domain/venues/tuscany-hill";
import { createWhiteSparrowConfiguration } from "@/domain/venues/white-sparrow";
import { createWaxahachieConfiguration } from "@/domain/venues/waxahachie";

export type HallLevelConfiguration = {
  id: string;
  slug: string;
  name: string;
  inventoryGroupId?: string;
  physicalWidthInches: number;
  physicalHeightInches: number;
  physicalDimensionStatus: ArchitectureMeasurementStatus;
  physicalDimensionNote?: string;
  fixedArchitecturalElements: readonly FixedArchitectureElement[];
  floorplanAsset: ReferenceFloorplanAsset | null;
  usableAreas?: readonly VenueFloorRegion[];
  voidAreas?: readonly VenueFloorRegion[];
  planningBounds?: { x: number; y: number; width: number; height: number };
  defaultObjectPosition?: { x: number; y: number };
};

type HallConfigurationShared = {
  inventory?: InventoryCatalog;
  sampleLayoutIds?: readonly string[];
};

export type SingleLevelHallConfiguration = HallConfigurationShared & {
  physicalWidthInches: number;
  physicalHeightInches: number;
  physicalDimensionStatus: ArchitectureMeasurementStatus;
  physicalDimensionNote?: string;
  fixedArchitecturalElements: readonly FixedArchitectureElement[];
  floorplanAsset: ReferenceFloorplanAsset | null;
  usableAreas?: readonly VenueFloorRegion[];
  voidAreas?: readonly VenueFloorRegion[];
  planningBounds?: { x: number; y: number; width: number; height: number };
  defaultObjectPosition?: { x: number; y: number };
  levels?: never;
  defaultLevelId?: never;
};

export type MultiLevelHallConfiguration = HallConfigurationShared & {
  levels: readonly HallLevelConfiguration[];
  defaultLevelId: string;
};

export type HallConfiguration = SingleLevelHallConfiguration | MultiLevelHallConfiguration;

export function isMultiLevelHallConfiguration(
  configuration: HallConfiguration,
): configuration is MultiLevelHallConfiguration {
  return "levels" in configuration && Array.isArray(configuration.levels);
}

export type HallCatalogEntry = {
  id: string;
  slug: string;
  name: string;
  configuration: HallConfiguration | null;
};

export type LocationCatalogEntry = {
  id: string;
  slug: string;
  name: string;
  inventory?: InventoryCatalog;
  halls: readonly HallCatalogEntry[];
};

export const MAGNOLIA_INVENTORY: InventoryCatalog = {
  scope: "location-shared",
  limits: {
    "round-table-60": 32,
    "rectangle-table-6": 4,
    "rectangle-table-8": 6,
    "farmhouse-table-6": 0,
    "parson-table-7": 6,
    "sweetheart-table": 1,
    "cocktail-table-32": 6,
    "cocktail-table-36": 0,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms the same table and chair quantities for both Magnolia halls.",
  },
};

export const LAKE_CONROE_INVENTORY: InventoryCatalog = {
  scope: "location-shared",
  limits: {
    "round-table-60": 40,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "farmhouse-table-6": 0,
    "parson-table-7": 6,
    "sweetheart-table": 2,
    "cocktail-table-32": 0,
    "cocktail-table-36": 5,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms the same table and chair quantities for Stonebrook and Heritage Pine.",
  },
};

export const KATY_INVENTORY: InventoryCatalog = {
  scope: "location-shared",
  limits: {
    "round-table-60": 32,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "farmhouse-table-6": 1,
    "parson-table-7": 6,
    "sweetheart-table": 2,
    "cocktail-table-32": 0,
    "cocktail-table-36": 5,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms the same table and chair quantities for Stonecreek Reserve and Villa Tuscana.",
  },
};

export const DENTON_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 40,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "farmhouse-table-6": 0,
    "parson-table-7": 6,
    "sweetheart-table": 2,
    "sweetheart-table-48": 1,
    "cocktail-table-32": 6,
    "cocktail-table-36": 0,
    chairs: 320,
  },
  source: {
    fileName: "user-confirmed",
    note: "Hidden Springs Ranch table quantities are user-confirmed; its previously confirmed guest capacity remains 320.",
  },
};

export const MCKINNEY_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: { ...KATY_INVENTORY.limits },
  source: {
    fileName: "user-confirmed",
    note: "Havenstone Reserve matches Villa Tuscana's table inventory and 320-chair guest capacity.",
  },
};

export const TULSA_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 40,
    "rectangle-table-6": 10,
    "rectangle-table-8": 8,
    "parson-table-7": 6,
    "sweetheart-table-32": 2,
    "half-moon-table": 1,
    "cocktail-table-32": 8,
    chairs: 320,
    defaultSeats: {
      "rectangle-table-6": 6,
      "rectangle-table-8": 8,
    },
  },
  source: {
    fileName: "user-confirmed",
    note: "Sunset Pointe table quantities are user-confirmed. Its previously confirmed 320-chair guest capacity remains unchanged; 6-foot rectangles seat three per side and 8-foot rectangles seat four per side by default.",
  },
};

export const EDMOND_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: { ...KATY_INVENTORY.limits },
  source: {
    fileName: "user-confirmed",
    note: "Willowbrook Reserve matches Stonecreek Reserve's table inventory and 320-chair guest capacity.",
  },
};

export const DENTON_OAKVIEW_LODGE_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 28,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "farmhouse-table-6": 0,
    "parson-table-7": 5,
    "sweetheart-table": 2,
    "sweetheart-table-48": 1,
    "cocktail-table-32": 6,
    "cocktail-table-36": 0,
    chairs: 224,
  },
  source: {
    fileName: "Measurements of The Lodge.pdf",
    note: "Oakview Lodge quantities and 224-chair capacity are confirmed by the supplied measurement sheet and the user's corrected 8-foot-table count.",
  },
};

export const ROCKWALL_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: { ...LAKE_CONROE_INVENTORY.limits },
  source: {
    fileName: "user-confirmed",
    note: "Poetry Springs matches Heritage Pine's planning inventory and 320-chair guest capacity.",
  },
};

export const ANGLETON_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 40,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "farmhouse-table-6": 0,
    "parson-table-7": 6,
    "sweetheart-table": 2,
    "cocktail-table-32": 5,
    "cocktail-table-36": 0,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms these quantities specifically for Sycamore Grove.",
  },
};

export const MAGNOLIA_MANOR_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 40,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "parson-table-7": 6,
    "sweetheart-table": 2,
    "cocktail-table-32": 10,
    "cocktail-table-36": 0,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms these quantities specifically for Magnolia Manor.",
  },
};

export const WEATHERFORD_PARKER_MANOR_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 30,
    "rectangle-table-6": 4,
    "rectangle-table-8": 12,
    "display-table-33": 4,
    "sweetheart-table-33": 3,
    "sweetheart-table-48": 1,
    "cocktail-table-32": 7,
    chairs: 320,
  },
  source: {
    fileName: "Parker Manor table count.pdf",
    note: "The supplied Parker Manor sheet confirms all table quantities; the hall's previously confirmed guest capacity remains 320.",
  },
};

export const ROCKWALL_MANOR_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: { ...MAGNOLIA_MANOR_INVENTORY.limits },
  source: {
    fileName: "user-confirmed",
    note: "Rockwall Manor matches Magnolia Manor's table inventory and 320-chair guest capacity.",
  },
};

export const MCKINNEY_TUSCANY_HILL_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: { ...WEATHERFORD_PARKER_MANOR_INVENTORY.limits },
  source: {
    fileName: "user-confirmed",
    note: "Tuscany Hill matches Parker Manor's table inventory and 320-chair guest capacity.",
  },
};

export const VALLEY_VIEW_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 28,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "parson-table-7": 2,
    "sweetheart-table": 2,
    "cocktail-table-32": 6,
    chairs: 224,
  },
  source: {
    fileName: "user-supplied Valley View plan",
    note: "The table-and-chair key on the supplied Valley View plan confirms these table quantities. The 224-guest capacity was confirmed in a user follow-up.",
  },
};

export const WEATHERFORD_WESTWOOD_RANCH_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 40,
    "rectangle-table-6": 4,
    "rectangle-table-8": 6,
    "parson-table-7": 7,
    "sweetheart-table-33": 3,
    "sweetheart-table-48": 1,
    "cocktail-table-32": 5,
    chairs: 320,
  },
  source: {
    fileName: "Westwood Ranch table count.pdf",
    note: "The supplied Westwood Ranch sheet confirms all table quantities; the hall's previously confirmed guest capacity remains 320.",
  },
};

export const NORMAN_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 40,
    "rectangle-table-6": 8,
    "rectangle-table-8": 10,
    "parson-table-7": 6,
    "sweetheart-table-32": 3,
    "cocktail-table-32": 6,
    chairs: 320,
  },
  source: {
    fileName: "user-confirmed",
    note: "Aurora Grove table quantities are user-confirmed and maintained independently from Katy's Stonecreek Reserve inventory. Its previously confirmed 320-chair guest capacity remains unchanged.",
  },
};

export const ALVARADO_TIMBERVIEW_LODGE_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 28,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "farmhouse-table-6": 0,
    "parson-table-7": 5,
    "sweetheart-table": 2,
    "sweetheart-table-48": 1,
    "cocktail-table-32": 6,
    "cocktail-table-36": 0,
    chairs: 224,
  },
  source: {
    fileName: "temporary-user-direction",
    note: "Timberview Lodge quantities are temporarily copied from Denton Oakview Lodge at the user's direction. This is an independent Alvarado inventory record and should be replaced when Alvarado quantities are confirmed.",
  },
};

export const WALLISVILLE_FARMHOUSE_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-48": 2,
    "round-table-60": 30,
    "rectangle-table-6": 4,
    "rectangle-table-8": 4,
    "farmhouse-table-6": 5,
    "parson-table-7": 4,
    "cocktail-table-32": 5,
    "cocktail-table-36": 2,
    chairs: 250,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms the Wallisville Farmhouse table and chair quantities, including five wooden Farmhouse tables.",
  },
};

export const CYPRESS_CHATEAU_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-72": 30,
    "round-table-48": 2,
    "round-table-60": 20,
    "rectangle-table-6": 6,
    "rectangle-table-8": 12,
    "sweetheart-table": 1,
    "cocktail-table-36": 8,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms the selectable table quantities and 320 chairs for The Chateau, including 30 72-inch round tables.",
  },
};

export const WHITE_SPARROW_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-48": 1,
    "round-table-60": 28,
    "rectangle-table-6": 2,
    "rectangle-table-8": 4,
    "farmhouse-table-6": 1,
    "farmhouse-table-8": 8,
    "parson-table-5": 2,
    "side-table-wood": 2,
    "cocktail-table-plastic": 4,
    "cocktail-table-white-wood": 5,
    "display-table-32": 1,
    chairs: 200,
  },
  source: {
    fileName: "user-supplied White Sparrow floor plans",
    note: "The indoor planner is limited to 200 brown cross-back chairs. The additional 200 white garden chairs belong to the outside ceremony site and are documented separately. Cocktail-table diameters and wooden-side-table dimensions were not specified, so their planning footprints remain unconfigured.",
  },
  additionalItems: [
    { sourceItemKey: "white-garden-chairs", name: "White garden chairs", quantity: 200, note: "Outside ceremony site; excluded from indoor seating inventory" },
    { sourceItemKey: "brown-cross-back-chairs", name: "Brown cross-back chairs", quantity: 200, note: "Indoor reception seating inventory" },
    { sourceItemKey: "farmhouse-table-6-rental", name: "6-foot rectangular farmhouse table", quantity: 1, note: "Rental: $40" },
    { sourceItemKey: "farmhouse-table-8-rental", name: "8-foot rectangular farmhouse tables", quantity: 8, note: "Rental: $50 each" },
  ],
};

export const WAXAHACHIE_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-72": 30,
    "round-table-48": 4,
    "rectangle-table-8": 8,
    "rectangle-table-6": 4,
    "sweetheart-table": 1,
    "cocktail-table-32": 5,
    chairs: 300,
  },
  source: {
    fileName: "user-confirmed",
    note: "Waxahachie table quantities and 300-chair seating capacity are user-confirmed.",
  },
};

export const SPRINGS_LOCATIONS: readonly LocationCatalogEntry[] = [
  {
    id: "location_magnolia",
    slug: "magnolia",
    name: "Magnolia",
    inventory: MAGNOLIA_INVENTORY,
    halls: [
      {
        id: "hall_pinehaven_terrace",
        slug: "pinehaven-terrace",
        name: "Pinehaven Terrace",
        configuration: createHiddenMagnoliaConfiguration(),
      },
      {
        id: "hall_hidden_magnolia",
        slug: "the-hidden-magnolia",
        name: "The Hidden Magnolia",
        configuration: createHiddenMagnoliaConfiguration(),
      },
    ],
  },
  {
    id: "location_lake_conroe",
    slug: "lake-conroe",
    name: "Lake Conroe",
    inventory: LAKE_CONROE_INVENTORY,
    halls: [
      {
        id: "hall_stonebrook",
        slug: "stonebrook",
        name: "Stonebrook",
        configuration: createStonebrookConfiguration(),
      },
      {
        id: "hall_heritage_pine",
        slug: "heritage-pine",
        name: "Heritage Pine",
        configuration: createHeritagePineConfiguration(),
      },
    ],
  },
  {
    id: "location_katy",
    slug: "katy",
    name: "Katy",
    inventory: KATY_INVENTORY,
    halls: [
      {
        id: "hall_stonecreek_reserve",
        slug: "stonecreek-reserve",
        name: "Stonecreek Reserve",
        configuration: createStonecreekReserveConfiguration(),
      },
      {
        id: "hall_villa_tuscana",
        slug: "villa-tuscana",
        name: "Villa Tuscana",
        configuration: createVillaTuscanaConfiguration(),
      },
    ],
  },
  {
    id: "location_denton",
    slug: "denton",
    name: "Denton",
    halls: [
      {
        id: "hall_hidden_springs_ranch",
        slug: "hidden-springs-ranch",
        name: "Hidden Springs Ranch",
        configuration: {
          ...createHiddenSpringsRanchConfiguration(),
          inventory: DENTON_INVENTORY,
        },
      },
      {
        id: "hall_oakview_lodge",
        slug: "oakview-lodge",
        name: "Oakview Lodge",
        configuration: {
          ...createOakviewLodgeConfiguration(),
          inventory: DENTON_OAKVIEW_LODGE_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_alvarado",
    slug: "alvarado",
    name: "Alvarado",
    halls: [
      {
        id: "hall_timberview_lodge",
        slug: "timberview-lodge",
        name: "Timberview Lodge",
        configuration: {
          ...createTimberviewLodgeConfiguration(),
          inventory: ALVARADO_TIMBERVIEW_LODGE_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_waxahachie",
    slug: "waxahachie",
    name: "Waxahachie",
    halls: [
      {
        id: "hall_waxahachie",
        slug: "waxahachie",
        name: "Waxahachie",
        configuration: {
          ...createWaxahachieConfiguration(),
          inventory: WAXAHACHIE_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_rockwall",
    slug: "rockwall",
    name: "Rockwall",
    halls: [
      {
        id: "hall_poetry_springs",
        slug: "poetry-springs",
        name: "Poetry Springs",
        configuration: {
          ...createPoetrySpringsConfiguration(),
          inventory: ROCKWALL_INVENTORY,
        },
      },
      {
        id: "hall_rockwall_manor",
        slug: "rockwall-manor",
        name: "Rockwall Manor",
        configuration: {
          ...createRockwallManorConfiguration(),
          inventory: ROCKWALL_MANOR_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_angleton",
    slug: "angleton",
    name: "Angleton",
    halls: [
      {
        id: "hall_sycamore_grove",
        slug: "sycamore-grove",
        name: "Sycamore Grove",
        configuration: { ...createSycamoreGroveConfiguration(), inventory: ANGLETON_INVENTORY },
      },
      {
        id: "hall_magnolia_manor",
        slug: "magnolia-manor",
        name: "Magnolia Manor",
        configuration: { ...createMagnoliaManorConfiguration(), inventory: MAGNOLIA_MANOR_INVENTORY },
      },
    ],
  },
  {
    id: "location_valley_view",
    slug: "valley-view",
    name: "Valley View",
    halls: [
      {
        id: "hall_valley_view",
        slug: "valley-view",
        name: "Valley View",
        configuration: {
          ...createValleyViewConfiguration(),
          inventory: VALLEY_VIEW_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_mckinney",
    slug: "mckinney",
    name: "McKinney",
    halls: [
      {
        id: "hall_havenstone_reserve",
        slug: "havenstone-reserve",
        name: "Havenstone Reserve",
        configuration: {
          ...createHavenstoneReserveConfiguration(),
          inventory: MCKINNEY_INVENTORY,
        },
      },
      {
        id: "hall_tuscany_hill",
        slug: "tuscany-hill",
        name: "Tuscany Hill",
        configuration: {
          ...createTuscanyHillConfiguration(),
          inventory: MCKINNEY_TUSCANY_HILL_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_tulsa",
    slug: "tulsa",
    name: "Tulsa",
    halls: [
      {
        id: "hall_sunset_pointe",
        slug: "sunset-pointe",
        name: "Sunset Pointe",
        configuration: {
          ...createSunsetPointeConfiguration(),
          inventory: TULSA_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_edmond",
    slug: "edmond",
    name: "Edmond",
    halls: [
      {
        id: "hall_willowbrook_reserve",
        slug: "willowbrook-reserve",
        name: "Willowbrook Reserve",
        configuration: {
          ...createWillowbrookReserveConfiguration(),
          inventory: EDMOND_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_norman",
    slug: "norman",
    name: "Norman",
    halls: [
      {
        id: "hall_aurora_grove",
        slug: "aurora-grove",
        name: "Aurora Grove",
        configuration: {
          ...createAuroraGroveConfiguration(),
          inventory: NORMAN_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_weatherford",
    slug: "weatherford",
    name: "Weatherford",
    halls: [
      {
        id: "hall_parker_manor",
        slug: "parker-manor",
        name: "Parker Manor",
        configuration: {
          ...createParkerManorConfiguration(),
          inventory: WEATHERFORD_PARKER_MANOR_INVENTORY,
        },
      },
      {
        id: "hall_westwood_ranch",
        slug: "westwood-ranch",
        name: "Westwood Ranch",
        configuration: {
          ...createWestwoodRanchConfiguration(),
          inventory: WEATHERFORD_WESTWOOD_RANCH_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_wallisville",
    slug: "wallisville",
    name: "Wallisville",
    halls: [
      {
        id: "hall_farmhouse_wallisville",
        slug: "farmhouse",
        name: "Farmhouse",
        configuration: {
          ...createFarmhouseWallisvilleConfiguration(),
          inventory: WALLISVILLE_FARMHOUSE_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_cypress",
    slug: "cypress",
    name: "Cypress",
    halls: [
      {
        id: "hall_the_chateau_cypress",
        slug: "the-chateau",
        name: "The Chateau",
        configuration: {
          ...createTheChateauCypressConfiguration(),
          inventory: CYPRESS_CHATEAU_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_white_sparrow",
    slug: "white-sparrow",
    name: "White Sparrow",
    halls: [
      {
        id: "hall_white_sparrow",
        slug: "white-sparrow",
        name: "White Sparrow",
        configuration: {
          ...createWhiteSparrowConfiguration(),
          inventory: WHITE_SPARROW_INVENTORY,
        },
      },
    ],
  },
];

export function resolveInventoryConfiguration(
  location: LocationCatalogEntry,
  hall: HallCatalogEntry,
): InventoryConfiguration {
  return {
    ...(location.inventory?.limits ?? {}),
    ...(hall.configuration?.inventory?.limits ?? {}),
  };
}

export function getLocationBySlug(slug: string | undefined) {
  return SPRINGS_LOCATIONS.find((location) => location.slug === slug);
}

export function getHallBySlug(location: LocationCatalogEntry | undefined, slug: string | undefined) {
  return location?.halls.find((hall) => hall.slug === slug);
}
