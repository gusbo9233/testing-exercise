import { Suspense } from 'react';
import MedicalDocumentsClient from './components/MedicalDocumentsClient';
import { FilterOptions } from './types';

async function getInitialData() {
  try {
    const res = await fetch('http://127.0.0.1:3333/options', { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const filterOptions: FilterOptions = await res.json();

    const docsRes = await fetch('http://127.0.0.1:3333/documents', { next: { revalidate: 60 } });
    if (!docsRes.ok) {
      throw new Error(`HTTP error! status: ${docsRes.status}`);
    }
    const { documents } = await docsRes.json();

    return {
      filterOptions,
      initialDocuments: documents,
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return {
      filterOptions: {
        categories: [],
        types: [],
        sortOptions: []
      },
      initialDocuments: []
    };
  }
}

export default async function MedicalDocumentsPage() {
  const { filterOptions, initialDocuments } = await getInitialData();

  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-6xl p-5">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/6 mb-8"></div>
          <div className="flex gap-6">
            <div className="w-1/2 space-y-4">
              <div className="h-12 bg-gray-200 rounded w-full mb-5"></div>
              <div className="flex gap-4 mb-5">
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
            <div className="w-1/2">
              <div className="h-96 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <MedicalDocumentsClient 
        initialFilterOptions={filterOptions}
        initialDocuments={initialDocuments}
      />
    </Suspense>
  );
} 