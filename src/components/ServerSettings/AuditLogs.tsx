import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import CalendarDropdown from '../Common/CustomCalendar';
import CustomDropdown from '../Common/CustomDropdown';

interface AuditLog {
  user_uuid: string;
  entity: string;
  action: string;
  timestamp: string | number | Date;
  id: string;
  changes: string;
}

interface AuditLogsProps {
  server: { id: string };
}

const AuditLogs: React.FC<AuditLogsProps> = ({ server }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [eventType, setEventType] = useState<string>('');
  const [actionType, setActionType] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const logTableRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState({
    start_time: '',
    end_time: '',
    event_type: '',
    action: '',
    per_page: 25,
  });

  // Options for event type dropdown.
  const eventOptions = [
    { value: '', label: 'All Events' },
    { value: 'server', label: 'Server' },
    { value: 'category', label: 'Category' },
    { value: 'server permissions', label: 'Server Permissions' },
    { value: 'roles', label: 'Roles' },
  ];

  const actionOptions = [
    { value: '', label: 'All' },
    { value: 'Update', label: 'Update' },
    { value: 'Create', label: 'Create' },
    { value: 'Delete', label: 'Delete' },
  ];

  // Create refs to hold the current state values.
  const pageRef = useRef(page);
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);

  // Update refs when state changes.
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // Function to fetch logs using current filters and page.
  const fetchLogs = async (pageToFetch: number) => {
    // Use refs to get the latest loading and hasMore values.
    if (loadingRef.current || !hasMoreRef.current) return;
    setLoading(true);
    console.log(filters);
    try {
      const response = await axiosInstance.get(
        `/servers/audit_logs/${server.id}`,
        {
          params: {
            page: pageToFetch,
            per_page: filters.per_page,
            start_time: filters.start_time || undefined,
            end_time: filters.end_time || undefined,
            event_type: filters.event_type || undefined,
            action: filters.action || undefined,
          },
        }
      );
      console.log(response);
      const newLogs: AuditLog[] = response.data.logs;
      setLogs((prevLogs) => [...prevLogs, ...newLogs]);
      if (newLogs.length < filters.per_page) {
        setHasMore(false);
        console.log('more false');
      } else {
        setPage(pageToFetch + 1);
      }
    } catch (error) {
      console.error('Error fetching audit logs', error);
    }
    setLoading(false);
  };

  // Fetch logs on component load and whenever the server id changes.
  useEffect(() => {
    setLogs([]);
    setPage(1);
    setHasMore(true);
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id, filters]);

  // Infinite scrolling: attach the scroll listener only once.
  const handleScroll = () => {
    if (logTableRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logTableRef.current;
      if (
        scrollTop + clientHeight >= scrollHeight - 10 &&
        hasMoreRef.current &&
        !loadingRef.current
      ) {
        fetchLogs(pageRef.current);
      }
    }
  };

  // Handler to apply filters and reset pagination.
  const handleFilter = () => {
    setLogs([]);
    setPage(1);
    setHasMore(true);
    console.log(eventType);
    setFilters((prev) => ({
      ...prev,
      start_time: startDate ? startDate.toISOString().split('T')[0] : '',
      end_time: endDate ? endDate.toISOString().split('T')[0] : '',
      event_type: eventType,
      action: actionType,
    }));
  };
  const resetFilter = () => {
    setFilters({
      start_time: '',
      end_time: '',
      event_type: '',
      per_page: 25,
      action: '',
    });
    setStartDate(null);
    setEndDate(null);
    setEventType('');
  };

  return (
    <div className="bg-bg-primary dark:bg-dark-primary rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Audit Logs</h2>
      </div>
      <div className="flex space-x-4 mb-4 items-center dark:text-black justify-between">
        <div className="flex space-x-4 items-center">
          <div>
            <CalendarDropdown
              value={startDate}
              onChange={setStartDate}
              placeholder="Start Date"
            />
          </div>
          {/* End Date Field */}
          <div>
            <CalendarDropdown
              value={endDate}
              onChange={setEndDate}
              placeholder="End Date"
            />
          </div>
          <CustomDropdown
            options={eventOptions}
            selected={eventType}
            onChange={setEventType}
          />
          {/* Change for actions */}
          <CustomDropdown
            options={actionOptions}
            selected={actionType}
            onChange={setActionType}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="text-white bg-button-primary hover:bg-button-hover rounded-lg px-4 py-2"
            onClick={handleFilter}
          >
            Filter
          </button>
          <button
            className="text-white bg-button-secondary hover:bg-button-hover rounded-lg px-4 py-2"
            onClick={resetFilter}
          >
            Reset
          </button>
        </div>
      </div>
      <div
        className="overflow-y-auto h-screen"
        ref={logTableRef}
        onScroll={handleScroll}
      >
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Performed By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Changes
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {log.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {log.entity
                    .split('_')
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(' ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {log.user_uuid || '-'}
                </td>
                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                  {(() => {
                    try {
                      const parsed = JSON.parse(log.changes);
                      return (
                        <pre className="text-xs">
                          {JSON.stringify(parsed, null, 2)}
                        </pre>
                      );
                    } catch (e) {
                      return log.changes;
                    }
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default AuditLogs;
