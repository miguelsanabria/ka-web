const iconSvgs: Record<string, string> = {
  church: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M10.5 4.5h3M12 21v-6M9 15h6M8 21h8M4 21V9l4-3h8l4 3v12M12 9v3M10.5 10.5h3"/></svg>',
  rings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="14" r="4"/><circle cx="15" cy="14" r="4"/><path d="M9 10a6 6 0 0 1 6 0M9 18h6"/></svg>',
  cocktail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l-5 8v7h3M9 18h6M9 3v2"/><path d="M7 5h10"/></svg>',
  hearts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.5-9-8c-1.2-2.2 0-5 2.5-5 1.5 0 2.5 1 3 2 .5-1 1.5-2 3-2 2.5 0 3.7 2.8 2.5 5-2 3.5-9 8-9 8z"/></svg>',
  dinner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 9h8M8 13h8M8 17h8"/></svg>',
  dance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20c1.5-4 4.5-6 8-8 3-1.8 6-5 7-8M14 4c-2 .5-3.5 2-4 4M8 8l-3 3 3 3 3-3"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
};

export function ItineraryIcon({ name }: { name: string }) {
  const svg = iconSvgs[name] || iconSvgs.music;
  return (
    <span style={{ display: "inline-block", width: 24, height: 22 }}>
      <span dangerouslySetInnerHTML={{ __html: iconSvgs[name] || iconSvgs.music }} />
    </span>
  );
}