'use client';

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Eye, Film, ImageIcon, Search, UploadCloud } from 'lucide-react';

type Placement =
  | 'HOME_HERO'
  | 'HOME_SECURITY'
  | 'HOME_KYC'
  | 'HOME_CORRIDORS'
  | 'HOME_FAQ'
  | 'ABOUT_HERO'
  | 'CONTACT_HERO'
  | 'LOGIN_HERO'
  | 'REGISTER_HERO'
  | 'DASHBOARD_EMPTY'
  | 'TRANSFER_EMPTY'
  | 'KYC_EMPTY'
  | 'SECURITY_SECTION'
  | 'FOOTER_BACKGROUND';

type Media = {
  id: string;
  title: string;
  slug: string;
  mediaType: 'IMAGE' | 'VIDEO';
  fileUrl: string;
  thumbnailUrl: string | null;
  mobileFileUrl: string | null;
  altText: string | null;
  overlayOpacity: number;
  focalPoint: { x?: number; y?: number } | null;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  published: boolean;
  placements: { placement: Placement }[];
};

const placements: Placement[] = [
  'HOME_HERO',
  'HOME_SECURITY',
  'HOME_KYC',
  'HOME_CORRIDORS',
  'HOME_FAQ',
  'ABOUT_HERO',
  'CONTACT_HERO',
  'LOGIN_HERO',
  'REGISTER_HERO',
  'DASHBOARD_EMPTY',
  'TRANSFER_EMPTY',
  'KYC_EMPTY',
  'SECURITY_SECTION',
  'FOOTER_BACKGROUND'
];

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function MediaManager() {
  const [items, setItems] = useState<Media[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const [placement, setPlacement] = useState<Placement>('HOME_HERO');
  const [file, setFile] = useState<File>();
  const [thumbnail, setThumbnail] = useState<File>();
  const [mobileFile, setMobileFile] = useState<File>();
  const [status, setStatus] = useState('');
  const selected = useMemo(() => items.find((item) => item.id === selectedId), [items, selectedId]);

  useEffect(() => {
    void load();
  }, []);

  async function request(path: string, init?: RequestInit) {
    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      credentials: 'include',
      headers: init?.headers
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  async function load() {
    const data = await request(`/admin/media${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    setItems(data);
    if (!selectedId && data[0]) setSelectedId(data[0].id);
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return setStatus('Primary file is required');
    const form = new FormData(event.currentTarget);
    form.set('file', file);
    if (thumbnail) form.set('thumbnail', thumbnail);
    if (mobileFile) form.set('mobileFile', mobileFile);
    await request('/admin/media', { method: 'POST', body: form });
    setStatus('Media uploaded');
    event.currentTarget.reset();
    setFile(undefined);
    setThumbnail(undefined);
    setMobileFile(undefined);
    await load();
  }

  async function togglePublish(media: Media) {
    await request(`/admin/media/${media.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !media.published })
    });
    await load();
  }

  async function updateOverlay(value: number) {
    if (!selected) return;
    await request(`/admin/media/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overlayOpacity: value })
    });
    await load();
  }

  async function assign() {
    if (!selected) return;
    await request('/admin/media/placements/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placement, mediaId: selected.id })
    });
    setStatus('Placement updated');
    await load();
  }

  async function replaceFiles(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData();
    if (file) form.set('file', file);
    if (thumbnail) form.set('thumbnail', thumbnail);
    if (mobileFile) form.set('mobileFile', mobileFile);
    await request(`/admin/media/${selected.id}/replace`, { method: 'POST', body: form });
    setStatus('Media replaced');
    setFile(undefined);
    setThumbnail(undefined);
    setMobileFile(undefined);
    await load();
  }

  async function updateFocalPoint(x: number, y: number) {
    if (!selected) return;
    await request(`/admin/media/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focalPoint: { x, y } })
    });
    await load();
  }

  async function removeSelected() {
    if (!selected) return;
    await request(`/admin/media/${selected.id}`, { method: 'DELETE' });
    setSelectedId(undefined);
    setStatus('Unused media deleted');
    await load();
  }

  function onDrop(event: DragEvent<HTMLLabelElement>, setter: (file?: File) => void) {
    event.preventDefault();
    setter(event.dataTransfer.files[0]);
  }

  function pick(event: ChangeEvent<HTMLInputElement>, setter: (file?: File) => void) {
    setter(event.target.files?.[0]);
  }

  return (
    <main className="mx-auto max-w-7xl p-5">
      <header className="flex flex-col gap-4 border-b border-black/10 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-black/60">CMS</p>
          <h1 className="text-2xl font-semibold">Media manager</h1>
        </div>
        <label className="flex items-center gap-2 rounded-md border bg-white px-3 py-2">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void load()} placeholder="Search media" />
        </label>
      </header>

      <section className="mt-6 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={create} className="rounded-md border bg-white p-4">
          <h2 className="text-lg font-semibold">Upload media</h2>
          <div className="mt-4 grid gap-3">
            <input name="title" required className="rounded-md border px-3 py-2" placeholder="Title" />
            <input name="slug" required className="rounded-md border px-3 py-2" placeholder="Slug" />
            <select name="mediaType" className="rounded-md border px-3 py-2">
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
            <input name="altText" className="rounded-md border px-3 py-2" placeholder="Alt text" />
            <input name="overlayOpacity" type="number" min="0" max="1" step="0.05" defaultValue="0.45" className="rounded-md border px-3 py-2" />
            <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, setFile)} className="upload-drop">
              <UploadCloud size={18} />
              <span>{file?.name ?? 'Primary image/video'}</span>
              <input hidden type="file" onChange={(event) => pick(event, setFile)} />
            </label>
            <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, setThumbnail)} className="upload-drop">
              <ImageIcon size={18} />
              <span>{thumbnail?.name ?? 'Poster / thumbnail'}</span>
              <input hidden type="file" onChange={(event) => pick(event, setThumbnail)} />
            </label>
            <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, setMobileFile)} className="upload-drop">
              <Film size={18} />
              <span>{mobileFile?.name ?? 'Mobile fallback'}</span>
              <input hidden type="file" onChange={(event) => pick(event, setMobileFile)} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="published" type="checkbox" value="true" /> Publish immediately
            </label>
            <button className="rounded-md bg-[#11221f] px-4 py-2 text-white">Upload</button>
          </div>
        </form>

        <div className="grid gap-5 lg:grid-cols-[minmax(280px,1fr)_380px]">
          <section className="rounded-md border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Library</h2>
              <button onClick={() => void load()} className="text-sm text-black/60">Refresh</button>
            </div>
            <div className="mt-4 grid gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`grid grid-cols-[72px_1fr] gap-3 rounded-md border p-2 text-left ${selectedId === item.id ? 'border-[#11221f]' : 'border-black/10'}`}
                >
                  <div className="overflow-hidden rounded bg-black/5">
                    {item.mediaType === 'VIDEO' ? (
                      <video src={item.fileUrl} poster={item.thumbnailUrl ?? undefined} className="h-16 w-full object-cover" muted />
                    ) : (
                      <img src={item.fileUrl} alt="" className="h-16 w-full object-cover" />
                    )}
                  </div>
                  <span>
                    <strong className="block">{item.title}</strong>
                    <span className="block text-sm text-black/60">{item.slug}</span>
                    <span className="block text-xs text-black/50">{item.placements.map((p) => p.placement).join(', ') || 'Unused'}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-md border bg-white p-4">
            <h2 className="text-lg font-semibold">Preview & placement</h2>
            {selected ? (
              <>
                <div className="relative mt-4 overflow-hidden rounded-md bg-[#0b1624]">
                  {selected.mediaType === 'VIDEO' ? (
                    <video src={selected.fileUrl} poster={selected.thumbnailUrl ?? undefined} className="h-56 w-full object-cover" autoPlay={selected.autoplay} muted={selected.muted} loop={selected.loop} />
                  ) : (
                    <img src={selected.fileUrl} alt={selected.altText ?? ''} className="h-56 w-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black" style={{ opacity: selected.overlayOpacity }} />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded bg-black/50 px-3 py-1 text-sm text-white">
                    <Eye size={14} /> Desktop preview
                  </span>
                </div>
                <div className="mt-3 overflow-hidden rounded-md border bg-[#0b1624] md:hidden">
                  {selected.mediaType === 'VIDEO' ? (
                    <video src={selected.mobileFileUrl ?? selected.fileUrl} poster={selected.thumbnailUrl ?? undefined} className="h-44 w-full object-cover" muted />
                  ) : (
                    <img src={selected.mobileFileUrl ?? selected.fileUrl} alt="" className="h-44 w-full object-cover" />
                  )}
                </div>
                <div className="mt-4 grid gap-3">
                  <label className="grid gap-1 text-sm">
                    Overlay opacity
                    <input type="range" min="0" max="1" step="0.05" value={selected.overlayOpacity} onChange={(event) => void updateOverlay(Number(event.target.value))} />
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <label className="grid gap-1">
                      Focal X
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selected.focalPoint?.x ?? 50}
                        onChange={(event) => void updateFocalPoint(Number(event.target.value), selected.focalPoint?.y ?? 50)}
                      />
                    </label>
                    <label className="grid gap-1">
                      Focal Y
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selected.focalPoint?.y ?? 50}
                        onChange={(event) => void updateFocalPoint(selected.focalPoint?.x ?? 50, Number(event.target.value))}
                      />
                    </label>
                  </div>
                  <label className="grid gap-1 text-sm">
                    Placement
                    <select value={placement} onChange={(event) => setPlacement(event.target.value as Placement)} className="rounded-md border px-3 py-2">
                      {placements.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => void assign()} className="rounded-md bg-[#11221f] px-4 py-2 text-white">Assign</button>
                    <button onClick={() => void togglePublish(selected)} className="rounded-md border px-4 py-2">
                      {selected.published ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                  <form onSubmit={replaceFiles} className="grid gap-2 border-t pt-4">
                    <p className="text-sm font-medium">Replace files</p>
                    <input type="file" onChange={(event) => pick(event, setFile)} />
                    <input type="file" onChange={(event) => pick(event, setThumbnail)} />
                    <input type="file" onChange={(event) => pick(event, setMobileFile)} />
                    <button className="rounded-md border px-4 py-2">Replace selected media</button>
                  </form>
                  {!selected.placements.length && (
                    <button onClick={() => void removeSelected()} className="rounded-md border border-red-200 px-4 py-2 text-red-700">
                      Delete unused media
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-black/60">Select a media item to preview it.</p>
            )}
          </section>
        </div>
      </section>
      {status && <p className="mt-4 text-sm text-[#24594d]">{status}</p>}
    </main>
  );
}
