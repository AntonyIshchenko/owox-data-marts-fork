import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@owox/ui/components/table';

import { Button } from '@owox/ui/components/button';
import { Input } from '@owox/ui/components/input';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@owox/ui/components/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@owox/ui/components/alert-dialog';
import { ChevronDown, Check, Search, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  deleteDataMart: (id: string) => Promise<void>;
  refetchDataMarts: () => Promise<void>;
}

export function DataMartTable<TData, TValue>({
  columns,
  data,
  deleteDataMart,
  refetchDataMarts,
}: DataTableProps<TData, TValue>) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'title', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBatchDelete = async () => {
    try {
      setIsDeleting(true);

      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map(row => (row.original as { id: string }).id);

      for (const id of selectedIds) {
        await deleteDataMart(id);
      }

      toast.success(
        `Successfully deleted ${String(selectedIds.length)} data mart${selectedIds.length !== 1 ? 's' : ''}`
      );
      setRowSelection({});
      await refetchDataMarts();
    } catch (error) {
      console.error('Error deleting data marts:', error);
      toast.error('Failed to delete some data marts. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const hasSelectedRows = Object.keys(rowSelection).length > 0;

  const table = useReactTable({
    data,
    columns: [
      {
        id: 'select',
        header: ({ table }) => (
          <button
            type='button'
            role='checkbox'
            aria-checked={table.getIsAllRowsSelected()}
            data-state={table.getIsAllRowsSelected() ? 'checked' : 'unchecked'}
            aria-label='Select all rows'
            className='peer border-input dark:bg-input/30 data-[state=checked]:bg-brand-blue-500 data-[state=checked]:text-brand-blue-500-foreground dark:data-[state=checked]:bg-brand-blue-500 data-[state=checked]:border-brand-blue-500 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50'
            onClick={table.getToggleAllRowsSelectedHandler()}
          >
            {table.getIsAllRowsSelected() && (
              <span
                data-state='checked'
                data-slot='checkbox-indicator'
                className='pointer-events-none flex items-center justify-center text-current transition-none'
              >
                <Check className='size-3.5' />
              </span>
            )}
          </button>
        ),
        cell: ({ row }) => (
          <button
            type='button'
            role='checkbox'
            aria-checked={row.getIsSelected()}
            data-state={row.getIsSelected() ? 'checked' : 'unchecked'}
            aria-label='Select row'
            className='peer border-input dark:bg-input/30 data-[state=checked]:bg-brand-blue-500 data-[state=checked]:text-brand-blue-500-foreground dark:data-[state=checked]:bg-brand-blue-500 data-[state=checked]:border-brand-blue-500 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50'
            onClick={row.getToggleSelectedHandler()}
          >
            {row.getIsSelected() && (
              <span
                data-state='checked'
                data-slot='checkbox-indicator'
                className='pointer-events-none flex items-center justify-center text-current transition-none'
              >
                <Check className='size-3.5' />
              </span>
            )}
          </button>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
  });

  return (
    <div>
      <Toaster />
      <div className='flex items-center pb-4'>
        <div className='relative w-sm'>
          <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
          <Input
            placeholder='Search by title'
            value={table.getColumn('title')?.getFilterValue() as string}
            onChange={event => table.getColumn('title')?.setFilterValue(event.target.value)}
            className='pl-8'
          />
        </div>
        {hasSelectedRows && (
          <Button
            variant='destructive'
            size='sm'
            className='ml-2 flex items-center gap-1'
            onClick={() => {
              setShowDeleteConfirmation(true);
            }}
            disabled={isDeleting}
          >
            <Trash2 className='h-4 w-4' />
            Delete
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto font-normal'>
              Show columns <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuItem key={column.id} className='capitalize'>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={column.getIsVisible()}
                        onChange={e => {
                          column.toggleVisibility(e.target.checked);
                        }}
                        className='h-4 w-4'
                      />
                      <span>{column.id}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='w-full rounded-md border'>
        <Table>
          <TableHeader className='bg-muted'>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      className='[&:has([role=checkbox])]:pl-5 [&>[role=checkbox]]:translate-y-[2px]'
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='hover:bg-muted/50 cursor-pointer'
                  onClick={e => {
                    if (
                      e.target instanceof HTMLElement &&
                      (e.target.closest('[role="checkbox"]') ||
                        e.target.closest('.actions-cell') ||
                        e.target.closest('[role="menuitem"]') ||
                        e.target.closest('[data-state="open"]'))
                    ) {
                      return;
                    }
                    const id = (row.original as { id: string }).id;
                    void navigate(`/data-marts/${id}/overview`);
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className={`[&:has([role=checkbox])]pr-0 px-5 whitespace-normal [&>[role=checkbox]]:translate-y-[2px] ${cell.column.id === 'actions' ? 'actions-cell' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete {Object.keys(rowSelection).length} selected data mart
              {Object.keys(rowSelection).length !== 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleBatchDelete();
              }}
              disabled={isDeleting}
              className='bg-destructive hover:bg-destructive/90'
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
