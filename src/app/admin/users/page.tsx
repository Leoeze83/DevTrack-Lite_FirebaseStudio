
import { UserList } from "@/components/user-list";

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Gestión de Usuarios</h1>
      </div>
      <UserList />
    </div>
  );
}
