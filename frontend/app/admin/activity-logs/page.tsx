'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ActivityLog, getActivityLogs } from '@/lib/api/activity-logs';

const formatDate = (value: string) => new Date(value).toLocaleString();

const statusClass = (status: ActivityLog['status']) => {
  return status === 'success'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';
};

const actionLabel = (action: string) =>
  action
    .split('.')
    .map((part) => part.replace(/_/g, ' '))
    .join(' / ');

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getActivityLogs();
        setLogs(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load activity logs';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return logs;

    return logs.filter((log) => {
      return (
        log.action.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        log.status.toLowerCase().includes(query) ||
        (log.userName || '').toLowerCase().includes(query) ||
        (log.userEmail || '').toLowerCase().includes(query) ||
        (log.userRole || '').toLowerCase().includes(query) ||
        (log.entityType || '').toLowerCase().includes(query) ||
        (log.entityId || '').toLowerCase().includes(query)
      );
    });
  }, [logs, searchQuery]);

  const summary = useMemo(() => {
    const successes = logs.filter((log) => log.status === 'success').length;
    const failures = logs.filter((log) => log.status === 'failure').length;
    const authEvents = logs.filter((log) => log.action.startsWith('auth.')).length;
    const paymentEvents = logs.filter((log) => log.action.startsWith('payment.')).length;

    return {
      total: logs.length,
      successes,
      failures,
      authEvents,
      paymentEvents,
    };
  }, [logs]);

  if (isLoading) {
    return <div className="text-center py-8">Loading activity logs...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Activity Logging</h2>
        <p className="text-gray-600">Review user, admin, payment, and security activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Logs</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Success</p>
            <p className="text-2xl font-bold text-green-700">{summary.successes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Failure</p>
            <p className="text-2xl font-bold text-red-600">{summary.failures}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Auth Events</p>
            <p className="text-2xl font-bold text-blue-700">{summary.authEvents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Payment Events</p>
            <p className="text-2xl font-bold text-purple-700">{summary.paymentEvents}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Logs ({filteredLogs.length}{filteredLogs.length !== logs.length ? ` of ${logs.length}` : ''})
            </h3>
            <div className="relative w-full sm:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search action, user, entity, status..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Entity</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                    <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{log.userName || '-'}</p>
                      <p className="text-xs text-gray-500">{log.userEmail || '-'}</p>
                      <p className="text-xs text-gray-500 capitalize">{log.userRole || '-'}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 capitalize">
                      {actionLabel(log.action)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className="block max-w-md">{log.description}</span>
                      {log.ipAddress && (
                        <span className="mt-1 block text-xs text-gray-500">IP: {log.ipAddress}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <p className="capitalize">{log.entityType || '-'}</p>
                      <p className="text-xs text-gray-500 break-all">{log.entityId || '-'}</p>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-gray-500">
                      No activity logs match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
