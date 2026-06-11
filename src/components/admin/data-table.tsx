'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ServerForm } from './server-form'
import { deleteServer } from '@/app/actions/servers'

interface DataTableProps {
  data: any[]
}

export function DataTable({ data }: DataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Official</TableHead>
          <TableHead>Remote</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((server) => (
          <TableRow key={server.id}>
            <TableCell className="font-medium">{server.name}</TableCell>
            <TableCell>{server.category}</TableCell>
            <TableCell>{server.isOfficial ? 'Yes' : 'No'}</TableCell>
            <TableCell>{server.isRemote ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <ServerForm mode="edit" server={server} />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    await deleteServer(server.id)
                    window.location.reload()
                  }}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

