const DEPARTMENTS = {
  ROADS: 'Roads & Infrastructure',
  SANITATION: 'Sanitation & Waste Management',
  WATER_SUPPLY: 'Water Supply & Sewerage',
  ELECTRICITY: 'Electricity & Street Lighting',
  PARKS: 'Parks & Horticulture',
  DRAINAGE: 'Stormwater & Drainage',
  HEALTH: 'Public Health',
  BUILDING: 'Building & Permits'
};

const DEPARTMENT_CODES = Object.keys(DEPARTMENTS);

const CATEGORY_TO_DEPARTMENT = {
  pothole: 'ROADS',
  road: 'ROADS',
  garbage: 'SANITATION',
  waste: 'SANITATION',
  sewer: 'WATER_SUPPLY',
  water: 'WATER_SUPPLY',
  light: 'ELECTRICITY',
  electricity: 'ELECTRICITY',
  park: 'PARKS',
  tree: 'PARKS',
  drainage: 'DRAINAGE',
  flood: 'DRAINAGE',
  health: 'HEALTH',
  building: 'BUILDING'
};

module.exports = {
  DEPARTMENTS,
  DEPARTMENT_CODES,
  CATEGORY_TO_DEPARTMENT
};
