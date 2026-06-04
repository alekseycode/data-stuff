export default function ErrorMessage({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <span className="text-4xl">⚠️</span>
      <p className="text-red-400 font-medium">{message || 'Something went wrong.'}</p>
    </div>
  )
}
