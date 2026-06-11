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
import { ClientForm } from './client-form'
import { deleteClient } from '@/app/actions/clients'

interface ClientDataTableProps {
  data: any[]
}

export function ClientDataTable({ data }: ClientDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Featured</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell className="max-w-xs truncate">{client.url}</TableCell>
            <TableCell>{client.featured ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <ClientForm mode="edit" client={client} />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    await deleteClient(client.id)
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

