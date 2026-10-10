import { approvedDataSources } from './mockData.js';

export class DataService {
  /**
   * Get an approved data source by ID.
   * Throws or returns null if source is not in the approved catalog.
   */
  static getDataSource(id, filterOptions = {}) {
    if (!approvedDataSources[id]) {
      throw new Error(`Data source '${id}' is not in the approved catalog.`);
    }

    const source = structuredClone(approvedDataSources[id]);

    // Apply client-side filters if provided (e.g. region filter on sales data)
    if (filterOptions.region && id === 'sales-by-region') {
      source.data = source.data.filter(r => 
        r.region.toLowerCase().includes(filterOptions.region.toLowerCase())
      );
    }

    if (filterOptions.region && id === 'sales-summary') {
      if (filterOptions.region === 'North America - West') {
        source.data.activeRegion = 'North America - West';
        source.data.totalRevenue = '$310,000';
        source.data.revenueChange = '-24.6%';
        source.data.closedDeals = 34;
        source.data.dealsChange = '-28.2%';
      } else if (filterOptions.region === 'North America - East') {
        source.data.activeRegion = 'North America - East';
        source.data.totalRevenue = '$480,000';
        source.data.revenueChange = '-3.1%';
      }
    }

    return source;
  }

  static getCatalog() {
    return Object.keys(approvedDataSources).map(id => ({
      id,
      name: approvedDataSources[id].name,
      type: approvedDataSources[id].type,
      lastUpdated: approvedDataSources[id].lastUpdated,
    }));
  }

  static isValidSourceId(id) {
    return Boolean(approvedDataSources[id]);
  }
}
