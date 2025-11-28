import { useState, useMemo, useCallback } from 'react';

const usePagination = (data, itemsPerPage = 4) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(() => 
        Math.ceil(data.length / itemsPerPage), 
        [data.length, itemsPerPage]
    );

    const startIndex = useMemo(() => 
        (currentPage - 1) * itemsPerPage, 
        [currentPage, itemsPerPage]
    );

    const endIndex = useMemo(() => 
        startIndex + itemsPerPage, 
        [startIndex, itemsPerPage]
    );

    const paginatedData = useMemo(() => 
        data.slice(startIndex, endIndex), 
        [data, startIndex, endIndex]
    );

    const goToPrevPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    }, [currentPage]);

    const goToNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    }, [currentPage, totalPages]);

    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const paginationItems = useCallback((maxVisiblePages = 5) => {
        const items = [];
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        for (let page = startPage; page <= endPage; page++) {
            items.push({
                page,
                isActive: currentPage === page
            });
        }

        return {
            pages: items,
            showStartEllipsis: startPage > 2,
            showEndEllipsis: endPage < totalPages - 1
        };
    }, [currentPage, totalPages]);

    return {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        paginatedData,
        goToPrevPage,
        goToNextPage,
        goToPage,
        paginationItems,
        setCurrentPage
    };
};

export default usePagination;
