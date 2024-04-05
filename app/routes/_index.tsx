import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@vercel/remix";
import { sql } from "@vercel/postgres";
import { useLoaderData } from "@remix-run/react";

import styles from "../../public/style.css?url";
import { useRef, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type UserData = { name: string; id: number; count: number };

export const loader: LoaderFunction = async (args) => {
  const { rows } = await sql`SELECT id, name, count FROM likes order by id;`;
  return rows as UserData[];
};

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

function LikeButton({id}: {id: number}) {
  const [loading, setLoading] = useState(false);

  return <button disabled={loading} type="button" onClick={async (e) => {
    e.stopPropagation();

    const url = new URL('https://ne-viru.vercel.app/api/like');
    url.searchParams.append('id', id.toString())

    setLoading(true);
    const r = await fetch(url, {headers: {"X-No-Redirect": "true"}});

    if (r.ok) {
      location.reload();
    }
  }}>
    Like
  </button>
}

function Users({ users }: { users: UserData[] }) {
  return (
    <table>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td width={50}>
              <code>{user.count}</code>
            </td>
            <td>
              <LikeButton id={user.id} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NewUserForm() {
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <h2>Add new user</h2>
      <input ref={nameRef} type="text" name="name" />
      <button disabled={loading} type="button" onClick={async (e) => {
        e.stopPropagation();
        if (!nameRef.current) return;

        const url = new URL('https://ne-viru.vercel.app/api/add');
        url.searchParams.append('name', nameRef.current?.value)

        setLoading(true);

        const r = await fetch(url, {headers: {"x-no-redirect": "true"}});

        if (r.ok) {
          location.reload();
        }
      }}>Add</button>
    </div>
  );
}

export default function Index() {
  const data: UserData[] = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Little likes app</h1>
      <form action="https://ne-viru.vercel.app/api/like">
        {data.length ? <Users users={data} /> : "No users yet :)"}
      </form>
      <br />
      <NewUserForm />
    </div>
  );
}
