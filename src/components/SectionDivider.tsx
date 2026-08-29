export default function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-4 bg-linen py-8" aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50 sm:w-24" />
      <span className="flex items-center justify-center text-gold">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* flor central estilizada */}
          <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
          <path d="M12 12 C12 8, 9.5 6.2, 12 3 C14.5 6.2, 12 8, 12 12 Z" />
          <path d="M12 12 C15.2 10.2, 17.8 11.1, 19.2 8.2 C16.2 7.2, 13.8 9.2, 12 12 Z" />
          <path d="M12 12 C15.2 13.8, 17.8 12.9, 19.2 15.8 C16.2 16.8, 13.8 14.8, 12 12 Z" />
          <path d="M12 12 C8.8 13.8, 6.2 12.9, 4.8 15.8 C7.8 16.8, 10.2 14.8, 12 12 Z" />
          <path d="M12 12 C8.8 10.2, 6.2 11.1, 4.8 8.2 C7.8 7.2, 10.2 9.2, 12 12 Z" />
          <path d="M12 13.6 C12 16.2, 10.2 18.4, 12 21 C13.8 18.4, 12 16.2, 12 13.6 Z" />
        </svg>
      </span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50 sm:w-24" />
    </div>
  );
}
