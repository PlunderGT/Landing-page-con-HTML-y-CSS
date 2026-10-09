import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError, type Task } from './api';

type Status = { type: 'idle' | 'loading' | 'success' | 'error'; text?: string[] };

const colors = { loading: '#eef', success: '#efe', error: '#fee', idle: 'transparent' };

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<Status>({ type: 'loading', text: ['Cargando…'] });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const fail = (e: unknown) =>
    setStatus({
      type: 'error',
      text: e instanceof ApiError ? e.messages : ['No se pudo conectar con el servidor'],
    });

  useEffect(() => {
    api.list()
      .then((data) => { setTasks(data); setStatus({ type: 'idle' }); })
      .catch(fail);
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setStatus({ type: 'loading', text: ['Creando…'] });
    try {
      const created = await api.create({ title, description: description || undefined });
      setTasks((prev) => [...prev, created]); // respuesta confirmada por la API
      setTitle(''); setDescription('');
      setStatus({ type: 'success', text: ['Tarea creada'] });
    } catch (err) { fail(err); }
  }

  async function patch(id: string, data: Partial<Task>) {
    setStatus({ type: 'loading', text: ['Guardando…'] });
    try {
      const updated = await api.update(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      setStatus({ type: 'success', text: ['Tarea actualizada'] });
    } catch (err) { fail(err); }
  }

  async function handleDelete(id: string) {
    setStatus({ type: 'loading', text: ['Eliminando…'] });
    try {
      await api.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setStatus({ type: 'success', text: ['Tarea eliminada'] });
    } catch (err) { fail(err); }
  }

  return (
    <main style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Tareas</h1>

      {/* noValidate y sin minLength: el 400 lo decide el servidor */}
      <form onSubmit={handleCreate} noValidate>
        <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Descripción (opcional)" value={description}
               onChange={(e) => setDescription(e.target.value)} />
        <button disabled={status.type === 'loading'}>Crear</button>
      </form>

      {status.type !== 'idle' && (
        <div role="status" style={{ margin: '1rem 0', padding: '.5rem', background: colors[status.type] }}>
          {status.text?.map((m) => <div key={m}>{m}</div>)}
        </div>
      )}

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            <input type="checkbox" checked={t.done} onChange={() => patch(t.id, { done: !t.done })} />
            {editingId === t.id ? (
              <>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <button onClick={() => patch(t.id, { title: editTitle })}>Guardar</button>
                <button onClick={() => setEditingId(null)}>Cancelar</button>
              </>
            ) : (
              <>
                <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
                <button onClick={() => { setEditingId(t.id); setEditTitle(t.title); }}>Editar</button>
                <button onClick={() => handleDelete(t.id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
