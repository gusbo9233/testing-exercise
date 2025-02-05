export type MedicalDocument = {
    id: number;
    title: string;
    type: string;
    category: string;
    abstract: string;
    content: string;
};

export type FilterOptions = {
    categories: string[];
    types: string[];
    sortOptions: {value: string; label: string}[];
};

export type Filters = {
    category: string;
    type: string;
    sortBy: string;
};

export type PerformanceMetric = {
    timestamp: string;
    action: string;
    totalTime: number;
    networkTime?: number;
    renderTime?: number;
    sortTime?: number;
    documentsLoaded: number;
    documentSize?: number;
    filtersApplied: number;
    searchTerm?: string;
    activeFilters?: {
        category: string;
        type: string;
        sortBy: string;
    };
}; 