import { useState, type FormEvent } from 'react';
import { categoryService } from '../../services/category.service';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { Table, TableBody, Td, Th, Tr } from '../../components/ui/Table';

export function AdminCategoriesPage() {
  const { data: categories, loading, error, refetch } = useFetch(() => categoryService.list(), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (id: string, currentName: string) => {
    setEditing(id);
    setName(currentName);
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      if (editing) await categoryService.update(editing, name);
      else await categoryService.create(name);
      setModalOpen(false);
      void refetch();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteBusy(true);
    try {
      await categoryService.remove(deleteId);
      setDeleteId(null);
      void refetch();
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-small text-muted">
          Categories organize the storefront. A category with books assigned cannot be deleted.
        </p>
        <Button onClick={openCreate}>Add category</Button>
      </div>

      {loading && <PageLoader />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && (
        <Table>
          <thead>
            <Tr className="hover:bg-transparent">
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </thead>
          <TableBody>
            {(categories ?? []).map((category) => (
              <Tr key={category._id}>
                <Td className="font-medium text-ink">{category.name}</Td>
                <Td className="text-muted">/{category.slug}</Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(category._id, category.name)}>
                      Rename
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteId(category._id)}>
                      Delete
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Rename category' : 'Add category'}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
      >
        <form onSubmit={submit} className="space-y-4" noValidate>
          {formError && <ErrorMessage message={formError} />}
          <Field label="Category name" htmlFor="cat-name">
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoFocus />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete category"
        message="Delete this category? If books are assigned to it, deletion will be blocked."
        confirmLabel="Delete"
        destructive
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}