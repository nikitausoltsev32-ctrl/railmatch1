'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { copy } from '@/lib/i18n/ru';
import { DealStatus } from '@prisma/client';

const statusOptions = [
  { value: '', label: copy.seeker.requests.filters.all },
  { value: 'PENDING', label: copy.seeker.requests.status.PENDING },
  { value: 'NEGOTIATING', label: copy.seeker.requests.status.NEGOTIATING },
  { value: 'ACCEPTED', label: copy.seeker.requests.status.ACCEPTED },
  { value: 'REJECTED', label: copy.seeker.requests.status.REJECTED },
  { value: 'COMPLETED', label: copy.seeker.requests.status.COMPLETED },
  { value: 'CANCELLED', label: copy.seeker.requests.status.CANCELLED },
];

const wagonTypeOptions = [
  { value: '', label: 'Все типы' },
  { value: 'TANK', label: 'Цистерна' },
  { value: 'HOPPER', label: 'Хоппер' },
  { value: 'FLATCAR', label: 'Платформа' },
  { value: 'BOXCAR', label: 'Крытый вагон' },
  { value: 'GONDOLA', label: 'Полувагон' },
  { value: 'REFRIGERATOR', label: 'Рефрижератор' },
  { value: 'PLATFORM', label: 'Платформа' },
];

interface Request {
  id: number;
  cargoType: string;
  wagonType: string | null;
  cargoWeight: number;
  departureStation: string;
  departureRegion: string;
  arrivalStation: string;
  arrivalRegion: string;
  loadingDate: string;
  requiredByDate: string;
  maxPricePerWagon: number | null;
  description: string | null;
  createdAt: string;
  dealStatusHistories: Array<{
    status: DealStatus;
    createdAt: string;
  }>;
  _count: {
    matches: number;
    threads: number;
  };
}

interface RequestsListProps {
  searchParams: {
    page?: string;
    status?: string;
    wagonType?: string;
    startDate?: string;
    endDate?: string;
  };
}

function RequestsListContent({ searchParams }: RequestsListProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pages: 1,
    total: 0,
  });

  const currentPage = parseInt(searchParams.page || '1');
  const [filters, setFilters] = useState({
    status: searchParams.status || '',
    wagonType: searchParams.wagonType || '',
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || '',
  });

  const fetchRequests = async (page: number, filterValues: typeof filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        ...(filterValues.status && { status: filterValues.status }),
        ...(filterValues.wagonType && { wagonType: filterValues.wagonType }),
        ...(filterValues.startDate && { startDate: filterValues.startDate }),
        ...(filterValues.endDate && { endDate: filterValues.endDate }),
      });

      const response = await fetch(`/api/requests?${params}`);
      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      setRequests(data.requests);
      setPagination({
        currentPage: data.currentPage,
        pages: data.pages,
        total: data.total,
      });
    } catch (err) {
      setError('Не удалось загрузить заявки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage, filters);
  }, [currentPage, filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchRequests(1, newFilters);
  };

  const getStatus = (request: Request) => {
    if (request.dealStatusHistories.length === 0) {
      return DealStatus.PENDING;
    }
    return request.dealStatusHistories[0]?.status || DealStatus.PENDING;
  };

  const getStatusLabel = (status: DealStatus) => {
    return copy.seeker.requests.status[status] || status;
  };

  const getStatusColor = (status: DealStatus) => {
    switch (status) {
      case DealStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case DealStatus.NEGOTIATING:
        return 'bg-blue-100 text-blue-800';
      case DealStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case DealStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case DealStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case DealStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-neutral-600">{copy.common.loading}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {copy.seeker.requests.title}
          </h1>
          <p className="text-neutral-600">
            Всего заявок: {pagination.total}
          </p>
        </div>
        <Link href="/seeker/requests/new">
          <Button variant="primary">
            {copy.seeker.requests.newTitle}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label={copy.seeker.requests.filters.status}
            options={statusOptions}
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          />

          <Select
            label={copy.seeker.requests.filters.wagonType}
            options={wagonTypeOptions}
            value={filters.wagonType}
            onChange={(value) => handleFilterChange('wagonType', value)}
          />

          <Input
            label={copy.seeker.requests.filters.dateRange}
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            placeholder="С даты"
          />

          <Input
            label=" "
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            placeholder="По дату"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            {copy.seeker.requests.empty.title}
          </h3>
          <p className="text-neutral-600 mb-6">
            {copy.seeker.requests.empty.description}
          </p>
          <Link href="/seeker/requests/new">
            <Button variant="primary">
              {copy.seeker.requests.empty.createButton}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Requests Table */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Маршрут
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Груз
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Дата погрузки
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Совпадения
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {requests.map((request) => {
                    const status = getStatus(request);
                    return (
                      <tr key={request.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">
                            {request.departureStation} → {request.arrivalStation}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {request.departureRegion} → {request.arrivalRegion}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">
                            {request.cargoWeight} т
                          </div>
                          <div className="text-sm text-neutral-500">
                            {request.wagonType || 'Любой тип'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {formatDate(request.loadingDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                            {getStatusLabel(status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {request._count.matches}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link href={`/seeker/requests/${request.id}`}>
                              <Button variant="ghost" size="sm">
                                {copy.seeker.requests.actions.view}
                              </Button>
                            </Link>
                            <Link href={`/seeker/requests/${request.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                {copy.seeker.requests.actions.edit}
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage <= 1}
                onClick={() => {
                  const newPage = pagination.currentPage - 1;
                  window.location.href = `/seeker/requests?page=${newPage}&${new URLSearchParams(filters).toString()}`;
                }}
              >
                Назад
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      window.location.href = `/seeker/requests?page=${page}&${new URLSearchParams(filters).toString()}`;
                    }}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage >= pagination.pages}
                onClick={() => {
                  const newPage = pagination.currentPage + 1;
                  window.location.href = `/seeker/requests?page=${newPage}&${new URLSearchParams(filters).toString()}`;
                }}
              >
                Далее
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function RequestsPage({ searchParams }: RequestsListProps) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-neutral-600">Загрузка...</div></div>}>
      <RequestsListContent searchParams={searchParams} />
    </Suspense>
  );
}