export function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400"></div>
        <p className="mt-4 text-amber-200">Загрузка приключений...</p>
      </div>
    </div>
  );
}