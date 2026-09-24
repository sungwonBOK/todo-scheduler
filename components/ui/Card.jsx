export default function Card({ children, className = "", ...props }) {
  return (
    <section
      className={`rounded-[1.65rem] border border-[#ece4d9] bg-white/90 shadow-[0_14px_36px_rgba(78,64,104,0.06)] ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
