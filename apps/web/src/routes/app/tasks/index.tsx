import { convexQuery, useConvexMutation, useConvexPaginatedQuery } from "@convex-dev/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useBlocker, useNavigate } from "@tanstack/react-router"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { api } from "~/api"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Skeleton } from "~/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Textarea } from "~/components/ui/textarea"
import { formatDateTime } from "~/lib/date"

export const Route = createFileRoute("/app/tasks/")({
  component: RouteComponent,
})

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
})

type Task = {
  _id: string
  title: string
  description?: string
  createdAt: number
  updatedAt: number
}

const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "description",
    header: "Description",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => <span>{formatDateTime(row.getValue("createdAt"))}</span>,
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => <span>{formatDateTime(row.getValue("updatedAt"))}</span>,
  },
  {
    header: "Canvas",
    enableHiding: false,
    cell: ({ row }) => (
      <Button variant="link" asChild>
        <Link className="px-2!" to="/app/tasks/$id" params={{ id: row.original._id }}>
          View
        </Link>
      </Button>
    ),
  },
]

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath })
  const [pageNum, setPageNum] = useState(1)
  const [cursors, setCursors] = useState<(string | null)[]>([null])
  const [sorting, setSorting] = useState([])
  const { data, isLoading, status } = useQuery(
    convexQuery(api.tasks.getTasksPage, {
      endIndexKey: cursors[pageNum - 1],
      index: "by_updated",
      pageSize: 10,
      order: "desc",
    }),
  )
  const table = useReactTable({
    data: data?.page ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
  })

  const { mutateAsync } = useMutation({
    mutationFn: useConvexMutation(api.tasks.createTask),
  })

  const onSubmit = async (data: z.infer<typeof createTaskSchema>) => {
    toast.promise(mutateAsync(data), {
      loading: "Creating task...",
      success: (id) => {
        navigate({ to: `/app/tasks/${id}` })

        return "Task created!"
      },
      error: "Failed to create task.",
    })
  }

  return (
    <div className="w-full">
      <h1 className="font-bold text-2xl">Tasks</h1>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription>Create a new task.</DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>The title of the task.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormDescription>A description of the task.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    Create
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? <Skeleton className="h-24 w-full" /> : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="slide-in-from-bottom-50 fade-in ml-2 flex-1 animate-in text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
        )}
        {data?.hasMore ? (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
