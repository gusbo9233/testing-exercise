'use client';

import { useEffect, useState } from 'react';
import { MedicalDocument, FilterOptions, Filters, PerformanceMetric } from '../types';
import Link from 'next/link';

interface Props {
    initialFilterOptions: FilterOptions;
    initialDocuments: MedicalDocument[];
}

export default function MedicalDocumentsClient({ initialFilterOptions, initialDocuments }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({
        category: 'all',
        type: 'all',
        sortBy: 'name'
    });
    const [filterOptions, setFilterOptions] = useState<FilterOptions>(initialFilterOptions);
    const [documents, setDocuments] = useState<MedicalDocument[]>(initialDocuments);
    const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);

    // Function to download performance data
    function downloadPerformanceData() {
        const headers = [
            'Timestamp',
            'Action',
            'Total Time (ms)',
            'Network Time (ms)',
            'Render Time (ms)',
            'Sort Time (ms)',
            'Documents Loaded',
            'Document Size (bytes)',
            'Filters Applied',
            'Search Term',
            'Active Category',
            'Active Type',
            'Sort Method'
        ];

        const csv = [
            headers.join(','),
            ...performanceData.map(row => [
                row.timestamp,
                row.action,
                row.totalTime,
                row.networkTime || '',
                row.renderTime || '',
                row.sortTime || '',
                row.documentsLoaded,
                row.documentSize || '',
                row.filtersApplied,
                row.searchTerm || '',
                row.activeFilters?.category || 'all',
                row.activeFilters?.type || 'all',
                row.activeFilters?.sortBy || 'name'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'performance_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Function to load documents
    async function loadDocuments() {
        setIsLoading(true);
        const startTime = performance.now();
        const fetchStart = performance.now();

        const action = searchQuery ? 'Search' :
            filters.category !== 'all' ? 'Category Filter' :
            filters.type !== 'all' ? 'Type Filter' :
            filters.sortBy === 'name' ? 'Sort by Name' :
            filters.sortBy === 'id' ? 'Sort by ID' : 
            'Initial Load';

        let params = new URLSearchParams();
        if (searchQuery) {
            params.append('search', searchQuery);
        }
        if (filters.category && filters.category !== 'all') {
            params.append('category', filters.category);
        }
        if (filters.type && filters.type !== 'all') {
            params.append('type', filters.type);
        }

        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        try {
            const res = await fetch(`http://127.0.0.1:3333/documents${queryString}`);
            const fetchEnd = performance.now();
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const response = await res.json();
            const docs = response.documents;
            const renderStart = performance.now();
            
            setDocuments(docs);
            
            await new Promise(resolve => setTimeout(resolve, 0));
            const endTime = performance.now();

            const metrics: PerformanceMetric = {
                timestamp: new Date().toISOString(),
                action,
                totalTime: Math.round(endTime - startTime),
                networkTime: Math.round(fetchEnd - fetchStart),
                renderTime: Math.round(endTime - renderStart),
                documentsLoaded: docs.length,
                filtersApplied: Object.entries(filters).filter(([_, v]) => v !== 'all').length,
                searchTerm: searchQuery,
                activeFilters: { ...filters },
                documentSize: new Blob([JSON.stringify(docs)]).size
            };

            setPerformanceData(prevData => {
                const newData = [...prevData, metrics];
                localStorage.setItem('performanceData', JSON.stringify(newData));
                return newData;
            });

            sortDocuments(docs, filters.sortBy);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    }

    // Sorting function
    function sortDocuments(docs: MedicalDocument[], sortBy: string) {
        const sortStart = performance.now();
        const sortedDocs = [...docs];
        
        if (sortBy === 'name') {
            sortedDocs.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'id') {
            sortedDocs.sort((a, b) => a.id - b.id);
        }
        
        const sortEnd = performance.now();
        console.log(`Sort Time (${sortBy}): ${Math.round(sortEnd - sortStart)}ms`);
        
        setDocuments(sortedDocs);
    }

    // Function to fetch and display a selected document
    async function selectDocument(doc: MedicalDocument) {
        const selectStart = performance.now();
        const res = await fetch(`http://127.0.0.1:3333/documents/${doc.id}`);
        const selectedDoc = await res.json();
        setSelectedDocument(selectedDoc);
        const selectEnd = performance.now();
        console.log(`Document Selection Time: ${Math.round(selectEnd - selectStart)}ms`);
    }

    // Load performance data from localStorage
    useEffect(() => {
        const storedData = localStorage.getItem('performanceData');
        if (storedData) {
            setPerformanceData(JSON.parse(storedData));
        }
    }, []);

    // Watch for changes in search/filters
    useEffect(() => {
        loadDocuments();
    }, [searchQuery, filters]);

    return (
        <main className="container mx-auto max-w-6xl p-5 bg-white text-black">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-black">Medical Journal Documents</h1>
                <div className="space-x-4">
                    <Link 
                        href="/dashboard"
                        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                    >
                        View Performance Dashboard
                    </Link>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={downloadPerformanceData}
                    >
                        Download Performance Data
                    </button>
                </div>
            </div>
            
            <div className="flex gap-6">
                {/* Left side: Search, filters, and list */}
                <div className="w-1/2 flex flex-col">
                    {/* Search Bar */}
                    <div className="mb-5">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search documents..."
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
                        />
                    </div>

                    {/* Filters Section */}
                    <div className="flex flex-wrap gap-4 mb-5">
                        <select 
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                        >
                            <option value="all">All Categories</option>
                            {filterOptions.categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <select 
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                        >
                            <option value="all">All Types</option>
                            {filterOptions.types.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select 
                            value={filters.sortBy}
                            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                        >
                            {filterOptions.sortOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Results List - Now scrollable */}
                    <div className="results flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                        {documents.length === 0 ? (
                            <p className="text-black text-center py-4">No documents found</p>
                        ) : (
                            <ul className="space-y-4 pr-2">
                                {documents.map(doc => (
                                    <button 
                                        key={doc.id}
                                        className={`w-full text-left border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white
                                                ${selectedDocument?.id === doc.id ? 'ring-2 ring-blue-500' : ''}`}
                                        onClick={() => selectDocument(doc)}
                                    >
                                        <h3 className="text-xl font-semibold mb-2 text-black">{doc.title}</h3>
                                        <p className="text-black">Type: {doc.type}</p>
                                        <p className="text-black">Category: {doc.category}</p>
                                        <p className="text-black">Abstract: {doc.abstract}</p>
                                    </button>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                
                {/* Right side: Document details */}
                <div className="w-1/2 sticky top-5" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                    {selectedDocument ? (
                        <div className="document-detail p-6 border border-gray-200 rounded-lg bg-white">
                            <h2 className="text-2xl font-bold mb-2 text-black">{selectedDocument.title}</h2>
                            <p className="text-black mb-2">Type: {selectedDocument.type}</p>
                            <p className="text-black mb-2">Category: {selectedDocument.category}</p>
                            <div className="prose max-w-none">
                                <p className="mb-4 text-black">{selectedDocument.content}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-black bg-white rounded-lg border border-gray-200">
                            <p>Select a document to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-1">
                    <div className="h-full bg-blue-500 animate-pulse"></div>
                </div>
            )}
        </main>
    );
} 