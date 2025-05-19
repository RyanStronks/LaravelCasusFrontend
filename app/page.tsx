type User = {
  id: number;
  name: string;
  email: string;
};

export default async function Page() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);

  const users: User[] = await response.json();

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user: User) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
