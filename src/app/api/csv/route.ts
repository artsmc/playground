// Example using a hypothetical database query function (replace with your database logic)
import { NextRequest, NextResponse } from 'next/server';
import { CSVController } from '@/utils/csvHandler';
import { TableFilter } from '@/app/types/types';

// Initialize CSV controller and load data
const csvController = new CSVController();
let isDataLoaded = false;

export async function GET(request: NextRequest) {
  // Load CSV data on first request
  if (!isDataLoaded) {
    try {
      await csvController.loadData('src/lib', 'db.csv');
      isDataLoaded = true;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      return NextResponse.json(
        { error: 'Failed to load CSV data' },
        { status: 500 }
      );
    }
  }
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('pageSize') || '25', 10);
    const sortBy = searchParams.get('sort') || '';
    const order = searchParams.get('direction') as 'asc' | 'desc' | null || 'asc';
    const search = searchParams.get('search') || '';

    // Parse and validate filters
    const filters: Record<string, TableFilter> = {};
    try {
      const filtersParam = searchParams.get('filters');
      if (filtersParam) {
        const parsedFilters = JSON.parse(filtersParam);
        if (typeof parsedFilters === 'object' && parsedFilters !== null) {
          for (const [key, value] of Object.entries(parsedFilters)) {
            if (typeof value === 'object' && value !== null && 
                'operator' in value && 'value' in value) {
              filters[key] = value as TableFilter;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing filters:', error);
      return NextResponse.json(
        { error: 'Invalid filters parameter' },
        { status: 400 }
      );
    }

    // Convert TableFilter to string filters for CSV processing
    const stringFilters: Record<string, string> = {};
    for (const [key, filter] of Object.entries(filters)) {
      stringFilters[key] = filter.value.toString();
    }

    // Process data with pagination, sorting and filtering
    const { data, total } = csvController.processData(
      stringFilters,
      sortBy,
      order,
      page,
      limit,
      search
    );

    const pages = Math.ceil(total / limit);
    return NextResponse.json({ data, total, pages }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error processing CSV data:', error);
    return NextResponse.json(
      { error: 'Error processing CSV data' },
      { status: 500 }
    );
  }
}
