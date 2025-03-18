import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
	// Generate page numbers to display
	const getPageNumbers = () => {
		const pageNumbers = [];

		// Always show first page
		pageNumbers.push(1);

		// Calculate range around current page
		const startPage = Math.max(2, currentPage - 1);
		const endPage = Math.min(totalPages - 1, currentPage + 1);

		// Add ellipsis after first page if needed
		if (startPage > 2) {
			pageNumbers.push('ellipsis1');
		}

		// Add pages around current page
		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i);
		}

		// Add ellipsis before last page if needed
		if (endPage < totalPages - 1) {
			pageNumbers.push('ellipsis2');
		}

		// Always show last page if there is more than one page
		if (totalPages > 1) {
			pageNumbers.push(totalPages);
		}

		return pageNumbers;
	};

	// Don't render pagination if there's only one page
	if (totalPages <= 1) {
		return null;
	}

	return (
		<Pagination className='my-6'>
			<PaginationContent>
				{/* Previous button */}
				<PaginationItem>
					<PaginationPrevious
						onClick={() => onPageChange(Math.max(1, currentPage - 1))}
						className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
					/>
				</PaginationItem>

				{/* Page numbers */}
				{getPageNumbers().map((page, index) => (
					<PaginationItem key={`page-${page}-${index}`}>
						{page === 'ellipsis1' || page === 'ellipsis2' ? (
							<PaginationEllipsis />
						) : (
							<PaginationLink
								isActive={page === currentPage}
								onClick={() => onPageChange(page)}
								className='cursor-pointer'>
								{page}
							</PaginationLink>
						)}
					</PaginationItem>
				))}

				{/* Next button */}
				<PaginationItem>
					<PaginationNext
						onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
						className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};

export default PaginationControls;
