
"use client";

import type { FC } from "react";
import Link from "next/link";
import { useUserStore } from "@/lib/hooks/use-user-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Edit, Trash2, Info } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export const UserList: FC = () => {
  const users = useUserStore((state) => state.users);
  const isInitialized = useUserStore((state) => state.isInitialized);

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardDescription>Visualiza y gestiona los usuarios de la aplicación.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/users/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Usuario
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <Alert variant="default" className="bg-accent/10 border-accent/30">
            <Info className="h-5 w-5 text-accent" />
            <AlertTitle>No hay Usuarios</AlertTitle>
            <AlertDescription>
              Aún no se han registrado usuarios. Haz clic en "Crear Usuario" para añadir el primero.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                {/* <TableHead className="text-right">Acciones</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{format(new Date(user.createdAt), "PPP", { locale: es })}</TableCell>
                  {/* 
                  // Acciones de Editar y Eliminar (para futura implementación)
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="mr-2" disabled>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" disabled>
                      <Trash2 className="h-4 w-4 text-destructive" />
                       <span className="sr-only">Eliminar</span>
                    </Button>
                  </TableCell> 
                  */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
