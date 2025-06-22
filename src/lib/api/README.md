# API Service Layer

This directory contains the service layer for API calls in the HistoScope application. The services are organized by domain to make the codebase more maintainable.

## Structure

- `client.ts` - Base API client with Axios configuration and interceptors
- `index.ts` - Exports all services
- `images.ts` - Image-related API calls
- `masks.ts` - Mask-related API calls
- `features.ts` - Feature-related API calls
- `ai.ts` - AI model-related API calls
- `monitoring.ts` - System monitoring API calls

## Usage

Import the API functions directly from the API root:

```typescript
import { getImages, uploadImage, getModelStatus } from "@/api";

// Use the imported functions
const images = await getImages(1);
```

## Adding New Services

To add a new service:

1. Create a new file in the `api` directory
2. Export the service functions
3. Add the export to `index.ts`

##
