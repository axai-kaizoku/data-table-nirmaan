# Data Table Spotify

A feature-rich data table built with React, TanStack Table, and Tailwind CSS, showcasing advanced filtering, sorting, and search capabilities.

[live preview](https://data-table-spotify.netlify.app/)

## Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Features

- **Server-side pagination** - Efficient data loading with configurable page sizes
- **Multi-column sorting** - Sort by multiple columns simultaneously
- **Advanced filtering** - Faceted filters, date range filters, and slider filters for numeric values
- **Global search** - Search across multiple columns with debouncing
- **Data export** - Export filtered/sorted data to CSV
- **Loading states** - Skeleton loaders and error handling with retry
- **Responsive design** - Mobile-friendly with column visibility controls
- **Type-safe** - Full TypeScript support throughout

## Dataset

Using the Spotify Songs dataset (32,000+ tracks) because it offers:

- Rich variety of data types (strings, numbers, dates)
- Real-world complexity with multiple filterable dimensions
- Good size for demonstrating pagination and performance
- Interesting use case that's relatable and engaging

## Technology Decisions

**TanStack Table v8** - Industry standard for complex tables, provides excellent API for server-side operations and state management.

**TanStack Query** - Handles data fetching with caching, loading states, and error handling out of the box. Reduces boilerplate significantly.

**Radix UI** - Accessible, unstyled components that work well with Tailwind. Better than building from scratch or using heavy component libraries.

**Tailwind CSS v4** - Rapid styling with the new Vite plugin. Keeps bundle size small and development fast.

**Custom hooks pattern** - Extracted state management logic into focused hooks (usePagination, useSorting, useColumnFilters) for better maintainability and testability.

**Debouncing** - Applied to filters and search to reduce unnecessary API calls and improve performance.

## Trade-offs

- Mock API with artificial delay simulates real-world latency but adds development friction
- Client-side filtering on mock data instead of true server-side (would need backend in production)

## Known Limitations

- Mock API has random failure rate for testing error states
- Date filters could use better UX with presets (last 7 days, etc.)
- No column resizing or reordering (could add with dnd-kit)
- Export doesn't preserve column order/visibility preferences
- Doesn't have virtualization for large datasets

## Future Improvements

- Add row selection with bulk actions
- Implement column pinning for horizontal scrolling
- Add saved filter presets
- Implement infinite scroll as alternative to pagination
- Manage state in url params
