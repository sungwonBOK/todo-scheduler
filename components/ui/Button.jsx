export default function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-[#2d3559] text-white shadow-[0_10px_20px_rgba(45,53,89,0.18)] hover:bg-[#424c78]",
    secondary: "bg-[#ede9ff] text-[#6252b5] hover:bg-[#e2dcff]",
    ghost: "bg-transparent text-[#727895] hover:bg-[#f5f1ec]",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f7ce7] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
