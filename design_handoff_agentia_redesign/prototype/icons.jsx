/* icons.jsx — clean line-icon set (lucide-style, currentColor strokes) */
const ICON_PATHS = {
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/>',
  shieldAlert: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M12 8v4M12 15.5v.5"/>',
  shieldCheck: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  database: '<ellipse cx="12" cy="5.5" rx="7" ry="3"/><path d="M5 5.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/><path d="M5 11.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  send: '<path d="M21 3L10.5 13.5M21 3l-6.5 18-4-8-8-4L21 3z"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  activity: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>',
  barChart: '<path d="M4 20V4M4 20h16M9 20v-7M14 20v-11M19 20v-4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
  tag: '<path d="M3 7.5v5l8.5 8.5a2 2 0 002.8 0l5.2-5.2a2 2 0 000-2.8L11 4.5H6A3 3 0 003 7.5z"/><circle cx="7.5" cy="8" r="1.2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5"/>',
  refresh: '<path d="M21 12a9 9 0 11-2.6-6.3M21 4v4h-4"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  externalLink: '<path d="M14 4h6v6M20 4l-9 9M19 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h6"/>',
  xCircle: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  edit: '<path d="M12 20h8M14 4l5 5L8 20H3v-5L14 4z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
  alertCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
  chevronRight: '<path d="M9 6l6 6-6 6"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"/>',
  penTool: '<path d="M12 19l7-7-3-3-7 7-1 4 4-1z"/><path d="M16 9l3 3M12 19L5.5 12.5 3 3l9.5 2.5"/>',
  userCheck: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0111 0M16 11.5l2 2 3.5-3.5"/>',
  layoutGrid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="13" cy="18" r="2"/>',
  github: '<path d="M9 19c-4 1.3-4-2-5.5-2.5M14.5 21v-3.2c0-.9.3-1.5.7-1.9-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 011.2-3.2 4.3 4.3 0 01.1-3.2s1-.3 3.3 1.2a11.3 11.3 0 016 0C16.6 2.9 17.7 3.2 17.7 3.2a4.3 4.3 0 01.1 3.2A4.7 4.7 0 0119 9.6c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.3V21"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4"/>',
  gauge: '<path d="M12 14l4-4M21 14a9 9 0 10-18 0"/><circle cx="12" cy="14" r="1.2"/>',
  inbox: '<path d="M3 12h5l2 3h4l2-3h5M5 5h14l2 7v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6L5 5z"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4-2v-4L3 5z"/>',
  dot: '<circle cx="12" cy="12" r="4"/>',
  command: '<path d="M9 6a3 3 0 10-3 3h12a3 3 0 10-3-3v12a3 3 0 103-3H6a3 3 0 10 3 3V6z"/>',
};

function Icon({ name, size = 18, stroke = 1.75, fill = 'none', className = '', style = {} }) {
  const inner = ICON_PATHS[name] || ICON_PATHS.dot;
  return (
    <svg
      className={className}
      width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

window.Icon = Icon;
