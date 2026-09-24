import { useState } from 'react';
import { adminService } from '../../services/admin.service';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency, formatDate } from '../../utils/format';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Table, TableBody, Td, Th, Tr } from '../../components/ui/Table';

export function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error } = useFetch(
    () => adminService.listCustomers({ search: search || undefined, page, limit: 20 }),
    [search, page]
  );

  const customers = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search name or email…"
          aria-label="Search customers"
          className="w-64"
        />
        <p className="text-x-small text-muted">Only customer accounts are listed; admin accounts are excluded.</p>
      </div>

      {loading && <PageLoader />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && (
        <>
          <Table>
            <thead>
              <Tr className="hover:bg-transparent">
                <Th>Customer</Th>
                <Th>Joined</Th>
                <Th className="text-right">Orders</Th>
                <Th className="text-right">Total spent</Th>
              </Tr>
            </thead>
            <TableBody>
              {customers.length === 0 && (
                <Tr className="hover:bg-transparent">
                  <Td colSpan={4} className="py-10 text-center text-muted">
                    No customers found.
                  </Td>
                </Tr>
              )}
              {customers.map((customer) => (
                <Tr key={customer.id}>
                  <Td>
                    <p className="font-medium text-ink">{customer.name}</p>
                    <p className="text-x-small text-muted">{customer.email}</p>
                  </Td>
                  <Td className="whitespace-nowrap text-body">{formatDate(customer.createdAt)}</Td>
                  <Td className="text-right text-body">{customer.orders}</Td>
                  <Td className="text-right font-medium text-ink">{formatCurrency(customer.spent)}</Td>
                </Tr>
              ))}
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