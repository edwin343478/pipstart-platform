// Static 20x20 stroke icons from the approved PipStart administration design.
// Every value is a constant authored here; nothing user-supplied is rendered.

const paths = {
  home: '<path d="M3 9.5 10 3l7 6.5V17H3z"/><path d="M8 17v-5h4v5"/>',
  book: '<path d="M3 4.5h5a2 2 0 0 1 2 2V17a2 2 0 0 0-2-2H3z"/><path d="M17 4.5h-5a2 2 0 0 0-2 2V17a2 2 0 0 1 2-2h5z"/>',
  users:
    '<circle cx="7.5" cy="7" r="2.5"/><path d="M2.5 16c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/><circle cx="14" cy="8" r="2"/><path d="M14.5 11.8c1.7.3 3 1.7 3 3.7"/>',
  user: '<circle cx="10" cy="7" r="3"/><path d="M4 17c0-3 2.7-5 6-5s6 2 6 5"/>',
  shield:
    '<path d="M10 2.5 16.5 5v4.7c0 3.7-2.6 6.3-6.5 7.8-3.9-1.5-6.5-4.1-6.5-7.8V5z"/><path d="m7.2 10 2 2 3.6-3.8"/>',
  link: '<path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.8.8"/><path d="M11.5 8.5a3 3 0 0 0-4.2 0L4.7 11.1a3 3 0 0 0 4.2 4.2l.8-.8"/>',
  clock: '<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>',
  list: '<path d="M6 5h11M6 10h11M6 15h11"/><circle cx="3" cy="5" r=".6"/><circle cx="3" cy="10" r=".6"/><circle cx="3" cy="15" r=".6"/>',
  check: '<path d="m4 10.5 4 4L16 6"/>',
  alert: '<path d="M10 3 2 17h16z"/><path d="M10 8v4M10 14.5v.5"/>',
  lock: '<rect x="4" y="9" width="12" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/>',
  eye: '<path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z"/><circle cx="10" cy="10" r="2.3"/>',
  edit: '<path d="M3 17l1-4 9-9 3 3-9 9z"/><path d="m12 5 3 3"/>',
  trash: '<path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6"/>',
  restore: '<path d="M4 10a6 6 0 1 0 2-4.5"/><path d="M4 3v3.5h3.5"/>',
  plus: '<path d="M10 4v12M4 10h12"/>',
  search: '<circle cx="9" cy="9" r="5.5"/><path d="m13 13 4 4"/>',
  chevR: '<path d="m8 5 5 5-5 5"/>',
  chevD: '<path d="m5 8 5 5 5-5"/>',
  calendar:
    '<rect x="3" y="4.5" width="14" height="12" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/>',
  key: '<circle cx="7" cy="12" r="3.2"/><path d="m9.5 10 7-7M14 6.5l2 2M12 8.5l1.5 1.5"/>',
  device:
    '<rect x="6" y="2.5" width="8" height="15" rx="2"/><path d="M9 15h2"/>',
  flag: '<path d="M5 17V3.5M5 4h9l-1.5 3L14 10H5"/>',
  layers:
    '<path d="m10 3 7.5 4L10 11 2.5 7z"/><path d="m2.5 10.5 7.5 4 7.5-4"/>',
  grip: '<circle cx="7.5" cy="5" r="1"/><circle cx="12.5" cy="5" r="1"/><circle cx="7.5" cy="10" r="1"/><circle cx="12.5" cy="10" r="1"/><circle cx="7.5" cy="15" r="1"/><circle cx="12.5" cy="15" r="1"/>',
  up: '<path d="m5 12 5-5 5 5"/>',
  down: '<path d="m5 8 5 5 5-5"/>',
  info: '<circle cx="10" cy="10" r="7"/><path d="M10 9v5M10 6.5v.2"/>',
  more: '<circle cx="4.5" cy="10" r="1.2"/><circle cx="10" cy="10" r="1.2"/><circle cx="15.5" cy="10" r="1.2"/>',
  menu: '<path d="M3.5 6h13M3.5 10h13M3.5 14h13"/>',
  x: '<path d="m5 5 10 10M15 5 5 15"/>',
  copy: '<rect x="7" y="7" width="9" height="9" rx="2"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>',
  download: '<path d="M10 3v9m-3.5-3.5L10 12l3.5-3.5M4 16h12"/>',
  ext: '<path d="M8 5H5v10h10v-3M11 4h5v5M16 4l-7 7"/>',
  doc: '<path d="M5 3h7l3 3v11H5z"/><path d="M12 3v3h3M7.5 10h5M7.5 13h5"/>',
  quiz: '<circle cx="10" cy="10" r="7"/><path d="M8 8a2 2 0 1 1 3 1.7c-.7.4-1 .8-1 1.5M10 14v.2"/>',
  refresh:
    '<path d="M16 8a6 6 0 0 0-10.5-2.5L4 7"/><path d="M4 3v4h4"/><path d="M4 12a6 6 0 0 0 10.5 2.5L16 13"/><path d="M16 17v-4h-4"/>',
  send: '<path d="M3 10 17 3l-4 14-3-6z"/><path d="m10 11 7-8"/>',
  pause: '<path d="M7 4v12M13 4v12"/>',
  bell: '<path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 1.5h-13z"/><path d="M8.5 17.5h3"/>',
  filter: '<path d="M3 5h14l-5.5 6.5V16l-3-1.5v-3z"/>',
  server:
    '<rect x="3" y="4" width="14" height="5" rx="1.5"/><rect x="3" y="11" width="14" height="5" rx="1.5"/><path d="M6 6.5h.1M6 13.5h.1"/>',
  globe:
    '<circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3c2.2 2 3 4.5 3 7s-.8 5-3 7c-2.2-2-3-4.5-3-7s.8-5 3-7z"/>',
  sparkle: '<path d="M10 3v4M10 13v4M3 10h4M13 10h4"/>',
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: paths[name] }}
      focusable="false"
      viewBox="0 0 20 20"
    />
  );
}
