import { useState } from 'react';
import { adminService } from '../../services/admin.service';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { type OrderStatus } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, Td, Th, Tr } from '../../components/ui/Table';

const statuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => adminService.listOrders({ status: (status || undefined) as OrderStatus | undefined, search: search || undefined, page, limit: 20 }),
    [search, status, page]
  );

  const orders = data?.items ?? [];
  const meta = data?.meta;

  const changeStatus = async (id: string, next: OrderStatus, current: OrderStatus) => {
    if (next === current) return;
    setUpdatingId(id);
    try {
      await adminService.setOrderStatus(id, next);
      void refetch();
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search order number…"
          aria-label="Search orders"
          className="w-64"
        />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-44" aria-label="Filter by status">
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <p className="text-x-small text-muted">Change status with the row menu to move an order forward.</p>
      </div>

      {loading && <PageLoader />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && (
        <>
          <Table>
            <thead>
              <Tr className="hover:bg-transparent">
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th className="text-right">Total</Th>
                <Th>Status</Th>
                <Th>Update</Th>
              </Tr>
            </thead>
            <TableBody>
              {orders.length === 0 && (
                <Tr className="hover:bg-transparent">
                  <Td colSpan={5} className="py-10 text-center text-muted">
                    No orders match the current filter.
                  </Td>
                </Tr>
              )}
              {orders.map((order) => {
                const user = typeof order.user === 'string' ? null : order.user;
                const itemsCount = order.items.reduce((n, i) => n + i.quantity, 0);
                return (
                  <Tr key={order._id}>
                    <Td>
                      <p className="font-medium text-ink">{order.orderNumber}</p>
                      <p className="text-x-small text-muted">{formatDateTime(order.createdAt)}</p>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <p className="text-body">{user?.name ?? 'Unknown'}</p>
                      <p className="text-x-small text-muted">{user?.email ?? ''}</p>
                    </Td>
                    <Td className="text-right">
                      <p className="font-medium text-ink">{formatCurrency(order.total)}</p>
                      <p className="text-x-small text-muted">{itemsCount} items</p>
                    </Td>
                    <Td>
                      <StatusBadge status={order.status} />
                    </Td>
                    <Td>
                      <Select
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(e) => void changeStatus(order._id, e.target.value as OrderStatus, order.status)}
                        className="w-40"
                        aria-label={`Update status for ${order.orderNumber}`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </Td>
                  </Tr>
                );
              })}
            </TableBody>
          </Table>

          {meta && (
            <div className="flex justify-center">
              <Pagination page={meta.page} totalPages={meta.totalPages} onPage={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}