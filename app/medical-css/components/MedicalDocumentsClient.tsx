'use client';

import { useEffect, useState } from 'react';
import { MedicalDocument, FilterOptions, Filters, PerformanceMetric } from '../../medical/types';
import Link from 'next/link';
import '../styles.css';

interface Props {
    initialFilterOptions: FilterOptions;
    initialDocuments: MedicalDocument[];
    fetchDocuments: (searchQuery?: string, category?: string, type?: string) => Promise<{ documents: MedicalDocument[] }>;
    fetchDocument: (id: number) => Promise<MedicalDocument | null>;
    revalidateData: () => Promise<void>;
}

export default function MedicalDocumentsClient({ 
    initialFilterOptions, 
    initialDocuments,
    fetchDocuments,
    fetchDocument,
    revalidateData
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({
        category: 'all',
        type: 'all',
        sortBy: 'name'
    });
    const [filterOptions, setFilterOptions] = useState<FilterOptions>(initialFilterOptions);
    const [documents, setDocuments] = useState<MedicalDocument[]>(initialDocuments || []);
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

        const currentFilters = filters;
        const currentQuery = searchQuery;

        try {
            const response = await fetchDocuments(
                currentQuery,
                currentFilters.category,
                currentFilters.type
            );
            const fetchEnd = performance.now();
            
            const docs = response.documents || [];
            const renderStart = performance.now();

            let finalDocs = [...docs];
            if (currentFilters.sortBy) {
                finalDocs = sortDocuments(finalDocs, currentFilters.sortBy);
            }
            
            setDocuments(finalDocs);
            
            const endTime = performance.now();

            const metrics: PerformanceMetric = {
                timestamp: new Date().toISOString(),
                action: getActionType(currentQuery, currentFilters),
                totalTime: Math.round(endTime - startTime),
                networkTime: Math.round(fetchEnd - fetchStart),
                renderTime: Math.round(endTime - renderStart),
                documentsLoaded: finalDocs.length,
                filtersApplied: Object.entries(currentFilters).filter(([_, v]) => v !== 'all').length,
                searchTerm: currentQuery,
                activeFilters: { ...currentFilters },
                documentSize: new Blob([JSON.stringify(finalDocs)]).size
            };

            setPerformanceData(prevData => {
                const newData = [...prevData, metrics];
                localStorage.setItem('performanceData', JSON.stringify(newData));
                return newData;
            });
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    }

    // Helper function to determine action type
    function getActionType(query: string, currentFilters: Filters): string {
        if (query) return 'Search';
        if (currentFilters.category !== 'all') return 'Category Filter';
        if (currentFilters.type !== 'all') return 'Type Filter';
        if (currentFilters.sortBy === 'name') return 'Sort by Name';
        if (currentFilters.sortBy === 'id') return 'Sort by ID';
        return 'Initial Load';
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
        
        return sortedDocs; // Return sorted docs instead of setting state
    }

    // Function to fetch and display a selected document
    async function selectDocument(doc: MedicalDocument) {
        const selectStart = performance.now();
        const selectedDoc = await fetchDocument(doc.id);
        if (selectedDoc) {
            setSelectedDocument(selectedDoc);
        }
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

    // Watch for changes in search/filters with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadDocuments();
        }, 300); // Add small delay to prevent too many requests

        return () => clearTimeout(timeoutId);
    }, [searchQuery, filters]);

    // Function to refresh data
    async function refreshData() {
        setIsLoading(true);
        try {
            await revalidateData();
            await loadDocuments();
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="container">
            <div className="header">
                <h1 className="title">Medical Journal Documents</h1>
                <div className="button-group">
                    <Link 
                        href="/dashboard"
                        className="button button-secondary"
                    >
                        View Performance Dashboard
                    </Link>
                    <button
                        className="button button-primary"
                        onClick={downloadPerformanceData}
                    >
                        Download Performance Data
                    </button>
                    <button
                        className="button button-secondary"
                        onClick={refreshData}
                    >
                        Refresh Data
                    </button>
                </div>
            </div>
            
            <div className="content">
                {/* Left side: Search, filters, and list */}
                <div className="left-panel">
                    {/* Search Bar */}
                    <div className="search-bar">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search documents..."
                            className="search-input"
                        />
                    </div>

                    {/* Filters Section */}
                    <div className="filters">
                        <select 
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="select"
                        >
                            <option value="all">All Categories</option>
                            {filterOptions.categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <select 
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="select"
                        >
                            <option value="all">All Types</option>
                            {filterOptions.types.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select 
                            value={filters.sortBy}
                            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                            className="select"
                        >
                            {filterOptions.sortOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Results List */}
                    <div className="results">
                        {documents.length === 0 ? (
                            <p className="empty-state">No documents found</p>
                        ) : (
                            <ul className="results-list">
                                {documents.map(doc => (
                                    <button 
                                        key={doc.id}
                                        className={`document-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
                                        onClick={() => selectDocument(doc)}
                                    >
                                        <h3 className="document-title">{doc.title}</h3>
                                        <p className="document-info">Type: {doc.type}</p>
                                        <p className="document-info">Category: {doc.category}</p>
                                        <p className="document-info">Abstract: {doc.abstract}</p>
                                    </button>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                
                {/* Right side: Document details */}
                <div className="right-panel">
                    {selectedDocument ? (
                        <div className="document-detail">
                            <h2 className="detail-title">{selectedDocument.title}</h2>
                            <p className="detail-info">Type: {selectedDocument.type}</p>
                            <p className="detail-info">Category: {selectedDocument.category}</p>
                            <div className="detail-content">
                                <p>{selectedDocument.content}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Select a document to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {isLoading && (
                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>
            )}
        </main>
    );
} 