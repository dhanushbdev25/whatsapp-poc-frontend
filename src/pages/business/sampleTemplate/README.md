# Sample Template

This directory previously contained a sample template implementation that served as an example for creating new business modules in the application.

## Purpose

The sample template was created as a reference implementation demonstrating:

- **Page Structure**: How to organize a business module with pages, components, and hooks
- **API Integration**: How to set up RTK Query API endpoints
- **Form Handling**: How to implement create/edit forms with React Hook Form and Zod validation
- **List/Table Views**: How to display data in a table with Material React Table
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **State Management**: How to integrate with Redux store

## Structure

The sample template followed this structure:

```
sampleTemplate/
├── components/
│   ├── SampleTemplateList.tsx       # Table/list view component
│   ├── SampleTemplateForm.tsx       # Create/edit form dialog
│   └── SampleTemplateDeleteDialog.tsx # Delete confirmation dialog
├── hooks/
│   ├── useSampleTemplateList.ts     # Hook for fetching list
│   ├── useSampleTemplateForm.ts     # Hook for create/update operations
│   └── useSampleTemplateDelete.ts   # Hook for delete operations
├── index.tsx                        # Main page component
└── types.ts                         # TypeScript type definitions
```

## Related Files

The sample template also included:

- **API Definition**: `src/store/api/business/sampleTemplate/sampleTemplate.api.ts`
- **Schemas**: `src/schemas/business/sampleTemplate.schemas.ts`
- **Route Configuration**: Reference in `src/routes/screenList.ts`
- **Store Integration**: Reducer and middleware setup in store files

## Creating a New Module

To create a new business module based on this example:

1. Copy the structure from this directory (if code still exists in version control)
2. Replace "SampleTemplate" with your module name throughout
3. Update API endpoints to match your backend
4. Modify schemas to match your data structure
5. Add route configuration in `src/routes/screenList.ts`
6. Register API in store reducers and middleware

## Note

All code files have been removed, but this README remains as documentation of the example structure that was previously implemented.

