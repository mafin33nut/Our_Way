export function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-300"></div>
        <p className="mt-4 text-slate-200">Загрузка приключений...</p>
      </div>
    </div>
  );
}