import { Suspense } from 'react';
import { revalidatePath } from 'next/cache';
import MedicalDocumentsClient from './components/MedicalDocumentsClient';

// Server actions for data fetching
async function fetchDocuments(searchQuery?: string, category?: string, type?: string) {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (category && category !== 'all') params.append('category', category);
  if (type && type !== 'all') params.append('type', type);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  // Don't cache search results, but cache filtered results for 30 seconds
  const options = searchQuery ? 
    { cache: 'no-store' as RequestCache } : 
    { next: { revalidate: 30 } };

  const res = await fetch(`http://127.0.0.1:3333/documents${queryString}`, options);
  
  if (!res.ok) return { documents: [] };
  return res.json();
}

async function fetchDocument(id: number) {
  // Cache individual document views for 1 minute
  const res = await fetch(`http://127.0.0.1:3333/documents/${id}`, {
    next: { revalidate: 60 }
  });
  
  if (!res.ok) return null;
  return res.json();
}

// Function to manually revalidate the page
export async function revalidateData() {
  'use server';
  revalidatePath('/medical-css');
}

async function getInitialData() {
  try {
    const [filterOptionsRes, documentsRes] = await Promise.all([
      // Cache filter options for 5 minutes as they rarely change
      fetch('http://127.0.0.1:3333/options', {
        next: { revalidate: 300 }
      }),
      // Cache initial document list for 30 seconds
      fetch('http://127.0.0.1:3333/documents', {
        next: { revalidate: 30 }
      })
    ]);

    if (!filterOptionsRes.ok || !documentsRes.ok) {
      console.error('API Error:', {
        filterOptions: filterOptionsRes.status,
        documents: documentsRes.status
      });
      return {
        initialFilterOptions: {
          categories: [],
          types: [],
          sortOptions: [
            { value: 'name', label: 'Sort by Name' },
            { value: 'id', label: 'Sort by ID' }
          ]
        },
        initialDocuments: [],
        fetchDocuments,
        fetchDocument,
        revalidateData
      };
    }

    const [filterOptions, documentsData] = await Promise.all([
      filterOptionsRes.json(),
      documentsRes.json()
    ]);

    return {
      initialFilterOptions: filterOptions,
      initialDocuments: documentsData.documents || [],
      fetchDocuments,
      fetchDocument,
      revalidateData
    };
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    return {
      initialFilterOptions: {
        categories: [],
        types: [],
        sortOptions: [
          { value: 'name', label: 'Sort by Name' },
          { value: 'id', label: 'Sort by ID' }
        ]
      },
      initialDocuments: [],
      fetchDocuments,
      fetchDocument,
      revalidateData
    };
  }
}

// Enable dynamic rendering but with caching
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Cache the page for 30 seconds

export default async function MedicalDocumentsPage() {
  const initialData = await getInitialData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MedicalDocumentsClient {...initialData} />
    </Suspense>
  );
} 