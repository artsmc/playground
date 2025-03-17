import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
// We're using generic Record<string, string> for CSV data

const readFileAsync = promisify(fs.readFile);

/**
 * Parses a CSV string into an array of objects
 * @param csvString The CSV string to parse
 * @returns An array of objects representing the CSV data
 */
export function parseCSV(csvString: string): Record<string, string>[] {
  // Split the CSV string into lines
  const lines = csvString.split('\n');
  // Extract the header row and parse it into column names
  const headers = parseCSVLine(lines[0]);
  
  // Process each data row
  const result = lines.slice(1)
    .filter(line => line.trim() !== '') // Skip empty lines
    .map(line => {
      const values = parseCSVLine(line);
      
      // Create an object from the headers and values
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        if (index < values.length) {
          obj[header] = values[index];
        } else {
          obj[header] = '';
        }
      });
      
      // Add an id field if it doesn't exist
      if (!obj['id'] && obj['title']) {
        // Create a simple hash from the title or first field
        obj['id'] = `row-${hashString(obj['title'] || Object.values(obj)[0] || '')}`;
      }
      
      return obj;
    });
  
  return result;
}

/**
 * Parses a single CSV line, properly handling quoted values
 * @param line The CSV line to parse
 * @returns An array of values from the line
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Check if this is an escaped quote (double quote inside quoted string)
      if (insideQuotes && i + 1 < line.length && line[i + 1] === '"') {
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last value
  values.push(currentValue.trim());
  
  // Clean up any remaining quotes at the start/end of values
  return values.map(value => value.replace(/^"|"$/g, ''));
}

/**
 * Creates a simple hash from a string
 * @param str The string to hash
 * @returns A numeric hash code
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Gets CSV data from a file
 * @param bucket The bucket or directory where the file is located
 * @param fileName The name of the CSV file
 * @returns An array of objects representing the CSV data
 */
export async function getCSVData(bucket: string, fileName: string): Promise<Record<string, string>[]> {
  try {
    // In a real application, this might fetch from S3 or another storage service
    // For this example, we'll read from the local filesystem
    const filePath = path.join(process.cwd(), 'src', 'lib', fileName);
    const data = await readFileAsync(filePath, 'utf8');
    return parseCSV(data);
  } catch (error) {
    console.error(`Error reading CSV file: ${error}`);
    throw new Error(`Failed to read CSV data: ${error}`);
  }
}

/**
 * Controller class for handling CSV data operations
 */
export class CSVController {
  private data: Record<string, string>[] = [];
  private cache: {
    data: Record<string, string>[];
    timestamp: number;
  } | null = null;
  
  /**
   * Gets cached data if it's still valid
   * @returns Cached data or null if cache is invalid
   */
  getCachedData(): { data: Record<string, string>[]; total: number } | null {
    if (this.cache && Date.now() - this.cache.timestamp < 300000) { // 5 minutes
      return {
        data: this.cache.data,
        total: this.cache.data.length
      };
    }
    return null;
  }

  /**
   * Updates the cache with new data
   * @param data The data to cache
   */
  private setCachedData(data: Record<string, string>[]): void {
    this.cache = {
      data,
      timestamp: Date.now()
    };
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache = null;
  }

  /**
   * Loads CSV data from a file
   * @param bucket The bucket or directory where the file is located
   * @param fileName The name of the CSV file
   */
  async loadData(bucket: string, fileName: string): Promise<void> {
    this.data = await getCSVData(bucket, fileName);
    this.setCachedData(this.data);
  }
  
  /**
   * Gets the loaded CSV data
   * @returns The loaded CSV data
   */
  getData(): Record<string, string>[] {
    return this.data;
  }
  
  /**
   * Filters the CSV data based on the provided filters
   * @param filters An object containing key-value pairs to filter by
   * @returns Filtered CSV data
   */
  filterData(filters: Record<string, string>): Record<string, string>[] {
    return this.data.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        const rowValue = row[key];
        return rowValue && rowValue.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }
  
  /**
   * Sorts the CSV data by a specific column
   * @param sortBy The column to sort by
   * @param order The sort order ('asc' or 'desc')
   * @returns Sorted CSV data
   */
  sortData(sortBy: string, order: 'asc' | 'desc', data?: Record<string, string>[]): Record<string, string>[] {
    const targetData = data || this.data;
    return [...targetData].sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      // Try to compare as numbers if possible
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return order === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Otherwise compare as strings
      return order === 'asc' 
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });
  }
  
  /**
   * Paginates the CSV data
   * @param page The page number (1-based)
   * @param pageSize The number of items per page
   * @returns Paginated CSV data
   */
  paginateData(page: number, pageSize: number): Record<string, string>[] {
    const start = (page - 1) * pageSize;
    return this.data.slice(start, start + pageSize);
  }
  
  /**
   * Applies filtering, sorting, and pagination to the CSV data
   * @param filters An object containing key-value pairs to filter by
   * @param sortBy The column to sort by
   * @param order The sort order ('asc' or 'desc')
   * @param page The page number (1-based)
   * @param pageSize The number of items per page
   * @returns Processed CSV data and total count
   */
  processData(
    filters: Record<string, string>,
    sortBy: string,
    order: 'asc' | 'desc',
    page: number,
    pageSize: number,
    search?: string
  ): { data: Record<string, string>[]; total: number } {
    // Check if we have cached data that matches the filters
    if (Object.keys(filters).length === 0) {
      const cached = this.getCachedData();
      if (cached) {
        // Apply sorting to cached data
        const sorted = this.sortData(sortBy, order, cached.data);
        return {
          data: sorted.slice((page - 1) * pageSize, page * pageSize),
          total: sorted.length
        };
      }
    }

    // Apply filters
    let result = this.filterData(filters);
    
    // Apply global search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(value => 
          value.toString().toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Apply sorting
    result = this.sortData(sortBy, order, result);
    
    // Get total count before pagination
    const total = result.length;
    
    // Cache the filtered and sorted data if there are no filters
    if (Object.keys(filters).length === 0) {
      this.setCachedData(result);
    }
    
    // Apply pagination
    result = result.slice((page - 1) * pageSize, page * pageSize);
    
    return { data: result, total };
  }
}
