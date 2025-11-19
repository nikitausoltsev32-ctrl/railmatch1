'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { copy } from '@/lib/i18n/ru';
import { DealStatus } from '@prisma/client';

interface RequestDetail {
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
  updatedAt: string;
  dealStatusHistories: Array<{
    id: number;
    status: DealStatus;
    comment: string | null;
    createdAt: string;
  }>;
  matches: Array<{
    id: number;
    score: number;
    status: string;
    offer: {
      id: number;
      wagonCount: number;
      pricePerWagon: number;
      availableFrom: string;
      availableUntil: string;
      company: {
        name: string;
      };
    };
  }>;
}

interface RequestDetailPageProps {
  params: {
    id: string;
  };
}

function RequestDetailContent({ params }: RequestDetailPageProps) {
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/requests/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Заявка не найдена');
        } else {
          setError('Не удалось загрузить заявку');
        }
        return;
      }

      const data = await response.json();
      setRequest(data);
    } catch (err) {
      setError('Произошла ошибка при загрузке');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const handleCancel = async () => {
    if (!confirm('Вы уверены, что хотите отменить эту заявку?')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await fetch(`/api/requests/${params.id}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      await fetchRequest(); // Refresh data
    } catch (err) {
      setError('Не удалось отменить заявку');
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const getStatus = () => {
    if (!request || request.dealStatusHistories.length === 0) {
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
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCargoTypeLabel = (cargoType: string) => {
    const labels: Record<string, string> = {
      COAL: 'Уголь',
      OIL: 'Нефть и нефтепродукты',
      GRAIN: 'Зерно',
      METAL: 'Металлы',
      CHEMICAL: 'Химикаты',
      TIMBER: 'Лесоматериалы',
      CONTAINER: 'Контейнеры',
      BULK: 'Навалочные грузы',
      OTHER: 'Другое',
    };
    return labels[cargoType] || cargoType;
  };

  const getWagonTypeLabel = (wagonType: string | null) => {
    if (!wagonType) return 'Любой тип';
    const labels: Record<string, string> = {
      TANK: 'Цистерна',
      HOPPER: 'Хоппер',
      FLATCAR: 'Платформа',
      BOXCAR: 'Крытый вагон',
      GONDOLA: 'Полувагон',
      REFRIGERATOR: 'Рефрижератор',
      PLATFORM: 'Платформа',
    };
    return labels[wagonType] || wagonType;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-neutral-600">{copy.common.loading}</div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Ошибка
          </h3>
          <p className="text-neutral-600">
            {error || 'Заявка не найдена'}
          </p>
        </div>
        <Link href="/seeker/requests">
          <Button variant="primary">
            Вернуться к списку
          </Button>
        </Link>
      </div>
    );
  }

  const currentStatus = getStatus();

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {copy.seeker.requests.detailTitle} #{request.id}
          </h1>
          <div className="flex items-center gap-4">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(currentStatus)}`}>
              {getStatusLabel(currentStatus)}
            </span>
            <span className="text-neutral-600">
              Создана: {formatDateTime(request.createdAt)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link href={`/seeker/requests/${request.id}/edit`}>
            <Button variant="outline">
              {copy.seeker.requests.actions.edit}
            </Button>
          </Link>
          
          {currentStatus !== DealStatus.CANCELLED && currentStatus !== DealStatus.COMPLETED && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={cancelling}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              {cancelling ? copy.common.loading : copy.seeker.requests.actions.cancel}
            </Button>
          )}
          
          <Link href="/seeker/requests">
            <Button variant="ghost">
              {copy.common.back}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Information */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Информация о маршруте
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Станция отправления
                </label>
                <p className="text-neutral-900">{request.departureStation}</p>
                <p className="text-sm text-neutral-600">{request.departureRegion}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Станция назначения
                </label>
                <p className="text-neutral-900">{request.arrivalStation}</p>
                <p className="text-sm text-neutral-600">{request.arrivalRegion}</p>
              </div>
            </div>
          </Card>

          {/* Cargo Information */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Информация о грузе
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Тип груза
                </label>
                <p className="text-neutral-900">{getCargoTypeLabel(request.cargoType)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Тип вагона
                </label>
                <p className="text-neutral-900">{getWagonTypeLabel(request.wagonType)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Вес груза
                </label>
                <p className="text-neutral-900">{request.cargoWeight} тонн</p>
              </div>
              {request.maxPricePerWagon && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Макс. цена за вагон
                  </label>
                  <p className="text-neutral-900">₽{request.maxPricePerWagon.toLocaleString('ru-RU')}</p>
                </div>
              )}
            </div>
            {request.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Описание
                </label>
                <p className="text-neutral-900">{request.description}</p>
              </div>
            )}
          </Card>

          {/* Date Information */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Сроки перевозки
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Дата погрузки
                </label>
                <p className="text-neutral-900">{formatDate(request.loadingDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Требуемая дата доставки
                </label>
                <p className="text-neutral-900">{formatDate(request.requiredByDate)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status History */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              {copy.seeker.requests.history.title}
            </h2>
            {request.dealStatusHistories.length > 0 ? (
              <div className="space-y-3">
                {request.dealStatusHistories.map((history) => (
                  <div key={history.id} className="border-l-2 border-primary-200 pl-4 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(history.status)}`}>
                        {getStatusLabel(history.status)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatDateTime(history.createdAt)}
                      </span>
                    </div>
                    {history.comment && (
                      <p className="text-sm text-neutral-600">{history.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 text-sm">
                {copy.seeker.requests.history.noHistory}
              </p>
            )}
          </Card>

          {/* Matches */}
          {request.matches.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Найденные предложения ({request.matches.length})
              </h2>
              <div className="space-y-3">
                {request.matches.map((match) => (
                  <div key={match.id} className="border border-neutral-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {match.offer.company.name}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {match.offer.wagonCount} вагонов • ₽{match.offer.pricePerWagon.toLocaleString('ru-RU')}/вагон
                        </p>
                      </div>
                      <span className="text-sm font-medium text-primary-600">
                        {match.score}%
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {formatDate(match.offer.availableFrom)} - {formatDate(match.offer.availableUntil)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestDetailPage({ params }: RequestDetailPageProps) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-neutral-600">Загрузка...</div></div>}>
      <RequestDetailContent params={params} />
    </Suspense>
  );
}